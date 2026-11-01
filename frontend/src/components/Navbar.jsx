import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { usuario, salir } = useAuth();
  const navigate = useNavigate();

  function handleSalir() {
    salir();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        ⚽ Turnos de Futbol
      </Link>
      <div className="navbar-links">
        {!usuario && (
          <>
            <Link to="/buscar">Buscar canchas</Link>
            <Link to="/login">Ingresar</Link>
            <Link to="/registro" className="navbar-cta">
              Registrarme
            </Link>
          </>
        )}
        {usuario?.rol === 'JUGADOR' && (
          <>
            <Link to="/buscar">Buscar canchas</Link>
            <Link to="/mis-reservas">Mis reservas</Link>
            <span className="navbar-user">Hola, {usuario.nombre}</span>
            <button type="button" onClick={handleSalir}>
              Salir
            </button>
          </>
        )}
        {usuario?.rol === 'ADMINISTRADOR' && (
          <>
            <Link to="/admin">Mi complejo</Link>
            <Link to="/admin/agenda">Agenda</Link>
            <span className="navbar-user">Hola, {usuario.nombre}</span>
            <button type="button" onClick={handleSalir}>
              Salir
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
