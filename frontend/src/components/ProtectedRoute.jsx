import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Protege rutas que requieren sesion iniciada y, opcionalmente, un rol
// especifico (RNF2: acceso a funciones segun el rol).
export default function ProtectedRoute({ children, rolPermitido }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <p className="estado-carga">Cargando...</p>;
  }
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  if (rolPermitido && usuario.rol !== rolPermitido) {
    return <Navigate to="/" replace />;
  }
  return children;
}
