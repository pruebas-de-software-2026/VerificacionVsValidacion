# Sistema de Gestion de Reservas Tecnicas

Aplicacion Backoffice para gestionar clientes, tecnicos y reservas de servicio tecnico con reglas para evitar solapamientos.

## Stack

### Frontend

- React
- Next.js
- Tailwind CSS
- shadcn/ui
- React Hook Form + Zod

### Backend

- Node.js
- Express.js
- JWT + bcrypt

### Base de datos

- PostgreSQL
- Prisma ORM

## Prerrequisitos

Instalar en tu maquina:

1. Node.js 20+
2. npm 10+
3. Docker Desktop (opcional, recomendado para levantar PostgreSQL con Compose)

Verificar versiones:

```bash
node -v
npm -v
docker --version
docker compose version
```

## Estructura del proyecto

```text
VerificacionVsValidacion/
	backend/
	frontend/
	README.md
```

## Ejecutar en desarrollo

Abrir dos terminales.

Terminal 1 (backend):

```bash
cd backend
npm run dev
```

Terminal 2 (frontend):

```bash
cd frontend
npm run dev
```

URLs locales:

- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Healthcheck backend: http://localhost:4000/health

## Levantar solo PostgreSQL con Docker Compose

Desde la raiz del proyecto:

```bash
docker compose up
```

Para ejecutar en segundo plano:

```bash
docker compose up -d
```

Detener servicios:

```bash
docker compose down
```

Detener y eliminar volumen de datos (reinicio limpio de base de datos):

```bash
docker compose down -v
```

Ver logs de PostgreSQL:

```bash
docker compose logs -f postgres
```

Notas importantes:

- Docker Compose en este proyecto levanta unicamente la base de datos PostgreSQL.
- El backend y frontend se ejecutan fuera de Docker con `npm run dev`.
- Para el backend local, usa en `backend/.env`: `postgresql://postgres:postgres@localhost:5434/reservas_db?schema=public`.

## Comandos utiles

Backend:

```bash
npm run build
npm run start
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run prisma:studio
npm run test:auth-smoke
```

## Logging backend

El backend usa logs estructurados con Pino y agrega `X-Request-Id` en cada respuesta para trazar requests.

Variables opcionales en `backend/.env`:

- `LOG_LEVEL`: nivel de log (`debug`, `info`, `warn`, `error`, `fatal`).
- `LOG_PRETTY`: usar formato legible en desarrollo (`true`/`false`).

Defaults:

- Produccion: `LOG_LEVEL=info`.
- Desarrollo: `LOG_LEVEL=debug`.
- `LOG_PRETTY` se recomienda solo para desarrollo local.

Ver logs en Docker Compose:

```bash
docker compose logs -f backend
```

Frontend:

```bash
npm run dev
npm run build
npm run start
```

## Estado actual

Fase 1 iniciada y funcionando:

- Backend inicializado con Express + TypeScript + Prisma
- Frontend inicializado con Next.js + Tailwind + shadcn/ui
- Dependencias de formularios y validacion instaladas
