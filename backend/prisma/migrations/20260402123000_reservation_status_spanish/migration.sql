-- Renombrar valores del enum a español (PostgreSQL 10+).
ALTER TYPE "ReservationStatus" RENAME VALUE 'PENDING' TO 'PENDIENTE';
ALTER TYPE "ReservationStatus" RENAME VALUE 'CONFIRMED' TO 'CONFIRMADO';
ALTER TYPE "ReservationStatus" RENAME VALUE 'CANCELLED' TO 'CANCELADO';
