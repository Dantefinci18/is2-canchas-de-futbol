import { useEffect, useState } from 'react';
import { obtenerMiComplejo, agendaDelDia } from '../api/complejos';
import { registrarPagoSaldo } from '../api/reservas';
import { ESTADOS_RESERVA_LABEL, formatearHora, formatearMoneda } from '../utils/format';
import ErrorBanner from '../components/ErrorBanner';

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

// RF10: el administrador ve la agenda diaria de su complejo y registra el
// pago del saldo restante de cada reserva confirmada.
export default function AdminAgendaPage() {
  const [complejo, setComplejo] = useState(null);
  const [fecha, setFecha] = useState(hoyISO());
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(null);

  useEffect(() => {
    obtenerMiComplejo()
      .then(setComplejo)
      .catch((err) => setError(err.message));
  }, []);

  async function cargarAgenda() {
    if (!complejo) return;
    setCargando(true);
    setError('');
    try {
      setReservas(await agendaDelDia(complejo.id, fecha));
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    // Fetch al montar/cambiar de fecha; patron estandar de carga de datos.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarAgenda();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complejo, fecha]);

  async function handlePagarSaldo(reservaId) {
    setProcesando(reservaId);
    setError('');
    try {
      await registrarPagoSaldo(reservaId);
      await cargarAgenda();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(null);
    }
  }

  if (!complejo) {
    return (
      <div className="pagina">
        <ErrorBanner mensaje={error || 'Primero registra tu complejo en "Mi complejo".'} />
      </div>
    );
  }

  return (
    <div className="pagina">
      <h1>Agenda de {complejo.nombre}</h1>
      <label>
        Fecha
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </label>

      <ErrorBanner mensaje={error} />
      {cargando && <p className="estado-carga">Cargando agenda...</p>}

      {!cargando && reservas.length === 0 && <p>No hay turnos para esta fecha.</p>}

      <div className="lista-reservas">
        {reservas.map((r) => {
          const tieneSaldoRegistrado = r.pagos.some((p) => p.tipo === 'SALDO');
          const saldo = Number(r.montoTotal) - Number(r.montoSena);
          return (
            <div key={r.id} className={`tarjeta-reserva estado-${r.estado.toLowerCase()}`}>
              <div>
                <h3>
                  {formatearHora(r.horaInicio)} - {formatearHora(r.horaFin)} · {r.cancha.nombre}
                </h3>
                <p>
                  {r.jugador.nombre} · {r.jugador.telefono || r.jugador.email}
                </p>
                <p>
                  Total: {formatearMoneda(r.montoTotal)} · Sena: {formatearMoneda(r.montoSena)} · Saldo:{' '}
                  {formatearMoneda(saldo)}
                </p>
                <span className="estado-pill">{ESTADOS_RESERVA_LABEL[r.estado] || r.estado}</span>
              </div>
              <div className="acciones">
                {r.estado === 'CONFIRMADA' && !tieneSaldoRegistrado && (
                  <button type="button" onClick={() => handlePagarSaldo(r.id)} disabled={procesando === r.id}>
                    Registrar pago de saldo
                  </button>
                )}
                {tieneSaldoRegistrado && <span className="chip">Saldo cobrado</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
