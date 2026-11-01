import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { buscarComplejos } from '../api/complejos';
import { TIPOS_CANCHA, nombreTipoCancha } from '../utils/format';
import ErrorBanner from '../components/ErrorBanner';

// RF3/RF5: el jugador busca complejos por zona y tipo de cancha.
export default function BuscarComplejosPage() {
  const [zona, setZona] = useState('');
  const [tipo, setTipo] = useState('');
  const [complejos, setComplejos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  async function buscar(e) {
    e?.preventDefault();
    setCargando(true);
    setError('');
    try {
      const resultado = await buscarComplejos({ zona: zona || undefined, tipo: tipo || undefined });
      setComplejos(resultado);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    // Fetch al montar/cambiar filtros; patron estandar de carga de datos.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    buscar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pagina">
      <h1>Buscar complejos</h1>
      <form className="formulario-busqueda" onSubmit={buscar}>
        <label>
          Zona
          <input placeholder="Ej: Palermo" value={zona} onChange={(e) => setZona(e.target.value)} />
        </label>
        <label>
          Tipo de cancha
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todas</option>
            {TIPOS_CANCHA.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Buscar</button>
      </form>

      <ErrorBanner mensaje={error} />
      {cargando && <p className="estado-carga">Buscando complejos...</p>}

      {!cargando && complejos.length === 0 && <p>No se encontraron complejos con esos filtros.</p>}

      <div className="grilla-tarjetas">
        {complejos.map((complejo) => (
          <Link key={complejo.id} to={`/complejos/${complejo.id}`} className="tarjeta">
            <h2>{complejo.nombre}</h2>
            <p>{complejo.direccion}</p>
            <p className="tarjeta-zona">📍 {complejo.zona}</p>
            <p>
              {complejo.horaApertura}:00 - {complejo.horaCierre}:00
            </p>
            <div className="tarjeta-tipos">
              {[...new Set(complejo.canchas.map((c) => c.tipo))].map((t) => (
                <span key={t} className="chip">
                  {nombreTipoCancha(t)}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
