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
3. PostgreSQL 14+

Verificar versiones:

```bash
node -v
npm -v
psql --version
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

## Comandos utiles

Backend:

```bash
npm run build
npm run start
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
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