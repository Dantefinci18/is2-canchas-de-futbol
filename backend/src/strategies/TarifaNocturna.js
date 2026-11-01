const { EstrategiaTarifa } = require('./EstrategiaTarifa');

// Aplica el recargo nocturno (por defecto +20%, configurable por cancha).
class TarifaNocturna extends EstrategiaTarifa {
  constructor(porcentajeRecargo) {
    super();
    this.porcentajeRecargo = porcentajeRecargo;
  }

  calcular(precioBase) {
    return precioBase * (1 + this.porcentajeRecargo / 100);
  }
}

module.exports = { TarifaNocturna };
