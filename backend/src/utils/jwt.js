const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

function firmarToken(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
}

function verificarToken(token) {
  return jwt.verify(token, jwtSecret);
}

module.exports = { firmarToken, verificarToken };
