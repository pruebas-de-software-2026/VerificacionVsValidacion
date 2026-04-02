# Contratos API — Clientes, técnicos y reservas

Base URL del backend: por defecto `http://localhost:4000`. En el frontend Next.js, las rutas se consumen vía proxy same-origin: `/backend/*` (rewrite configurado en `next.config.ts` hacia `BACKEND_URL`).

## Autenticación

- **Cookie httpOnly:** tras `POST /auth/login`, el token JWT se envía en la cookie `auth_token` (nombre configurable con `AUTH_COOKIE_NAME`).
- **Bearer:** alternativamente, `Authorization: Bearer <jwt>` en cualquier petición protegida.

Sin sesión válida, las rutas de catálogo responden **401**.

## Roles (RBAC)

| Acción                 | ADMIN | LECTOR |
| ---------------------- | ----- | ------ |
| GET listado / detalle  | sí    | sí     |
| POST / PUT catálogos   | sí    | no (403) |
| GET `/reservations`    | sí    | sí     |
| POST `/reservations`   | sí    | no (403) |
| PATCH `/reservations/:id/cancel` | sí | no (403) |

---

## Clientes — `/clients`

### GET `/clients`

**Query:** `page` (default 1), `pageSize` (default 20, máx. 100).

**200**

```json
{
  "status": "ok",
  "data": {
    "items": [
      {
        "id": "string",
        "name": "string",
        "email": "string | null",
        "phone": "string | null",
        "createdAt": "ISO-8601",
        "updatedAt": "ISO-8601"
      }
    ],
    "total": 0,
    "page": 1,
    "pageSize": 20
  }
}
```

### GET `/clients/:id`

**404** si no existe.

**200**

```json
{
  "status": "ok",
  "data": {
    "client": { "...": "mismo shape que en items" }
  }
}
```

### POST `/clients`

**Body (JSON)**

| Campo  | Tipo   | Reglas                          |
| ------ | ------ | ------------------------------- |
| `name` | string | obligatorio, 1–200 caracteres   |
| `email`| string | opcional, email válido si se envía |
| `phone`| string | opcional, máx. 50 caracteres    |

**201** — `data.client` creado.

**400** — validación Zod:

```json
{
  "status": "error",
  "message": "Validation failed",
  "issues": [{ "...": "ZodIssue" }],
  "requestId": "uuid"
}
```

**409** — email duplicado (índice único).

### PUT `/clients/:id`

**Body:** campos opcionales (`name`, `email`, `phone`); mismas reglas que creación.

**404** si el id no existe.

---

## Técnicos — `/technicians`

Misma forma de paginación y envoltorio `status` / `data` que clientes.

### POST `/technicians`

| Campo        | Tipo    | Reglas                        |
| ------------ | ------- | ----------------------------- |
| `name`       | string  | obligatorio, 1–200            |
| `specialty`  | string  | opcional                      |
| `isActive`   | boolean | opcional (default **true** en BD) |

### PUT `/technicians/:id`

Permite actualizar `name`, `specialty`, `isActive` (cualquiera presente).

**200** — `data.technician` actualizado.

---

## Reservas — `/reservations`

### GET `/reservations`

**Autenticación:** ADMIN y LECTOR (solo lectura).

**Query**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| `page` | number | Default 1 |
| `pageSize` | number | Default 20, máx. 100 |
| `from` | ISO-8601 con offset | Opcional. Solo reservas con `startAt >= from`. Si se omite, se usa la fecha/hora actual del servidor. |
| `technicianId` | string | Opcional. Filtra por técnico. |
| `includeCancelled` | `true` \| `false` | Opcional. Default implícito `false`: excluye `status = CANCELADO`. Con `true`, incluye también canceladas (útil para auditoría). |

**Orden:** `technicianId` ascendente, luego `startAt` ascendente.

**200**

Cada ítem incluye relaciones resumidas:

```json
{
  "status": "ok",
  "data": {
    "items": [
      {
        "id": "string",
        "clientId": "string",
        "technicianId": "string",
        "startAt": "ISO-8601",
        "endAt": "ISO-8601",
        "status": "PENDIENTE | CONFIRMADO | CANCELADO",
        "createdAt": "ISO-8601",
        "updatedAt": "ISO-8601",
        "client": { "id": "string", "name": "string" },
        "technician": { "id": "string", "name": "string" }
      }
    ],
    "total": 0,
    "page": 1,
    "pageSize": 20
  }
}
```

**400** — query inválido (validación Zod).

---

### PATCH `/reservations/:id/cancel`

Solo **ADMIN**. **Soft delete:** actualiza `status` a `CANCELADO` sin borrar la fila (auditoría). Si la reserva ya está cancelada, responde **200** de forma idempotente con el mismo registro.

**Body:** vacío o ignorado.

**200** — `data.reservation` con el mismo shape que en POST, más `client` y `technician` anidados (como en GET).

**403** — rol LECTOR u otro no autorizado.

**404** — id inexistente.

---

### POST `/reservations`

Solo **ADMIN**. Crea una reserva con intervalo medio-abierto `[startAt, endAt)` a nivel de negocio: dos bloques adyacentes (fin = inicio del siguiente) **no** se consideran solapados.

**Body (JSON)**

| Campo           | Tipo   | Reglas |
| --------------- | ------ | ------ |
| `clientId`      | string | obligatorio, id existente |
| `technicianId`  | string | obligatorio, id existente y técnico activo (`isActive`) |
| `startAt`       | string | ISO-8601 **con offset explícito o `Z`** (ej. `2028-01-10T14:00:00.000Z`) |
| `endAt`         | string | ISO-8601 con offset; debe ser **estrictamente posterior** a `startAt` |

**201**

```json
{
  "status": "ok",
  "data": {
    "reservation": {
      "id": "string",
      "clientId": "string",
      "technicianId": "string",
      "startAt": "ISO-8601",
      "endAt": "ISO-8601",
      "status": "PENDIENTE | CONFIRMADO | CANCELADO",
      "createdAt": "ISO-8601",
      "updatedAt": "ISO-8601"
    }
  }
}
```

**400** — validación Zod, cliente/técnico inexistente, técnico inactivo, o `startAt` en el pasado (`message` legible; sin `code` estable).

**409** — solapamiento con otra reserva no cancelada del mismo técnico:

```json
{
  "status": "error",
  "message": "Technician already has a reservation in this time range",
  "code": "RESERVATION_OVERLAP",
  "requestId": "uuid"
}
```

**Concurrencia:** la creación usa transacción y `pg_advisory_xact_lock` por técnico para que dos peticiones simultáneas al mismo slot no persistan dos filas.

---

## Puntos de sincronización Dev A (backend) / Dev B (frontend)

1. **Prefijos:** `/clients`, `/technicians`, `/reservations` (sin versionado en MVP).
2. **Errores 400:** siempre incluir `issues` cuando el fallo es de validación Zod.
3. **Paginación:** mismos nombres `page` y `pageSize` en listados.
4. **Cookies:** el front debe enviar la cookie de sesión al proxy `/backend/*` (`credentials: 'include'` en el cliente; cabecera `cookie` en Server Components / Server Actions).
5. **Reservas:** el frontend compone fecha local + hora, valida futuro y envía `startAt`/`endAt` con `Date.toISOString()` (siempre terminación `Z`). El backend valida de nuevo en UTC.
