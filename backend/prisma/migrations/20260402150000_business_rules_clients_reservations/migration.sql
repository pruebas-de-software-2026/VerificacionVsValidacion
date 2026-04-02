-- Reglas de negocio: datos obligatorios, estados de reserva, descripción.

-- Cliente: teléfono y dirección obligatorios
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "address" TEXT NOT NULL DEFAULT '';

UPDATE "Client" SET "phone" = '+0000000000' WHERE "phone" IS NULL;
ALTER TABLE "Client" ALTER COLUMN "phone" SET NOT NULL;

-- Técnico: especialidad obligatoria
UPDATE "Technician" SET "specialty" = 'General' WHERE "specialty" IS NULL;
ALTER TABLE "Technician" ALTER COLUMN "specialty" SET NOT NULL;

-- Reserva: descripción
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "description" TEXT NOT NULL DEFAULT '';

-- Estados: PROGRAMADA, COMPLETADA, CANCELADA
CREATE TYPE "ReservationStatus_new" AS ENUM ('PROGRAMADA', 'COMPLETADA', 'CANCELADA');

ALTER TABLE "Reservation" ADD COLUMN "status_new" "ReservationStatus_new" NOT NULL DEFAULT 'PROGRAMADA';

UPDATE "Reservation" SET "status_new" = (
  CASE "status"::text
    WHEN 'PENDIENTE' THEN 'PROGRAMADA'::"ReservationStatus_new"
    WHEN 'CONFIRMADO' THEN 'PROGRAMADA'::"ReservationStatus_new"
    WHEN 'CANCELADO' THEN 'CANCELADA'::"ReservationStatus_new"
    ELSE 'PROGRAMADA'::"ReservationStatus_new"
  END
);

ALTER TABLE "Reservation" DROP COLUMN "status";
DROP TYPE "ReservationStatus";

ALTER TYPE "ReservationStatus_new" RENAME TO "ReservationStatus";

ALTER TABLE "Reservation" RENAME COLUMN "status_new" TO "status";
ALTER TABLE "Reservation" ALTER COLUMN "status" SET DEFAULT 'PROGRAMADA'::"ReservationStatus";
