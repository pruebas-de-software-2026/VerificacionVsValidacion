import { HttpError } from "../errors/http-error";

const WEEKDAY_ALLOWED = new Set(["Mon", "Tue", "Wed", "Thu", "Fri"]);

/** Zona horaria para horario laboral (IANA). Por defecto Santiago de Chile (`America/Santiago`); en tests suele fijarse `UTC`. */
export function getBusinessTimezone(): string {
  return process.env.BUSINESS_TIMEZONE?.trim() || "America/Santiago";
}

const BUSINESS_START_HOUR = 9;
const BUSINESS_END_HOUR = 18; // último bloque termina a las 18:00 (inicio 17:00)

type ZonedParts = { weekday: string; hour: number; minute: number; second: number };

function getZonedParts(instant: Date, timeZone: string): ZonedParts {
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = dtf.formatToParts(instant);
  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== "literal") {
      map[p.type] = p.value;
    }
  }
  return {
    weekday: map.weekday ?? "",
    hour: Number.parseInt(map.hour ?? "0", 10),
    minute: Number.parseInt(map.minute ?? "0", 10),
    second: Number.parseInt(map.second ?? "0", 10),
  };
}

/**
 * Comprueba horario laboral L–V, franja 09:00–18:00 (último inicio 17:00),
 * bloques enteros de 1 h y duración exacta de 60 minutos en UTC.
 */
export function assertValidReservationSlot(startAt: Date, endAt: Date): void {
  const tz = getBusinessTimezone();
  const durationMs = endAt.getTime() - startAt.getTime();
  if (durationMs !== 60 * 60 * 1000) {
    throw new HttpError(400, "Reservation must be exactly 1 hour long");
  }

  if (endAt.getTime() <= startAt.getTime()) {
    throw new HttpError(400, "endAt must be after startAt");
  }

  const start = getZonedParts(startAt, tz);
  const end = getZonedParts(endAt, tz);

  if (!WEEKDAY_ALLOWED.has(start.weekday)) {
    throw new HttpError(400, "Reservations are only available Monday through Friday");
  }
  if (!WEEKDAY_ALLOWED.has(end.weekday)) {
    throw new HttpError(400, "Reservations are only available Monday through Friday");
  }

  if (start.minute !== 0 || start.second !== 0 || end.minute !== 0 || end.second !== 0) {
    throw new HttpError(
      400,
      "Start and end must align to full-hour blocks in the configured business timezone",
    );
  }

  if (start.hour < BUSINESS_START_HOUR || start.hour > BUSINESS_END_HOUR - 1) {
    throw new HttpError(
      400,
      `Start time must be between ${BUSINESS_START_HOUR}:00 and ${BUSINESS_END_HOUR - 1}:00 in the business timezone`,
    );
  }

  if (end.hour < BUSINESS_START_HOUR + 1 || end.hour > BUSINESS_END_HOUR) {
    throw new HttpError(400, `End time must fall within business hours (${BUSINESS_START_HOUR + 1}:00–${BUSINESS_END_HOUR}:00)`);
  }
}
