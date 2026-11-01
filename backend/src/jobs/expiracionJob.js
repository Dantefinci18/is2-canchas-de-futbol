const reservaService = require('../services/reservaService');

const INTERVALO_MS = 60 * 1000; // revisa cada minuto

// RF11: mientras la app esta corriendo, libera periodicamente los turnos
// cuya reserva quedo pendiente de sena mas alla del plazo de 10 minutos.
function iniciarJobExpiracion() {
  const intervalo = setInterval(async () => {
    try {
      const expiradas = await reservaService.expirarReservasVencidas();
      if (expiradas > 0) {
        console.log(`[expiracion] ${expiradas} reserva(s) pendiente(s) expiraron`);
      }
    } catch (err) {
      console.error('[expiracion] error al expirar reservas vencidas', err);
    }
  }, INTERVALO_MS);

  intervalo.unref();
  return intervalo;
}

module.exports = { iniciarJobExpiracion };
