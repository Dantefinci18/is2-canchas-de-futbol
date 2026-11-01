import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegistroPage from './pages/RegistroPage';
import BuscarComplejosPage from './pages/BuscarComplejosPage';
import ComplejoDetailPage from './pages/ComplejoDetailPage';
import MisReservasPage from './pages/MisReservasPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminAgendaPage from './pages/AdminAgendaPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main className="contenedor">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="/buscar" element={<BuscarComplejosPage />} />
            <Route path="/complejos/:id" element={<ComplejoDetailPage />} />
            <Route
              path="/mis-reservas"
              element={
                <ProtectedRoute rolPermitido="JUGADOR">
                  <MisReservasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute rolPermitido="ADMINISTRADOR">
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/agenda"
              element={
                <ProtectedRoute rolPermitido="ADMINISTRADOR">
                  <AdminAgendaPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
