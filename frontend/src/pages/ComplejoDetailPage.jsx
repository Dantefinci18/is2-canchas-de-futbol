import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerComplejo, turnosLibresComplejo } from '../api/complejos';
import { crearReserva, pagarSena } from '../api/reservas';
import { useAuth } from '../context/AuthContext';
import { formatearHora, formatearMoneda, nombreTipoCancha } from '../utils/format';
import ErrorBanner from '../components/ErrorBanner';

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

// RF4/RF6: consulta de turnos libres por fecha y tipo de cancha, y reserva
// con pago de sena (RF11: el turno queda bloqueado 10 minutos mientras se
// simula el pago).
export default function ComplejoDetailPage() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [complejo, setComplejo] = useState(null);
  const [fecha, setFecha] = useState(hoyISO());
  const [tipo, setTipo] = useState('');
  const [turnosPorCancha, setTurnosPorCancha] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [reservaPendiente, setReservaPendiente] = useState(null);
  const [pagando, setPagando] = useState(false);

  useEffect(() => {
    obtenerComplejo(id).then(setComplejo).catch((err) => setError(err.message));
  }, [id]);

  async function cargarTurnos() {
    setCargando(true);
    setError('');
    try {
      const resultado = await turnosLibresComplejo(id, fecha, tipo || undefined);
      setTurnosPorCancha(resultado);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    // Fetch al montar/cambiar de fecha o tipo; patron estandar de carga de datos.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarTurnos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, fecha, tipo]);

  async function handleReservar(canchaId, turno) {
    if (!usuario) {
      navigate('/login');
      return;
    }
    setError('');
    try {
      const reserva = await crearReserva({
        canchaId,
        fecha,
        horaInicio: turno.horaInicio,
        horaFin: turno.horaFin,
      });
      setReservaPendiente(reserva);
    } catch (err) {
      setError(err.message);
      cargarTurnos();
    }
  }

  async function handlePagarSena() {
    setPagando(true);
    setError('');
    try {
      await pagarSena(reservaPendiente.id);
      navigate('/mis-reservas');
    } catch (err) {
      setError(err.message);
    } finally {
      setPagando(false);
    }
  }

  if (!complejo) return <p className="estado-carga">Cargando complejo...</p>;

  return (
    <div className="pagina">
      <h1>{complejo.nombre}</h1>
      <p>
        {complejo.direccion} · 📍 {complejo.zona} · {complejo.horaApertura}:00 a {complejo.horaCierre}:00
      </p>

      <ErrorBanner mensaje={error} />

      {reservaPendiente ? (
        <div className="panel-reserva">
          <h2>Confirma tu reserva</h2>
          <p>
            {fecha} de {formatearHora(reservaPendiente.horaInicio)} a {formatearHora(reservaPendiente.horaFin)}
          </p>
          <p>
            Precio total: <strong>{formatearMoneda(reservaPendiente.montoTotal)}</strong>
          </p>
          <p>
            Sena a pagar ahora: <strong>{formatearMoneda(reservaPendiente.montoSena)}</strong>
          </p>
          <p className="aviso">
            Tenes 10 minutos para confirmar el pago o el turno se libera automaticamente.
          </p>
          <div className="acciones">
            <button type="button" onClick={handlePagarSena} disabled={pagando}>
              {pagando ? 'Procesando pago...' : 'Simular pago de sena'}
            </button>
            <button type="button" className="secundario" onClick={() => setReservaPendiente(null)}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <form className="formulario-busqueda" onSubmit={(e) => e.preventDefault()}>
            <label>
              Fecha
              <input type="date" min={hoyISO()} value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </label>
            <label>
              Tipo de cancha
              <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="">Todas</option>
                {complejo.canchas.map((c) => (
                  <option key={c.tipo} value={c.tipo}>
                    {nombreTipoCancha(c.tipo)}
                  </option>
                ))}
              </select>
            </label>
          </form>

          {cargando && <p className="estado-carga">Buscando turnos libres...</p>}

          {!cargando &&
            turnosPorCancha.map(({ cancha, turnos }) => (
              <div key={cancha.id} className="bloque-cancha">
                <h3>
                  {cancha.nombre} · {nombreTipoCancha(cancha.tipo)} {cancha.techada ? '(techada)' : ''}
                </h3>
                {turnos.length === 0 ? (
                  <p>Sin turnos libres para esta fecha.</p>
                ) : (
                  <div className="grilla-turnos">
                    {turnos.map((turno) => (
                      <button
                        key={turno.horaInicio}
                        type="button"
                        className="turno"
                        onClick={() => handleReservar(cancha.id, turno)}
                      >
                        <span>{formatearHora(turno.horaInicio)}</span>
                        <span>{formatearMoneda(turno.precio)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </>
      )}
    </div>
  );
}
