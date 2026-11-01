const { Prisma } = require('@prisma/client');
const { prisma } = require('../config/prisma');
const { AppError } = require('../utils/AppError');
const { SelectorTarifa } = require('../strategies/SelectorTarifa');
const { porcentajeSena, minutosExpiracionSena } = require('../config/env');

const selectorTarifa = new SelectorTarifa();
const ESTADOS_ACTIVOS = ['PENDIENTE_SENA', 'CONFIRMADA'];

function combinarFechaHora(fecha, hora) {
  const base = new Date(fecha);
  const resultado = new Date(Date.UTC(
    base.getUTCFullYear(),
    base.getUTCMonth(),
    base.getUTCDate(),
    hora,
  ));
  return resultado;
}

function seSuperponen(inicioA, finA, inicioB, finB) {
  // Dos intervalos se pisan cuando el inicio de uno es anterior al fin del
  // otro y su fin es posterior al inicio del otro (seccion 6 del TP).
  return inicioA < finB && finA > inicioB;
}

// Trae las reservas "activas" de una cancha en una fecha: confirmadas, o
// pendientes de sena cuya expiracion todavia no paso (pseudocodigo 6.1).
async function obtenerReservasActivas(canchaId, fecha) {
  const ahora = new Date();
  return prisma.reserva.findMany({
    where: {
      canchaId,
      fecha: new Date(fecha),
      OR: [
        { estado: 'CONFIRMADA' },
        { estado: 'PENDIENTE_SENA', fechaExpiracion: { gt: ahora } },
      ],
    },
  });
}

function calcularPrecioCancha(cancha, fecha, hora) {
  const estrategia = selectorTarifa.seleccionar(fecha, hora, {
    recargoNocturnoPct: Number(cancha.recargoNocturnoPct),
    recargoFinDeSemanaPct: Number(cancha.recargoFinDeSemanaPct),
  });
  return estrategia.calcular(Number(cancha.precioHora));
}

// RF4: turnos libres de una cancha para una fecha, generados hora a hora
// entre la apertura y el cierre del complejo, excluyendo los ya ocupados.
async function turnosLibresPorCancha(canchaId, fecha) {
  const cancha = await prisma.cancha.findUnique({ where: { id: canchaId }, include: { complejo: true } });
  if (!cancha) {
    throw new AppError('Cancha no encontrada', 404);
  }
  if (!cancha.activa) {
    return [];
  }

  const reservasActivas = await obtenerReservasActivas(canchaId, fecha);
  const slots = [];
  for (let hora = cancha.complejo.horaApertura; hora < cancha.complejo.horaCierre; hora += 1) {
    const ocupado = reservasActivas.some((r) => seSuperponen(hora, hora + 1, r.horaInicio, r.horaFin));
    if (!ocupado) {
      const precio = calcularPrecioCancha(cancha, fecha, hora);
      slots.push({
        horaInicio: hora,
        horaFin: hora + 1,
        precio: Number(precio.toFixed(2)),
        sena: Number((precio * porcentajeSena).toFixed(2)),
      });
    }
  }
  return slots;
}

// RF3/RF4: turnos libres de todas las canchas de un complejo (opcionalmente
// filtradas por tipo) para una fecha dada.
async function turnosLibresPorComplejo(complejoId, fecha, tipo) {
  const canchas = await prisma.cancha.findMany({
    where: { complejoId, activa: true, ...(tipo ? { tipo } : {}) },
  });

  const resultado = [];
  for (const cancha of canchas) {
    const turnos = await turnosLibresPorCancha(cancha.id, fecha);
    resultado.push({
      cancha: { id: cancha.id, nombre: cancha.nombre, tipo: cancha.tipo, techada: cancha.techada },
      turnos,
    });
  }
  return resultado;
}

// Algoritmo central (seccion 6 del TP): crea una reserva bloqueando el
// turno hasta que se confirme (o expire) el pago de la sena.
async function crearReserva(jugadorId, { canchaId, fecha, horaInicio, horaFin }) {
  if (horaInicio >= horaFin) {
    throw new AppError('El horario de la reserva es invalido', 400);
  }

  const cancha = await prisma.cancha.findUnique({ where: { id: canchaId }, include: { complejo: true } });
  if (!cancha) {
    throw new AppError('Cancha no encontrada', 404);
  }

  const complejo = cancha.complejo;
  if (!cancha.activa || horaInicio < complejo.horaApertura || horaFin > complejo.horaCierre) {
    throw new AppError('Turno invalido para esta cancha', 400);
  }

  const reservasActivas = await obtenerReservasActivas(canchaId, fecha);
  const haySuperposicion = reservasActivas.some((r) => seSuperponen(horaInicio, horaFin, r.horaInicio, r.horaFin));
  if (haySuperposicion) {
    throw new AppError('Turno no disponible', 409);
  }

  const precio = calcularPrecioCancha(cancha, fecha, horaInicio);
  const sena = precio * porcentajeSena;
  const fechaExpiracion = new Date(Date.now() + minutosExpiracionSena * 60 * 1000);

  try {
    return await prisma.reserva.create({
      data: {
        canchaId,
        jugadorId,
        fecha: new Date(fecha),
        horaInicio,
        horaFin,
        estado: 'PENDIENTE_SENA',
        montoTotal: precio,
        montoSena: sena,
        fechaExpiracion,
      },
      include: { cancha: { include: { complejo: true } } },
    });
  } catch (err) {
    // Segunda barrera (RNF3): el indice unico parcial de la base de datos
    // rechaza una reserva activa duplicada aunque haya pasado la
    // verificacion anterior (condicion de carrera entre dos jugadores).
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new AppError('Turno no disponible', 409);
    }
    throw err;
  }
}

