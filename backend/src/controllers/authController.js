const { z } = require('zod');
const authService = require('../services/authService');
const { asyncHandler } = require('../utils/asyncHandler');

const registroSchema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  telefono: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// RF1: el jugador puede registrarse e iniciar sesion.
const registrarJugador = asyncHandler(async (req, res) => {
  const datos = registroSchema.parse(req.body);
  const resultado = await authService.registrar({ ...datos, rol: 'JUGADOR' });
  res.status(201).json(resultado);
});

// El administrador tambien se registra con rol diferenciado (luego crea su
// complejo con POST /api/complejos).
const registrarAdministrador = asyncHandler(async (req, res) => {
  const datos = registroSchema.parse(req.body);
  const resultado = await authService.registrar({ ...datos, rol: 'ADMINISTRADOR' });
  res.status(201).json(resultado);
});

const login = asyncHandler(async (req, res) => {
  const datos = loginSchema.parse(req.body);
  const resultado = await authService.login(datos);
  res.json(resultado);
});

const perfil = asyncHandler(async (req, res) => {
  const usuario = await authService.obtenerPerfil(req.usuario.id);
  res.json(usuario);
});

module.exports = { registrarJugador, registrarAdministrador, login, perfil };
