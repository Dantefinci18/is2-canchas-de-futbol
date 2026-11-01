const { Router } = require('express');
const authRoutes = require('./authRoutes');
const complejoRoutes = require('./complejoRoutes');
const canchaRoutes = require('./canchaRoutes');
const reservaRoutes = require('./reservaRoutes');

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'Backend funcionando correctamente' });
});

router.use('/auth', authRoutes);
router.use('/complejos', complejoRoutes);
router.use('/canchas', canchaRoutes);
router.use('/reservas', reservaRoutes);

module.exports = router;