// Pago de la sena (simulado/mock): confirma la reserva si todavia esta
// dentro de la ventana de los 10 minutos (RF11).
async function pagarSena(jugadorId, reservaId) {
  const reserva = await prisma.reserva.findUnique({ where: { id: reservaId } });
  if (!reserva) {
    throw new AppError('Reserva no encontrada', 404);
  }
  if (reserva.jugadorId !== jugadorId) {
    throw new AppError('No tenes permisos sobre esta reserva', 403);
  }
  if (reserva.estado !== 'PENDIENTE_SENA') {
    throw new AppError('La reserva no esta pendiente de pago', 400);
  }
  if (reserva.fechaExpiracion && reserva.fechaExpiracion < new Date()) {
    throw new AppError('El turno expiro, volve a reservarlo', 400);
  }

  return prisma.$transaction(async (tx) => {
    await tx.pago.create({
      data: { reservaId, monto: reserva.montoSena, tipo: 'SENA', estado: 'CONFIRMADO' },
    });
    return tx.reserva.update({
      where: { id: reservaId },
      data: { estado: 'CONFIRMADA', fechaExpiracion: null },
    });
  });
}

// RF8: cancelar una reserva; la sena se devuelve si se cancela con 24 h o
// mas de anticipacion respecto del inicio del turno.
async function cancelarReserva(jugadorId, reservaId) {
  const reserva = await prisma.reserva.findUnique({ where: { id: reservaId } });
  if (!reserva) {
    throw new AppError('Reserva no encontrada', 404);
  }
  if (reserva.jugadorId !== jugadorId) {
    throw new AppError('No tenes permisos sobre esta reserva', 403);
  }
  if (!ESTADOS_ACTIVOS.includes(reserva.estado)) {
    throw new AppError('La reserva ya no se puede cancelar', 400);
  }

  const inicioTurno = combinarFechaHora(reserva.fecha, reserva.horaInicio);
  const horasAnticipacion = (inicioTurno.getTime() - Date.now()) / (1000 * 60 * 60);
  const corresponeDevolucion = horasAnticipacion >= 24 && reserva.estado === 'CONFIRMADA';

  return prisma.$transaction(async (tx) => {
    if (corresponeDevolucion) {
      await tx.pago.create({
        data: { reservaId, monto: reserva.montoSena, tipo: 'DEVOLUCION', estado: 'CONFIRMADO' },
      });
    }
    return tx.reserva.update({
      where: { id: reservaId },
      data: { estado: 'CANCELADA', canceladaEn: new Date() },
    });
  });
}

async function misReservas(jugadorId) {
  return prisma.reserva.findMany({
    where: { jugadorId },
    include: { cancha: { include: { complejo: true } }, pagos: true },
    orderBy: [{ fecha: 'desc' }, { horaInicio: 'desc' }],
  });
}

// RF10: agenda diaria del complejo para el administrador.
async function agendaDelDia(administradorId, complejoId, fecha) {
  const complejo = await prisma.complejo.findUnique({ where: { id: complejoId } });
  if (!complejo) {
    throw new AppError('Complejo no encontrado', 404);
  }
  if (complejo.administradorId !== administradorId) {
    throw new AppError('No tenes permisos sobre este complejo', 403);
  }

  return prisma.reserva.findMany({
    where: {
      fecha: new Date(fecha),
      cancha: { complejoId },
      estado: { not: 'EXPIRADA' },
    },
    include: { cancha: true, jugador: { select: { id: true, nombre: true, telefono: true, email: true } }, pagos: true },
    orderBy: { horaInicio: 'asc' },
  });
}

// RF10: el administrador registra el pago del saldo restante.
async function registrarPagoSaldo(administradorId, reservaId) {
  const reserva = await prisma.reserva.findUnique({
    where: { id: reservaId },
    include: { cancha: { include: { complejo: true } }, pagos: true },
  });
  if (!reserva) {
    throw new AppError('Reserva no encontrada', 404);
  }
  if (reserva.cancha.complejo.administradorId !== administradorId) {
    throw new AppError('No tenes permisos sobre esta reserva', 403);
  }
  if (reserva.estado !== 'CONFIRMADA') {
    throw new AppError('Solo se puede registrar el saldo de una reserva confirmada', 400);
  }
  const yaTienePagoSaldo = reserva.pagos.some((p) => p.tipo === 'SALDO');
  if (yaTienePagoSaldo) {
    throw new AppError('El saldo ya fue registrado', 400);
  }

  const saldo = Number(reserva.montoTotal) - Number(reserva.montoSena);
  return prisma.pago.create({
    data: { reservaId, monto: saldo, tipo: 'SALDO', estado: 'CONFIRMADO' },
  });
}

// RF11: expira (libera) las reservas pendientes de sena cuyo plazo vencio.
// Se ejecuta periodicamente desde un job en background (ver jobs/expiracion).
async function expirarReservasVencidas() {
  const { count } = await prisma.reserva.updateMany({
    where: { estado: 'PENDIENTE_SENA', fechaExpiracion: { lt: new Date() } },
    data: { estado: 'EXPIRADA' },
  });
  return count;
}

module.exports = {
  turnosLibresPorCancha,
  turnosLibresPorComplejo,
  crearReserva,
  pagarSena,
  cancelarReserva,
  misReservas,
  agendaDelDia,
  registrarPagoSaldo,
  expirarReservasVencidas,
};
