import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorBanner from '../components/ErrorBanner';

// RF1/RF2: registro diferenciado segun el rol (Jugador o Administrador de
// complejo). El administrador registra su complejo en un segundo paso.
export default function RegistroPage() {
  const { registrarse } = useAuth();
  const navigate = useNavigate();
  const [rol, setRol] = useState('JUGADOR');
  const [form, setForm] = useState({ nombre: '', email: '', password: '', telefono: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await registrarse(form, rol);
      navigate(rol === 'ADMINISTRADOR' ? '/admin' : '/buscar');
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pagina-angosta">
      <h1>Crear cuenta</h1>
      <div className="selector-rol">
        <button
          type="button"
          className={rol === 'JUGADOR' ? 'activo' : ''}
          onClick={() => setRol('JUGADOR')}
        >
          Soy jugador
        </button>
        <button
          type="button"
          className={rol === 'ADMINISTRADOR' ? 'activo' : ''}
          onClick={() => setRol('ADMINISTRADOR')}
        >
          Administro un complejo
        </button>
      </div>
      <ErrorBanner mensaje={error} />
      <form className="formulario" onSubmit={handleSubmit}>
        <label>
          Nombre
          <input
            required
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Telefono
          <input
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          />
        </label>
        <label>
          Contrasena
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        <button type="submit" disabled={enviando}>
          {enviando ? 'Creando cuenta...' : 'Registrarme'}
        </button>
      </form>
      <p>
        ¿Ya tenes cuenta? <Link to="/login">Iniciar sesion</Link>
      </p>
    </div>
  );
}
