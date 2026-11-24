import { useEffect, useState } from 'react';
import { obtenerMiComplejo, agendaDelDia } from '../api/complejos';
import { registrarPagoSaldo } from '../api/reservas';
import { ESTADOS_RESERVA_LABEL, formatearHora, formatearMoneda, nombreTipoCancha } from '../utils/format';
import ErrorBanner from '../components/ErrorBanner';

function hoyISO() {
  const ahora = new Date();
  return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
}

function ocupaTurno(reserva, hora, ahora) {
  const activa = reserva.estado === 'CONFIRMADA' || (
    reserva.estado === 'PENDIENTE_SENA' && reserva.fechaExpiracion && new Date(reserva.fechaExpiracion) > ahora
  );
  return activa && reserva.horaInicio < hora + 1 && reserva.horaFin > hora;
}

export default function AdminAgendaPage() {
  const [complejo, setComplejo] = useState(null);
  const [fecha, setFecha] = useState(hoyISO());
  const [reservas, setReservas] = useState([]);
  const [seleccionadaId, setSeleccionadaId] = useState(null);
  const [cargandoComplejo, setCargandoComplejo] = useState(true);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [errorAgenda, setErrorAgenda] = useState(false);
  const [procesando, setProcesando] = useState(null);
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    obtenerMiComplejo().then(setComplejo).catch((err) => setError(err.message)).finally(() => setCargandoComplejo(false));
  }, []);

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(Date.now()), 10000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    if (!complejo) return;
    let vigente = true;
    // No mostrar disponibilidad de una fecha anterior mientras se consulta la nueva.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCargando(true);
    setError('');
    setErrorAgenda(false);
    setSeleccionadaId(null);
    agendaDelDia(complejo.id, fecha)
      .then((datos) => { if (vigente) setReservas(datos); })
      .catch((err) => { if (vigente) { setError(err.message); setErrorAgenda(true); } })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [complejo, fecha]);

  async function handlePagarSaldo(reservaId) {
    setProcesando(reservaId);
    setError('');
    try {
      await registrarPagoSaldo(reservaId);
      setReservas(await agendaDelDia(complejo.id, fecha));
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(null);
    }
  }

  if (cargandoComplejo) return <p className="estado-carga">Cargando agenda...</p>;
  if (!complejo) return <div className="pagina"><ErrorBanner mensaje={error || 'Primero registra tu complejo en "Mi complejo".'} /></div>;

  const horas = Array.from({ length: Math.max(0, complejo.horaCierre - complejo.horaApertura) }, (_, i) => complejo.horaApertura + i);
  const seleccionada = reservas.find((reserva) => reserva.id === seleccionadaId);
  const canceladas = reservas.filter((reserva) => reserva.estado === 'CANCELADA');

  return (
    <div className="pagina">
      <h1>Agenda de {complejo.nombre}</h1>
      <label className="agenda-fecha">
        Fecha
        <input type="date" value={fecha} disabled={Boolean(procesando)} onChange={(e) => setFecha(e.target.value)} />
      </label>
      <ErrorBanner mensaje={error} />
      {cargando && <p className="estado-carga">Cargando agenda...</p>}
      {!cargando && !errorAgenda && complejo.canchas.length === 0 && <p>Todavía no registraste canchas.</p>}
      {!cargando && !errorAgenda && complejo.canchas.length > 0 && (
        <>
          <p className="ayuda">Seleccioná un turno reservado para ver los datos y registrar el saldo. Deslizá horizontalmente para ver todos los horarios.</p>
          <div className="agenda-scroll" role="region" aria-label="Agenda por cancha y horario" tabIndex={0}>
            <table className="agenda-grilla">
              <thead><tr><th scope="col">Cancha</th>{horas.map((hora) => <th scope="col" key={hora}>{formatearHora(hora)}</th>)}</tr></thead>
              <tbody>
                {complejo.canchas.map((cancha) => (
                  <tr key={cancha.id}>
                    <th scope="row">{cancha.nombre}<span>{nombreTipoCancha(cancha.tipo)}{!cancha.activa && ' · Inactiva'}</span></th>
                    {horas.map((hora) => {
                      const reserva = reservas.find((r) => r.canchaId === cancha.id && ocupaTurno(r, hora, ahora));
                      return (
                        <td key={hora}>
                          {reserva ? (
                            <button type="button" className="agenda-celda agenda-reservado" aria-pressed={seleccionadaId === reserva.id} onClick={() => setSeleccionadaId(reserva.id)}>
                              {reserva.estado === 'PENDIENTE_SENA' ? 'Pendiente' : 'Reservado'}<span>{reserva.jugador.nombre}</span>
                            </button>
                          ) : <div className={`agenda-celda ${cancha.activa ? 'agenda-libre' : 'agenda-inactiva'}`}>{cancha.activa ? 'Libre' : 'Inactiva'}</div>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {seleccionada && (
            <section className="tarjeta-reserva" aria-label="Detalle de la reserva">
              <div>
                <h3>{seleccionada.cancha.nombre} · {formatearHora(seleccionada.horaInicio)} - {formatearHora(seleccionada.horaFin)}</h3>
                <p>{seleccionada.jugador.nombre} · {seleccionada.jugador.telefono || seleccionada.jugador.email}</p>
                <p>Total: {formatearMoneda(seleccionada.montoTotal)} · Seña: {formatearMoneda(seleccionada.montoSena)} · Saldo: {formatearMoneda(Number(seleccionada.montoTotal) - Number(seleccionada.montoSena))}</p>
                <span className="estado-pill">{ESTADOS_RESERVA_LABEL[seleccionada.estado] || seleccionada.estado}</span>
              </div>
              <div className="acciones">
                {seleccionada.estado === 'CONFIRMADA' && !seleccionada.pagos.some((p) => p.tipo === 'SALDO') && (
                  <button type="button" onClick={() => handlePagarSaldo(seleccionada.id)} disabled={procesando === seleccionada.id}>Registrar pago de saldo</button>
                )}
                {seleccionada.pagos.some((p) => p.tipo === 'SALDO') && <span className="chip">Saldo cobrado</span>}
              </div>
            </section>
          )}
          {canceladas.length > 0 && (
            <details><summary>Reservas canceladas ({canceladas.length})</summary>
              {canceladas.map((r) => <p key={r.id}>{r.cancha.nombre} · {formatearHora(r.horaInicio)} - {formatearHora(r.horaFin)} · {r.jugador.nombre}</p>)}
            </details>
          )}
        </>
      )}
    </div>
  );
}
