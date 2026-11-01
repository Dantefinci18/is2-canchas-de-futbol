const { prisma } = require('../config/prisma');
const { AppError } = require('../utils/AppError');

// Equivale a BuscadorComplejos.buscar(zona, fecha, tipo) del diagrama de
// clases: busca entre todos los complejos de la plataforma los que tienen
// canchas activas del tipo pedido en la zona indicada. El filtro por
// disponibilidad puntual de `fecha` se resuelve despues, cancha por cancha,
// en reservaService.turnosLibres (evita recalcular agenda completa aca).
async function buscar({ zona, tipo }) {
  return prisma.complejo.findMany({
    where: {
      ...(zona ? { zona: { contains: zona, mode: 'insensitive' } } : {}),
      canchas: {
        some: {
          activa: true,
          ...(tipo ? { tipo } : {}),
        },
      },
    },
    include: {
      canchas: { where: { activa: true, ...(tipo ? { tipo } : {}) } },
    },
    orderBy: { nombre: 'asc' },
  });
}

async function obtenerPorId(id) {
  const complejo = await prisma.complejo.findUnique({
    where: { id },
    include: { canchas: true },
  });
  if (!complejo) {
    throw new AppError('Complejo no encontrado', 404);
  }
  return complejo;
}

async function obtenerPropio(administradorId) {
  const complejo = await prisma.complejo.findUnique({
    where: { administradorId },
    include: { canchas: true },
  });
  if (!complejo) {
    throw new AppError('Todavia no registraste tu complejo', 404);
  }
  return complejo;
}

// RF2: el administrador registra su complejo (nombre, direccion, zona y horarios).
async function crear(administradorId, datos) {
  const existente = await prisma.complejo.findUnique({ where: { administradorId } });
  if (existente) {
    throw new AppError('Ya registraste un complejo con esta cuenta', 409);
  }
  if (datos.horaApertura >= datos.horaCierre) {
    throw new AppError('La hora de apertura debe ser anterior a la de cierre', 400);
  }

  return prisma.complejo.create({
    data: { ...datos, administradorId },
  });
}

// Garantiza la confidencialidad (RNF4): un administrador solo puede
// modificar su propio complejo.
async function actualizar(administradorId, complejoId, datos) {
  const complejo = await prisma.complejo.findUnique({ where: { id: complejoId } });
  if (!complejo) {
    throw new AppError('Complejo no encontrado', 404);
  }
  if (complejo.administradorId !== administradorId) {
    throw new AppError('No tenes permisos sobre este complejo', 403);
  }

  return prisma.complejo.update({
    where: { id: complejoId },
    data: datos,
  });
}

module.exports = { buscar, obtenerPorId, obtenerPropio, crear, actualizar };
