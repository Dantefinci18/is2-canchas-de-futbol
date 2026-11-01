import { useEffect, useState } from 'react';
import { obtenerMiComplejo, crearComplejo, actualizarComplejo } from '../api/complejos';
import { crearCancha, actualizarCancha, desactivarCancha } from '../api/canchas';
import { TIPOS_CANCHA, nombreTipoCancha, formatearMoneda } from '../utils/format';
import ErrorBanner from '../components/ErrorBanner';

const COMPLEJO_INICIAL = { nombre: '', direccion: '', zona: '', horaApertura: 8, horaCierre: 23 };
const CANCHA_INICIAL = {
  nombre: '',
  tipo: 'FUTBOL_5',
  precioHora: '',
  techada: false,
  recargoNocturnoPct: 20,
  recargoFinDeSemanaPct: 15,
};

// RF2/RF9: el administrador registra su complejo y gestiona sus canchas,
// precios y tarifas (recargos que alimenta el patron Strategy del backend).
export default function AdminDashboardPage() {
  const [complejo, setComplejo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [formComplejo, setFormComplejo] = useState(COMPLEJO_INICIAL);
  const [formCancha, setFormCancha] = useState(CANCHA_INICIAL);
  const [enviando, setEnviando] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      const datos = await obtenerMiComplejo();
      setComplejo(datos);
      setFormComplejo({
        nombre: datos.nombre,
        direccion: datos.direccion,
        zona: datos.zona,
        horaApertura: datos.horaApertura,
        horaCierre: datos.horaCierre,
      });
    } catch (err) {
      if (err.status !== 404) setError(err.message);
      setComplejo(null);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    // Fetch al montar; patron estandar de carga de datos.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
  }, []);

  async function handleGuardarComplejo(e) {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      const datos = {
        ...formComplejo,
        horaApertura: Number(formComplejo.horaApertura),
        horaCierre: Number(formComplejo.horaCierre),
      };
      if (complejo) {
        await actualizarComplejo(complejo.id, datos);
      } else {
        await crearComplejo(datos);
      }
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  async function handleCrearCancha(e) {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      await crearCancha(complejo.id, {
        ...formCancha,
        precioHora: Number(formCancha.precioHora),
        recargoNocturnoPct: Number(formCancha.recargoNocturnoPct),
        recargoFinDeSemanaPct: Number(formCancha.recargoFinDeSemanaPct),
      });
      setFormCancha(CANCHA_INICIAL);
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  async function handleActualizarPrecio(cancha, precioHora) {
    try {
      await actualizarCancha(cancha.id, { precioHora: Number(precioHora) });
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggleActiva(cancha) {
    try {
      if (cancha.activa) {
        await desactivarCancha(cancha.id);
      } else {
        await actualizarCancha(cancha.id, { activa: true });
      }
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  if (cargando) return <p className="estado-carga">Cargando...</p>;

  return (
    <div className="pagina">
      <h1>Mi complejo</h1>
      <ErrorBanner mensaje={error} />

      <form className="formulario" onSubmit={handleGuardarComplejo}>
        <h2>{complejo ? 'Datos del complejo' : 'Registra tu complejo'}</h2>
        <label>
          Nombre
          <input
            required
            value={formComplejo.nombre}
            onChange={(e) => setFormComplejo({ ...formComplejo, nombre: e.target.value })}
          />
        </label>
        <label>
          Direccion
          <input
            required
            value={formComplejo.direccion}
            onChange={(e) => setFormComplejo({ ...formComplejo, direccion: e.target.value })}
          />
        </label>
        <label>
          Zona
          <input
            required
            value={formComplejo.zona}
            onChange={(e) => setFormComplejo({ ...formComplejo, zona: e.target.value })}
          />
        </label>
        <div className="fila">
          <label>
            Hora apertura
            <input
              type="number"
              min="0"
              max="23"
              required
              value={formComplejo.horaApertura}
              onChange={(e) => setFormComplejo({ ...formComplejo, horaApertura: e.target.value })}
            />
          </label>
          <label>
            Hora cierre
            <input
              type="number"
              min="1"
              max="24"
              required
              value={formComplejo.horaCierre}
              onChange={(e) => setFormComplejo({ ...formComplejo, horaCierre: e.target.value })}
            />
          </label>
        </div>
        <button type="submit" disabled={enviando}>
          {complejo ? 'Guardar cambios' : 'Registrar complejo'}
        </button>
      </form>

      {complejo && (
        <>
          <h2>Canchas</h2>
          <div className="lista-canchas">
            {complejo.canchas.map((cancha) => (
              <div key={cancha.id} className={`tarjeta-cancha ${cancha.activa ? '' : 'inactiva'}`}>
                <h3>{cancha.nombre}</h3>
                <p>{nombreTipoCancha(cancha.tipo)} {cancha.techada ? '· techada' : ''}</p>
                <label>
                  Precio por hora
                  <input
                    type="number"
                    defaultValue={cancha.precioHora}
                    onBlur={(e) => handleActualizarPrecio(cancha, e.target.value)}
                  />
                </label>
                <p className="ayuda">
                  Recargo nocturno (desde 20hs): {Number(cancha.recargoNocturnoPct)}% · Recargo fin de
                  semana: {Number(cancha.recargoFinDeSemanaPct)}%
                </p>
                <p>Precio actual: {formatearMoneda(cancha.precioHora)}</p>
                <button type="button" className="secundario" onClick={() => handleToggleActiva(cancha)}>
                  {cancha.activa ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            ))}
          </div>

          <form className="formulario" onSubmit={handleCrearCancha}>
            <h2>Agregar cancha</h2>
            <label>
              Nombre
              <input
                required
                value={formCancha.nombre}
                onChange={(e) => setFormCancha({ ...formCancha, nombre: e.target.value })}
              />
            </label>
            <label>
              Tipo
              <select
                value={formCancha.tipo}
                onChange={(e) => setFormCancha({ ...formCancha, tipo: e.target.value })}
              >
                {TIPOS_CANCHA.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Precio por hora
              <input
                type="number"
                min="0"
                required
                value={formCancha.precioHora}
                onChange={(e) => setFormCancha({ ...formCancha, precioHora: e.target.value })}
              />
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={formCancha.techada}
                onChange={(e) => setFormCancha({ ...formCancha, techada: e.target.checked })}
              />
              Techada
            </label>
            <div className="fila">
              <label>
                Recargo nocturno %
                <input
                  type="number"
                  min="0"
                  value={formCancha.recargoNocturnoPct}
                  onChange={(e) => setFormCancha({ ...formCancha, recargoNocturnoPct: e.target.value })}
                />
              </label>
              <label>
                Recargo fin de semana %
                <input
                  type="number"
                  min="0"
                  value={formCancha.recargoFinDeSemanaPct}
                  onChange={(e) => setFormCancha({ ...formCancha, recargoFinDeSemanaPct: e.target.value })}
                />
              </label>
            </div>
            <button type="submit" disabled={enviando}>
              Agregar cancha
            </button>
          </form>
        </>
      )}
    </div>
  );
}
