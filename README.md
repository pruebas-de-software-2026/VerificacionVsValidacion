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

## Configuracion inicial del backend (primera vez)

1. Copiar la plantilla de variables de entorno (no commitear el archivo real con secretos):

   ```bash
   cp backend/.env.example backend/.env
   ```

   En Windows (PowerShell):

   ```powershell
   Copy-Item backend\.env.example backend\.env
   ```

2. Editar `backend/.env` y completar al menos `JWT_SECRET`, `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `ADMIN_NAME` (estas tres ultimas son obligatorias para `npm run prisma:seed`).

3. Levantar PostgreSQL (por ejemplo con Docker Compose en la raiz), ejecutar migraciones y seed segun [Comandos utiles](#comandos-utiles).

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
npm run test:auth-http
```

`test:auth-http` comprueba el flujo HTTP real (`login`, `me`, `logout`) y requiere base de datos accesible, migraciones aplicadas, seed ejecutado y las mismas variables que el seed en `backend/.env`.

## Endpoints de autenticacion (backend)

Base URL: `http://localhost:4000`

- `POST /auth/login`
  - Body JSON: `{ "email": "admin@reservas.local", "password": "..." }`
  - Respuesta: usuario autenticado + cookie httpOnly de sesion.
- `POST /auth/logout`
  - Limpia la cookie de sesion.
- `GET /auth/me`
  - Requiere cookie valida y devuelve el usuario actual.
- `GET /auth/rbac/probe`
  - Requiere autenticacion (`ADMIN` o `LECTOR`).
- `POST /auth/rbac/probe`
  - Requiere rol `ADMIN` (sirve para validar bloqueo de mutaciones para `LECTOR`).

Los endpoints `/auth/rbac/probe` son utilitarios de desarrollo; en produccion no deben sustituir una politica de permisos sobre las APIs de negocio. Antes de un despliegue publico, rotar `JWT_SECRET` y la contrasena del administrador seed; usar HTTPS, `AUTH_COOKIE_SECURE=true` y un `CORS_ORIGIN` acotado al dominio del frontend. Detalle en [docs/implementacion-fase-2-auth.md](docs/implementacion-fase-2-auth.md) (seccion 7).

Variables recomendadas en `backend/.env` para auth:

- `JWT_SECRET`: secreto para firmar JWT (obligatoria).
- `JWT_EXPIRES_IN`: expiracion del token (default `15m`).
- `AUTH_COOKIE_NAME`: nombre de la cookie (default `auth_token`).
- `AUTH_COOKIE_SAMESITE`: `lax`, `strict` o `none` (default `lax`).
- `AUTH_COOKIE_SECURE`: `true/false` (default `true` en produccion).
- `AUTH_COOKIE_MAX_AGE_MS`: vida de cookie en ms (default `900000`).
- `AUTH_COOKIE_PATH`: path de cookie (default `/`).
- `CORS_ORIGIN`: lista separada por comas de origenes permitidos (default `http://localhost:3000`).

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

- **Backend**: Express + TypeScript + Prisma; modelo `User` con roles `ADMIN` y `LECTOR`; seed idempotente para el primer administrador; autenticacion con JWT en cookie httpOnly (`POST /auth/login`, `POST /auth/logout`, `GET /auth/me`); middleware `authenticate` / `authorizeRoles` y sondas RBAC bajo `/auth/rbac/probe`.
- **Frontend**: Next.js + Tailwind + shadcn/ui; la pantalla de login hacia el API aun no esta integrada en la UI (landing por defecto de Next.js).
- **Pruebas**: `npm run test:auth-smoke` (seed y restricciones en BD); `npm run test:auth-http` (flujo HTTP con credenciales del admin en `.env`).
