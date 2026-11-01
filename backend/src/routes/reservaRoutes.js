const { Router } = require('express');
const reservaController = require('../controllers/reservaController');
const { requireAuth, requireRol } = require('../middleware/auth');

const router = Router();

router.post('/', requireAuth, requireRol('JUGADOR'), reservaController.crear);
router.get('/mias', requireAuth, requireRol('JUGADOR'), reservaController.misReservas);
router.post('/:id/pagar-sena', requireAuth, requireRol('JUGADOR'), reservaController.pagarSena);
router.post('/:id/cancelar', requireAuth, requireRol('JUGADOR'), reservaController.cancelar);
router.post('/:id/pagar-saldo', requireAuth, requireRol('ADMINISTRADOR'), reservaController.registrarPagoSaldo);

module.exports = router;
