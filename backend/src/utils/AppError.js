// Error de negocio con un codigo de estado HTTP asociado, para no mezclar
// manejo de errores con la logica de los servicios.
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isAppError = true;
  }
}

module.exports = { AppError };
