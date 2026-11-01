const { PrismaClient } = require('@prisma/client');

// Patron Singleton: toda la aplicacion comparte una unica instancia de
// conexion a la base de datos (seccion 7.3 del TP).
let instance = null;

function getPrismaClient() {
  if (!instance) {
    instance = new PrismaClient();
  }
  return instance;
}

module.exports = { prisma: getPrismaClient() };
