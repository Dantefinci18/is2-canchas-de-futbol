// Interfaz EstrategiaTarifa (seccion 7.2 del TP). En JS se modela como una
// clase base que define el contrato calcular(precioBase) y lanza si una
// subclase no lo implementa.
class EstrategiaTarifa {
  calcular(_precioBase) {
    throw new Error('calcular() debe ser implementado por la subclase');
  }
}

module.exports = { EstrategiaTarifa };
