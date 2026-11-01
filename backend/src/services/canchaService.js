const { prisma } = require('../config/prisma');
const { AppError } = require('../utils/AppError');

// Centraliza la verificacion de que la cancha pertenece al complejo del
// administrador autenticado (RNF4: confidencialidad entre complejos).
async function obtenerCanchaDelAdministrador(administradorId, canchaId) {
  const cancha = await prisma.cancha.findUnique({
    where: { id: canchaId },
    include: { complejo: true },
  });
  if (!cancha) {
    throw new AppError('Cancha no encontrada', 404);
  }
  if (cancha.complejo.administradorId !== administradorId) {
    throw new AppError('No tenes permisos sobre esta cancha', 403);
  }
  return cancha;
}

// RF9: el administrador da de alta canchas de su complejo, con su precio y
// la configuracion de recargos que alimenta el patron Strategy.
async function crear(administradorId, complejoId, datos) {
  const complejo = await prisma.complejo.findUnique({ where: { id: complejoId } });
  if (!complejo) {
    throw new AppError('Complejo no encontrado', 404);
  }
  if (complejo.administradorId !== administradorId) {
    throw new AppError('No tenes permisos sobre este complejo', 403);
  }

  return prisma.cancha.create({
    data: { ...datos, complejoId },
  });
}

// RF9: modificar precio/tarifas/estado de una cancha existente.
async function actualizar(administradorId, canchaId, datos) {
  await obtenerCanchaDelAdministrador(administradorId, canchaId);
  return prisma.cancha.update({ where: { id: canchaId }, data: datos });
}

// RF9: desactivar una cancha (baja logica, no se borra el historial de reservas).
async function desactivar(administradorId, canchaId) {
  await obtenerCanchaDelAdministrador(administradorId, canchaId);
  return prisma.cancha.update({ where: { id: canchaId }, data: { activa: false } });
}

async function listarPorComplejo(complejoId) {
  return prisma.cancha.findMany({ where: { complejoId }, orderBy: { nombre: 'asc' } });
}

module.exports = { crear, actualizar, desactivar, listarPorComplejo, obtenerCanchaDelAdministrador };
