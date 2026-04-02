# Instrucciones de despliegue — Reservas técnicas (MVP)

## Prerrequisitos

- Node.js 20+ y npm 10+.
- PostgreSQL 14+ accesible desde el servidor de aplicación.
- Variables de entorno configuradas (no commitear secretos reales).

## Variables de entorno

### Backend

Copiar `backend/.env.example` a `backend/.env` y completar al menos:

- `DATABASE_URL` — cadena Prisma/PostgreSQL.
- `JWT_SECRET` — secreto largo y aleatorio.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` y `LECTOR_EMAIL`, `LECTOR_PASSWORD`, `LECTOR_NAME` — necesarios para `npm run prisma:seed` en el primer arranque (admin y usuario lector).

Opcionales documentadas en el ejemplo: `PORT`, `CORS_ORIGIN`, cookies (`AUTH_COOKIE_*`), `LOG_LEVEL`, etc.

### Frontend

En producción, el frontend debe conocer la URL del API para el rewrite:

- `BACKEND_URL` — origen del backend **sin** barra final (ej. `https://api.ejemplo.com`). Next.js proxifica `/backend/*` hacia ese origen ([`frontend/next.config.ts`](../frontend/next.config.ts)).

## Base de datos

Desde `backend/`:

```bash
npm ci
npm run build
npm run start
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run prisma:studio
npm run test:auth-smoke
npm run test:auth-http
```

El seed crea o actualiza de forma idempotente el administrador y el usuario lector definidos en `.env`.

## Build y arranque

### Backend

```bash
cd backend
npm ci
npm run build
npm run start
```

Por defecto el servidor escucha en el puerto configurado en `PORT` (4000 en desarrollo).

### Frontend

```bash
cd frontend
npm ci
npm run build
npm run start
```

Next.js sirve en el puerto 3000 por defecto (`PORT` modificable).

Orden recomendado: levantar PostgreSQL → migraciones/seed → backend → frontend (o colocar ambos detrás de un reverse proxy que enrute `/backend` al API y `/` al Next).

## Pruebas E2E (Playwright)

En `frontend/`:

```bash
npm run build
npx playwright install chromium
npm run test:e2e
```

Con `CI=true`, Playwright arranca `npm run start` automáticamente. En local, puede reutilizarse un `npm run dev` en marcha (`reuseExistingServer`).

Variable opcional: `PLAYWRIGHT_BASE_URL` si el front no está en `http://127.0.0.1:3000`.

## Checklist rápido de seguridad antes de producción

- Rotar `JWT_SECRET` y contraseña del admin seed.
- `AUTH_COOKIE_SECURE=true` y HTTPS.
- `CORS_ORIGIN` acotado al dominio del frontend.
- Revisar `LOG_LEVEL` y retención de logs según política del equipo.
