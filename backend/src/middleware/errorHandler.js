const { Prisma } = require('@prisma/client');

// Middleware central de manejo de errores: traduce errores de negocio,
// de validacion (zod) y de Prisma a respuestas HTTP consistentes.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err.isAppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Datos invalidos',
      detalles: err.issues.map((i) => ({ campo: i.path.join('.'), mensaje: i.message })),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'El turno ya no esta disponible' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Recurso no encontrado' });
    }
  }

  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = { errorHandler };
