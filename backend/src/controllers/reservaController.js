const { z } = require('zod');
const reservaService = require('../services/reservaService');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/AppError');

const fechaSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha esperado: YYYY-MM-DD');

const crearReservaSchema = z.object({
  canchaId: z.string().uuid(),
  fecha: fechaSchema,
  horaInicio: z.number().int().min(0).max(23),
  horaFin: z.number().int().min(1).max(24),
});

function requireFechaQuery(req) {
  const { fecha } = req.query;
  const parsed = fechaSchema.safeParse(fecha);
  if (!parsed.success) {
    throw new AppError('El parametro fecha es obligatorio (YYYY-MM-DD)', 400);
  }
  return parsed.data;
}

// RF4: turnos libres de una cancha puntual.
const turnosLibresPorCancha = asyncHandler(async (req, res) => {
  const fecha = requireFechaQuery(req);
  const turnos = await reservaService.turnosLibresPorCancha(req.params.canchaId, fecha);
  res.json(turnos);
});

// RF3/RF4: turnos libres de todas las canchas de un complejo.
const turnosLibresPorComplejo = asyncHandler(async (req, res) => {
  const fecha = requireFechaQuery(req);
  const { tipo } = req.query;
  const turnos = await reservaService.turnosLibresPorComplejo(req.params.complejoId, fecha, tipo);
  res.json(turnos);
});

// RF6/RF7/RF11: crear una reserva (bloqueo temporal a la espera de la sena).
const crear = asyncHandler(async (req, res) => {
  const datos = crearReservaSchema.parse(req.body);
  const reserva = await reservaService.crearReserva(req.usuario.id, datos);
  res.status(201).json(reserva);
});

// Pago de la sena simulado (mock), confirma la reserva.
const pagarSena = asyncHandler(async (req, res) => {
  const reserva = await reservaService.pagarSena(req.usuario.id, req.params.id);
  res.json(reserva);
});

// RF8: cancelar una reserva (con devolucion de sena si corresponde).
const cancelar = asyncHandler(async (req, res) => {
  const reserva = await reservaService.cancelarReserva(req.usuario.id, req.params.id);
  res.json(reserva);
});

const misReservas = asyncHandler(async (req, res) => {
  const reservas = await reservaService.misReservas(req.usuario.id);
  res.json(reservas);
});

// RF10: agenda diaria del complejo del administrador.
const agendaDelDia = asyncHandler(async (req, res) => {
  const fecha = requireFechaQuery(req);
  const reservas = await reservaService.agendaDelDia(req.usuario.id, req.params.complejoId, fecha);
  res.json(reservas);
});

// RF10: registrar el pago del saldo restante.
const registrarPagoSaldo = asyncHandler(async (req, res) => {
  const pago = await reservaService.registrarPagoSaldo(req.usuario.id, req.params.id);
  res.status(201).json(pago);
});

module.exports = {
  turnosLibresPorCancha,
  turnosLibresPorComplejo,
  crear,
  pagarSena,
  cancelar,
  misReservas,
  agendaDelDia,
  registrarPagoSaldo,
};
