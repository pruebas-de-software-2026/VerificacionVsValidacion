# Reporte de pruebas — Sprint 3 (cierre MVP)

## Metadatos

| Campo | Valor |
| ----- | ----- |
| Repositorio (referencia) | commit `3182f6d` (actualizar en cada release) |
| Entorno de verificación local | Windows 10, Node 22, PostgreSQL (tests backend con BD de test) |

## Verificación (¿construimos el producto correctamente?)

Comandos ejecutados en la verificación de esta entrega:

| Ámbito | Comando | Resultado |
| ------ | ------- | --------- |
| Backend unit + HTTP | `cd backend && npm run test` | 48 tests OK |
| Backend cobertura | `cd backend && npm run test:coverage` | ~88 % líneas globales (v8) |
| Frontend unit | `cd frontend && npm run test` | 10 tests OK |
| Frontend build | `cd frontend && npm run build` | OK |
| E2E Playwright (smoke) | `cd frontend && npm run test:e2e` (con `CI=true` arranca `next start`) | 1 test OK |

## Matriz funcional vs automatización

| ID | Caso | Cobertura |
| -- | ---- | --------- |
| F4–F5 | Listar reservas futuras ordenadas por `technicianId` y `startAt` | `backend/tests/reservations-http.test.ts` — *lists future reservations ordered by technicianId then startAt* |
| F6 | Cancelar reserva futura libera el bloque (nuevo POST en el mismo slot → 201) | Mismo archivo — *cancel future reservation frees slot for new POST* |
| F7 | Cancelar reserva pasada (auditoría, ADMIN) | Mismo archivo — *cancel past reservation is allowed for audit* |
| F8 | LECTOR: GET listado OK; PATCH cancel → 403 | *lector can GET /reservations*; *lector cannot PATCH /reservations/:id/cancel* |
| — | Idempotencia cancel; 404 id desconocido | Tests dedicados en `reservations-http.test.ts` |

La UI (ocultar botón cancelar / formulario crear para LECTOR) se valida por integración con `GET /auth/me` en [`frontend/src/app/dashboard/reservations/page.tsx`](../frontend/src/app/dashboard/reservations/page.tsx); las pruebas de contrato HTTP garantizan el comportamiento de la API.

## UAT — Validación (¿el producto es el adecuado para el usuario?)

Sesión manual sugerida (no automatizada en este reporte):

1. Iniciar backend y frontend con `.env` coherentes; ejecutar seed si hace falta.
2. Flujo **ADMIN:** login → clientes/técnicos → crear reserva futura → comprobar fila en tabla ordenada → cancelar → crear otra reserva en el mismo horario sin conflicto.
3. Flujo **LECTOR:** login con usuario de solo lectura → abrir `/dashboard/reservations` → ver tabla sin botón cancelar ni formulario de alta.
4. (Opcional) Simulación de canal externo (p. ej. WhatsApp) solo a nivel de demo narrativa: registrar pedido en cliente y reflejarlo en reserva en el backoffice.

| Paso UAT | Resultado | Notas |
| -------- | --------- | ----- |
| Demo ADMIN (flujo completo) | Pendiente en entorno de negocio | Completar en revisión con stakeholders |
| Demo LECTOR (solo lectura) | Pendiente | |
| Legibilidad fechas/horas en tabla | Pendiente | |

## Artefactos CI

El workflow [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) ejecuta jobs `backend`, `frontend` y `e2e` (Playwright Chromium tras `next build`).
