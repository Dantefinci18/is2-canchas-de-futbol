const { z } = require('zod');
const canchaService = require('../services/canchaService');
const { asyncHandler } = require('../utils/asyncHandler');

const TIPOS_CANCHA = ['FUTBOL_5', 'FUTBOL_7', 'FUTBOL_11'];

const canchaSchema = z.object({
  nombre: z.string().min(1),
  tipo: z.enum(TIPOS_CANCHA),
  precioHora: z.number().positive(),
  techada: z.boolean().optional(),
  recargoNocturnoPct: z.number().min(0).max(200).optional(),
  recargoFinDeSemanaPct: z.number().min(0).max(200).optional(),
});

const actualizarSchema = canchaSchema.partial().extend({
  activa: z.boolean().optional(),
});

// RF9: alta de una cancha dentro de un complejo propio.
const crear = asyncHandler(async (req, res) => {
  const datos = canchaSchema.parse(req.body);
  const cancha = await canchaService.crear(req.usuario.id, req.params.complejoId, datos);
  res.status(201).json(cancha);
});

// RF9: modificar canchas, precios y tarifas.
const actualizar = asyncHandler(async (req, res) => {
  const datos = actualizarSchema.parse(req.body);
  const cancha = await canchaService.actualizar(req.usuario.id, req.params.id, datos);
  res.json(cancha);
});

// RF9: desactivar una cancha.
const desactivar = asyncHandler(async (req, res) => {
  const cancha = await canchaService.desactivar(req.usuario.id, req.params.id);
  res.json(cancha);
});

const listarPorComplejo = asyncHandler(async (req, res) => {
  const canchas = await canchaService.listarPorComplejo(req.params.complejoId);
  res.json(canchas);
});

module.exports = { crear, actualizar, desactivar, listarPorComplejo };
