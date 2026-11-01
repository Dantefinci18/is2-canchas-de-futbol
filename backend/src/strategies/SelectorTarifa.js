const { TarifaNormal } = require('./TarifaNormal');
const { TarifaNocturna } = require('./TarifaNocturna');
const { TarifaFinDeSemana } = require('./TarifaFinDeSemana');

const HORA_INICIO_NOCTURNA = 20;

// Elige la estrategia de tarifa correspondiente segun la fecha y la hora
// (seccion 7.2 del TP). Regla de precedencia: si el turno cae sabado o
// domingo se prioriza la tarifa de fin de semana (mayor demanda); si no,
// se aplica la nocturna a partir de las 20 h; en cualquier otro caso, la
// tarifa normal. Cada complejo puede configurar sus propios porcentajes
// de recargo por cancha.
class SelectorTarifa {
  seleccionar(fecha, hora, porcentajes = {}) {
    const diaSemana = new Date(fecha).getUTCDay(); // 0 = domingo, 6 = sabado
    const esFinDeSemana = diaSemana === 0 || diaSemana === 6;

    if (esFinDeSemana) {
      return new TarifaFinDeSemana(porcentajes.recargoFinDeSemanaPct ?? 15);
    }
    if (hora >= HORA_INICIO_NOCTURNA) {
      return new TarifaNocturna(porcentajes.recargoNocturnoPct ?? 20);
    }
    return new TarifaNormal();
  }
}

module.exports = { SelectorTarifa };
