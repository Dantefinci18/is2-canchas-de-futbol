# Sistema de Turnos de Futbol (Trabajo Practico)
**Materia:** Ingenieria en Software 2
**Profesores:** Marcelo Eduardo Volpi, Vanesa Llasat y Lucas Giorgi

## Alumnos
| Alumno | Padron |
| :--- | :---: |
| Dante Finci | 108456 |
| | |
| | |
| | |

## Descripcion

Plataforma web que conecta jugadores con complejos de futbol adheridos: el jugador busca
canchas por zona, consulta turnos libres y reserva pagando una sena; cada complejo
administra sus propias canchas, precios, agenda y cobros. Ver el enunciado completo del
TP para el detalle de requisitos, diseño OO y patrones aplicados (Strategy para tarifas,
Singleton para la conexion a la base de datos).

## Estructura del repositorio

```
backend/   API REST (Node.js + Express + Prisma + PostgreSQL)
frontend/  SPA (React + Vite)
```

## Requisitos previos

- Node.js 20+
- PostgreSQL 14+ corriendo localmente (o accesible por `DATABASE_URL`)

## Puesta en marcha

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env       # completar DATABASE_URL y JWT_SECRET
npx prisma migrate dev     # crea las tablas en la base de datos
npm run dev                # http://localhost:3000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env       # VITE_API_URL=http://localhost:3000
npm run dev                # http://localhost:5173
```

Con ambos servidores corriendo, entra a `http://localhost:5173`. Podes registrarte como
**jugador** (para buscar y reservar canchas) o como **administrador** (para registrar tu
propio complejo y gestionarlo).

Mas detalles de cada parte en [backend/README.md](backend/README.md) y
[frontend/README.md](frontend/README.md).
