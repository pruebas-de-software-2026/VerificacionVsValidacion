import { z } from "zod";

const isoDateTimeWithOffset = z.iso.datetime({ offset: true });

export const createReservationBodySchema = z
  .object({
    clientId: z.string().trim().min(1, "El cliente es obligatorio"),
    technicianId: z.string().trim().min(1, "El técnico es obligatorio"),
    startAt: isoDateTimeWithOffset,
    endAt: isoDateTimeWithOffset,
    description: z
      .string()
      .trim()
      .min(1, "La descripción es obligatoria")
      .max(2000, "Máximo 2000 caracteres"),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startAt);
    const end = new Date(data.endAt);
    if (Number.isNaN(start.getTime())) {
      ctx.addIssue({ code: "custom", message: "Fecha y hora de inicio inválidas", path: ["startAt"] });
      return;
    }
    if (Number.isNaN(end.getTime())) {
      ctx.addIssue({ code: "custom", message: "Fecha y hora de fin inválidas", path: ["endAt"] });
      return;
    }
    if (end <= start) {
      ctx.addIssue({ code: "custom", message: "La hora de fin debe ser posterior a la de inicio", path: ["endAt"] });
    }
  });

export type CreateReservationBody = z.infer<typeof createReservationBodySchema>;

const optionalBoolString = z
  .enum(["true", "false"])
  .optional()
  .transform((v) => v === "true");

export const listReservationsQuerySchema = z
  .object({
    from: isoDateTimeWithOffset.optional(),
    technicianId: z.string().trim().min(1, "El identificador del técnico no es válido").optional(),
    includeCancelled: optionalBoolString,
  })
  .strict();

export type ListReservationsParsedQuery = z.infer<typeof listReservationsQuerySchema>;
