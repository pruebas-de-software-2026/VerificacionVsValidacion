import { isValid, parse } from "date-fns";
import { z } from "zod";

export const reservationFormSchema = z
  .object({
    clientId: z.string().min(1, "Elige un cliente"),
    technicianId: z.string().min(1, "Elige un técnico"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Hora de inicio inválida"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Hora de fin inválida"),
  })
  .superRefine((data, ctx) => {
    const start = parse(`${data.date} ${data.startTime}`, "yyyy-MM-dd HH:mm", new Date());
    const end = parse(`${data.date} ${data.endTime}`, "yyyy-MM-dd HH:mm", new Date());
    if (!isValid(start) || !isValid(end)) {
      ctx.addIssue({ code: "custom", message: "Fecha u hora inválida", path: ["date"] });
      return;
    }
    if (end.getTime() <= start.getTime()) {
      ctx.addIssue({
        code: "custom",
        message: "La hora de fin debe ser posterior a la de inicio",
        path: ["endTime"],
      });
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

/** Construye fechas ISO (Z) en UTC a partir de fecha local + horas del formulario. */
export function reservationFormToIsoPayload(values: ReservationFormValues): {
  startAt: string;
  endAt: string;
} {
  const start = parse(`${values.date} ${values.startTime}`, "yyyy-MM-dd HH:mm", new Date());
  const end = parse(`${values.date} ${values.endTime}`, "yyyy-MM-dd HH:mm", new Date());
  return {
    startAt: start.toISOString(),
    endAt: end.toISOString(),
  };
}
