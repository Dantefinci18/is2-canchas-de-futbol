# Backend - Sistema de Turnos de Futbol

API REST en Node.js + Express. Persistencia con PostgreSQL via Prisma. Autenticacion con
JWT. El pago de la sena/saldo esta **simulado** (no hay integracion real con una
pasarela de pago): confirmar sena y registrar saldo son endpoints que marcan el pago
como `CONFIRMADO` directamente.

## Modelo de dominio (seccion 4 del TP)

- **Usuario** (`Jugador` / `Administrador` via el campo `rol`)
- **Complejo**: pertenece a un Administrador, agrupa Canchas
- **Cancha**: precio base + recargos configurables (nocturno / fin de semana)
- **Reserva**: ciclo de vida `PENDIENTE_SENA -> CONFIRMADA | CANCELADA | EXPIRADA`
- **Pago**: `SENA`, `SALDO` o `DEVOLUCION`

### Patrones aplicados

- **Strategy** (`src/strategies`): `EstrategiaTarifa`, `TarifaNormal`, `TarifaNocturna`,
  `TarifaFinDeSemana` y `SelectorTarifa`, que elige la tarifa segun fecha/hora.
- **Singleton** (`src/config/prisma.js`): una unica instancia de `PrismaClient` para toda
  la app.

### Reglas de negocio relevantes

- **RF7/RNF3 (no solapamiento):** se verifica en la app (`reservaService.crearReserva`)
  y ademas con un indice unico parcial en PostgreSQL sobre
  `(canchaId, fecha, horaInicio)` para reservas `PENDIENTE_SENA` o `CONFIRMADA`
  (ver migracion `reserva_unique_activa`), como segunda barrera ante condiciones de
  carrera.
- **RF11 (expiracion de la sena):** una reserva queda `PENDIENTE_SENA` con
  `fechaExpiracion = ahora + 10 min`. Un job en memoria (`src/jobs/expiracionJob.js`)
  revisa cada minuto y marca como `EXPIRADA` las reservas vencidas, liberando el turno.
- **RF8 (cancelacion):** la sena se devuelve (se registra un `Pago` tipo `DEVOLUCION`)
  solo si se cancela una reserva `CONFIRMADA` con 24 h o mas de anticipacion.
- **RNF4 (confidencialidad):** todos los endpoints de administracion verifican que el
  complejo/cancha/reserva pertenezca al administrador autenticado.

## Variables de entorno (`.env`)

Ver `.env.example`. Las mas importantes:

| Variable | Descripcion |
| --- | --- |
| `DATABASE_URL` | Cadena de conexion a PostgreSQL |
| `JWT_SECRET` | Secreto para firmar los tokens |
| `PORCENTAJE_SENA` | Porcentaje del precio que se cobra como sena (default 0.3) |
| `MINUTOS_EXPIRACION_SENA` | Minutos de bloqueo del turno mientras se paga la sena |

## Scripts

```bash
npm run dev            # servidor con reinicio automatico (nodemon)
npm start              # servidor en modo produccion
npm run prisma:migrate # aplicar/crear migraciones en desarrollo
npm run prisma:generate# regenerar el cliente de Prisma
```

## Endpoints principales

| Metodo y path | Rol | Descripcion |
| --- | --- | --- |
| `POST /api/auth/registro/jugador` | - | RF1: registro de jugador |
| `POST /api/auth/registro/administrador` | - | RF2: registro de administrador |
| `POST /api/auth/login` | - | Login (devuelve JWT) |
| `GET /api/complejos?zona=&tipo=` | - | RF3/RF5: busqueda de complejos |
| `GET /api/complejos/:id/turnos-libres?fecha=` | - | RF4: turnos libres de un complejo |
| `POST /api/complejos` | Administrador | RF2: registrar complejo propio |
| `POST /api/complejos/:complejoId/canchas` | Administrador | RF9: alta de cancha |
| `PUT /api/canchas/:id` | Administrador | RF9: modificar cancha/tarifas |
| `POST /api/reservas` | Jugador | RF6/RF7/RF11: crear reserva |
| `POST /api/reservas/:id/pagar-sena` | Jugador | Confirma el pago de la sena (mock) |
| `POST /api/reservas/:id/cancelar` | Jugador | RF8: cancelar (con devolucion si aplica) |
| `GET /api/reservas/mias` | Jugador | Listar mis reservas |
| `GET /api/complejos/:complejoId/agenda?fecha=` | Administrador | RF10: agenda diaria |
| `POST /api/reservas/:id/pagar-saldo` | Administrador | RF10: registrar pago de saldo |
