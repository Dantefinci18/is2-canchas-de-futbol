import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authApi from '../api/auth';
import { getToken, setToken as persistToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function restaurarSesion() {
      if (getToken()) {
        try {
          const datos = await authApi.perfil();
          setUsuario(datos);
        } catch {
          persistToken(null);
        }
      }
      setCargando(false);
    }
    restaurarSesion();
  }, []);

  const ingresar = useCallback(async (credenciales) => {
    const { token, usuario: usuarioLogueado } = await authApi.login(credenciales);
    persistToken(token);
    setUsuario(usuarioLogueado);
    return usuarioLogueado;
  }, []);

  const registrarse = useCallback(async (datos, rol) => {
    const registrar = rol === 'ADMINISTRADOR' ? authApi.registrarAdministrador : authApi.registrarJugador;
    const { token, usuario: nuevoUsuario } = await registrar(datos);
    persistToken(token);
    setUsuario(nuevoUsuario);
    return nuevoUsuario;
  }, []);

  const salir = useCallback(() => {
    persistToken(null);
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, cargando, ingresar, registrarse, salir }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook acoplado a este contexto; separarlo en otro archivo solo agrega indireccion.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
