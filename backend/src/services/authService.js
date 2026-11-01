const bcrypt = require('bcryptjs');
const { prisma } = require('../config/prisma');
const { AppError } = require('../utils/AppError');
const { firmarToken } = require('../utils/jwt');

const SALT_ROUNDS = 10;

function aUsuarioPublico(usuario) {
  const { contrasenaHash, ...publico } = usuario; // eslint-disable-line no-unused-vars
  return publico;
}

async function registrar({ nombre, email, password, telefono, rol }) {
  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    throw new AppError('Ya existe una cuenta con ese email', 409);
  }

  const contrasenaHash = await bcrypt.hash(password, SALT_ROUNDS);
  const usuario = await prisma.usuario.create({
    data: { nombre, email, telefono, rol, contrasenaHash },
  });

  const token = firmarToken({ id: usuario.id, email: usuario.email, rol: usuario.rol });
  return { token, usuario: aUsuarioPublico(usuario) };
}

async function login({ email, password }) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) {
    throw new AppError('Credenciales invalidas', 401);
  }

  const coincide = await bcrypt.compare(password, usuario.contrasenaHash);
  if (!coincide) {
    throw new AppError('Credenciales invalidas', 401);
  }

  const token = firmarToken({ id: usuario.id, email: usuario.email, rol: usuario.rol });
  return { token, usuario: aUsuarioPublico(usuario) };
}

async function obtenerPerfil(usuarioId) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    include: { complejo: true },
  });
  if (!usuario) {
    throw new AppError('Usuario no encontrado', 404);
  }
  return aUsuarioPublico(usuario);
}

module.exports = { registrar, login, obtenerPerfil, aUsuarioPublico };
