import { useEffect, useState } from 'react';
import { misReservas, cancelarReserva, pagarSena } from '../api/reservas';
import { ESTADOS_RESERVA_LABEL, formatearFecha, formatearHora, formatearMoneda } from '../utils/format';
import ErrorBanner from '../components/ErrorBanner';

// RF8: el jugador puede ver y cancelar sus reservas (con devolucion de
// sena si cancela con 24 h o mas de anticipacion).
export default function MisReservasPage() {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(null);

  async function cargar() {
    setCargando(true);
    try {
      setReservas(await misReservas());
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    // Fetch al montar; patron estandar de carga de datos.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
  }, []);

  async function handleCancelar(id) {
    setProcesando(id);
    setError('');
    try {
      await cancelarReserva(id);
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(null);
    }
  }

  async function handlePagarSena(id) {
    setProcesando(id);
    setError('');
    try {
      await pagarSena(id);
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(null);
    }
  }

  if (cargando) return <p className="estado-carga">Cargando tus reservas...</p>;

  return (
    <div className="pagina">
      <h1>Mis reservas</h1>
      <ErrorBanner mensaje={error} />
      {reservas.length === 0 && <p>Todavia no tenes reservas.</p>}
      <div className="lista-reservas">
        {reservas.map((r) => (
          <div key={r.id} className={`tarjeta-reserva estado-${r.estado.toLowerCase()}`}>
            <div>
              <h3>{r.cancha.complejo.nombre}</h3>
              <p>{r.cancha.nombre}</p>
              <p>
                {formatearFecha(r.fecha)} · {formatearHora(r.horaInicio)} a {formatearHora(r.horaFin)}
              </p>
              <p>Total: {formatearMoneda(r.montoTotal)} · Sena: {formatearMoneda(r.montoSena)}</p>
              <span className="estado-pill">{ESTADOS_RESERVA_LABEL[r.estado] || r.estado}</span>
            </div>
            <div className="acciones">
              {r.estado === 'PENDIENTE_SENA' && (
                <button type="button" onClick={() => handlePagarSena(r.id)} disabled={procesando === r.id}>
                  Pagar sena
                </button>
              )}
              {(r.estado === 'PENDIENTE_SENA' || r.estado === 'CONFIRMADA') && (
                <button
                  type="button"
                  className="secundario"
                  onClick={() => handleCancelar(r.id)}
                  disabled={procesando === r.id}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
