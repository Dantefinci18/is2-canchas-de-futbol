const { Router } = require('express');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.post('/registro/jugador', authController.registrarJugador);
router.post('/registro/administrador', authController.registrarAdministrador);
router.post('/login', authController.login);
router.get('/perfil', requireAuth, authController.perfil);

module.exports = router;
