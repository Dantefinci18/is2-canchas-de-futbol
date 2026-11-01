const { crearApp } = require('./src/app');
const { port } = require('./src/config/env');
const { iniciarJobExpiracion } = require('./src/jobs/expiracionJob');

const app = crearApp();

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  iniciarJobExpiracion();
});