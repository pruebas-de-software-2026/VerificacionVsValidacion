import { addHours } from "date-fns";
import { isValid, parse } from "date-fns";
import { z } from "zod";

export const reservationFormSchema = z
  .object({
    clientId: z.string().min(1, "Elige un cliente"),
    technicianId: z.string().min(1, "Elige un técnico"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Hora de inicio inválida"),
    description: z
      .string()
      .trim()
      .min(1, "Describe brevemente el problema o el electrodoméstico")
      .max(2000),
  })
  .superRefine((data, ctx) => {
    const start = parse(`${data.date} ${data.startTime}`, "yyyy-MM-dd HH:mm", new Date());
    const end = addHours(start, 1);
    if (!isValid(start) || !isValid(end)) {
      ctx.addIssue({ code: "custom", message: "Fecha u hora inválida", path: ["date"] });
      return;
    }
    const [hStr, mStr] = data.startTime.split(":");
    const h = Number.parseInt(hStr ?? "", 10);
    const m = Number.parseInt(mStr ?? "", 10);
    if (Number.isNaN(h) || Number.isNaN(m) || m !== 0 || h < 9 || h > 17) {
      ctx.addIssue({
        code: "custom",
        message: "Elige un bloque entre las 9:00 y las 17:00 (horario laboral 9:00–18:00)",
        path: ["startTime"],
      });
      return;
    }
    if (start.getTime() < Date.now()) {
      ctx.addIssue({
        code: "custom",
        message: "El horario de inicio debe ser en el futuro",
        path: ["startTime"],
      });
    }
  });

export type ReservationFormValues = z.infer<typeof reservationFormSchema>;

/** Construye fechas ISO (Z) en UTC: bloque fijo de 1 hora desde la hora de inicio. */
export function reservationFormToIsoPayload(values: ReservationFormValues): {
  startAt: string;
  endAt: string;
} {
  const start = parse(`${values.date} ${values.startTime}`, "yyyy-MM-dd HH:mm", new Date());
  const end = addHours(start, 1);
  return {
    startAt: start.toISOString(),
    endAt: end.toISOString(),
  };
}
