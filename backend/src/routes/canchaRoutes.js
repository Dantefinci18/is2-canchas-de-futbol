const { Router } = require('express');
const canchaController = require('../controllers/canchaController');
const reservaController = require('../controllers/reservaController');
const { requireAuth, requireRol } = require('../middleware/auth');

const router = Router();

router.put('/:id', requireAuth, requireRol('ADMINISTRADOR'), canchaController.actualizar);
router.delete('/:id', requireAuth, requireRol('ADMINISTRADOR'), canchaController.desactivar);
router.get('/:canchaId/turnos-libres', reservaController.turnosLibresPorCancha);

module.exports = router;
