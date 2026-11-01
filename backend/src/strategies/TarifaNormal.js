const { EstrategiaTarifa } = require('./EstrategiaTarifa');

// Aplica la tarifa base, sin recargos.
class TarifaNormal extends EstrategiaTarifa {
  calcular(precioBase) {
    return precioBase;
  }
}

module.exports = { TarifaNormal };
