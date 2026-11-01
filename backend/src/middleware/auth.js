const { verificarToken } = require('../utils/jwt');
const { AppError } = require('../utils/AppError');

// Verifica el JWT y adjunta el usuario autenticado a req.usuario.
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('No autenticado', 401));
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = verificarToken(token);
    req.usuario = payload; // { id, email, rol }
    next();
  } catch (err) {
    next(new AppError('Token invalido o expirado', 401));
  }
}

// Restringe el acceso segun el rol (Jugador / Administrador). Es la forma
// en la que RNF2 ("acceso a funciones segun el rol") se aplica en la API.
function requireRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return next(new AppError('No tenes permisos para esta accion', 403));
    }
    next();
  };
}

module.exports = { requireAuth, requireRol };
