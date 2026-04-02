# ADR 0001: Cancelación de reservas como soft delete y vista en tabla (T-8)

## Why

- **Soft delete (`status = CANCELADO`):** Conservar la fila permite **auditoría** (quién, cuándo y en qué franja), informes históricos y trazabilidad sin romper referencias. Un `DELETE` físico borraría evidencia útil y complicaría integridad referencial.
- **Disponibilidad del técnico:** El motor de solapamiento ya ignora reservas canceladas; al cancelar, el intervalo **vuelve a estar libre** para nuevas citas (caso de reservas futuras).
- **Tabla de datos vs calendario:** Para el MVP, una **data table** ordenada por técnico y fecha reutiliza componentes existentes (shadcn/ui), reduce complejidad de zonas horarias y tiempo de desarrollo frente a un calendario interactivo completo.

## What

- **API:** `GET /reservations` (ADMIN y LECTOR) con paginación y filtros; `PATCH /reservations/:id/cancel` (solo ADMIN), idempotente si ya está cancelada.
- **UI:** Página de reservas con tabla de próximas citas, botón cancelar solo para **ADMIN** (rol obtenido de `GET /auth/me`). LECTOR ve la agenda sin acciones de mutación.
- **Persistencia:** Valores del enum en español: `PENDIENTE`, `CONFIRMADO`, `CANCELADO`.

## How

- **Prisma:** `update` del campo `status` a `CANCELADO`; no se usa `delete`.
- **Consultas de agenda:** Por defecto se excluyen canceladas (`includeCancelled` opcional para auditoría).
- **Solapamiento:** Las consultas de conflicto excluyen filas `CANCELADO`, por lo que el hueco queda disponible tras cancelar una reserva futura.
- **Cancelación de reservas pasadas:** Permitida para **ADMIN** para mantener coherencia documental y auditoría, sin efecto en disponibilidad futura.
