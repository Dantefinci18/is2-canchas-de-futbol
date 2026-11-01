const { EstrategiaTarifa } = require('./EstrategiaTarifa');

// Aplica el recargo de fin de semana (por defecto +15%, configurable por cancha).
class TarifaFinDeSemana extends EstrategiaTarifa {
  constructor(porcentajeRecargo) {
    super();
    this.porcentajeRecargo = porcentajeRecargo;
  }

  calcular(precioBase) {
    return precioBase * (1 + this.porcentajeRecargo / 100);
  }
}

module.exports = { TarifaFinDeSemana };
