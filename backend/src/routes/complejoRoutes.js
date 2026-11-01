const { Router } = require('express');
const complejoController = require('../controllers/complejoController');
const canchaController = require('../controllers/canchaController');
const reservaController = require('../controllers/reservaController');
const { requireAuth, requireRol } = require('../middleware/auth');

const router = Router();

// Busqueda publica (el jugador no necesita estar logueado para explorar).
router.get('/', complejoController.buscar);
router.get('/mio', requireAuth, requireRol('ADMINISTRADOR'), complejoController.misComplejo);
router.get('/:id', complejoController.obtenerPorId);
router.post('/', requireAuth, requireRol('ADMINISTRADOR'), complejoController.crear);
router.put('/:id', requireAuth, requireRol('ADMINISTRADOR'), complejoController.actualizar);

// Canchas de un complejo.
router.get('/:complejoId/canchas', canchaController.listarPorComplejo);
router.post('/:complejoId/canchas', requireAuth, requireRol('ADMINISTRADOR'), canchaController.crear);

// Turnos libres y agenda.
router.get('/:complejoId/turnos-libres', reservaController.turnosLibresPorComplejo);
router.get('/:complejoId/agenda', requireAuth, requireRol('ADMINISTRADOR'), reservaController.agendaDelDia);

module.exports = router;
