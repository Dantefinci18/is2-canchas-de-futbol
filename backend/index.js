const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.xml || 3000; // O el puerto que prefieras, ej: 3000 o 4000

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend funcionando correctamente' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});