# Frontend - Sistema de Turnos de Futbol

SPA en React (Vite) + React Router. Consume la API del [backend](../backend). No usa
ninguna libreria de estado global: la sesion se maneja con `AuthContext`
(`src/context/AuthContext.jsx`) y el JWT se persiste en `localStorage`.

## Variables de entorno (`.env`)

```
VITE_API_URL=http://localhost:3000
```

## Scripts

```bash
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm run build    # build de produccion en dist/
npm run lint     # ESLint
npm run preview  # sirve el build de produccion
```

## Estructura

```
src/
  api/          cliente HTTP y funciones por recurso (auth, complejos, canchas, reservas)
  context/      AuthContext (sesion + JWT)
  components/   Navbar, ProtectedRoute, ErrorBanner
  pages/        una pantalla por ruta
  utils/        formateo de fechas, moneda, tipos de cancha
```

## Pantallas

| Ruta | Rol | Descripcion |
| --- | --- | --- |
| `/` | - | Landing |
| `/registro`, `/login` | - | RF1/RF2: alta diferenciada jugador/administrador |
| `/buscar` | - | RF3/RF5: busqueda de complejos por zona y tipo |
| `/complejos/:id` | - | RF4/RF6: turnos libres y reserva + pago de sena (mock) |
| `/mis-reservas` | Jugador | RF8: ver y cancelar reservas |
| `/admin` | Administrador | RF2/RF9: alta del complejo y gestion de canchas/tarifas |
| `/admin/agenda` | Administrador | RF10: agenda diaria y registro de pago de saldo |
