const { z } = require('zod');
const complejoService = require('../services/complejoService');
const { asyncHandler } = require('../utils/asyncHandler');

const complejoSchema = z.object({
  nombre: z.string().min(2),
  direccion: z.string().min(3),
  zona: z.string().min(2),
  horaApertura: z.number().int().min(0).max(23),
  horaCierre: z.number().int().min(1).max(24),
});

// RF3/RF5: el jugador busca complejos por zona y tipo de cancha.
const buscar = asyncHandler(async (req, res) => {
  const { zona, tipo } = req.query;
  const complejos = await complejoService.buscar({ zona, tipo });
  res.json(complejos);
});

const obtenerPorId = asyncHandler(async (req, res) => {
  const complejo = await complejoService.obtenerPorId(req.params.id);
  res.json(complejo);
});

const misComplejo = asyncHandler(async (req, res) => {
  const complejo = await complejoService.obtenerPropio(req.usuario.id);
  res.json(complejo);
});

// RF2: el administrador registra su complejo.
const crear = asyncHandler(async (req, res) => {
  const datos = complejoSchema.parse(req.body);
  const complejo = await complejoService.crear(req.usuario.id, datos);
  res.status(201).json(complejo);
});

const actualizar = asyncHandler(async (req, res) => {
  const datos = complejoSchema.partial().parse(req.body);
  const complejo = await complejoService.actualizar(req.usuario.id, req.params.id, datos);
  res.json(complejo);
});

module.exports = { buscar, obtenerPorId, misComplejo, crear, actualizar };
