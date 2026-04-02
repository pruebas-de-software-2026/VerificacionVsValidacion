import { z } from "zod";

const isoDateTimeWithOffset = z.iso.datetime({ offset: true });

export const createReservationBodySchema = z
  .object({
    clientId: z.string().trim().min(1),
    technicianId: z.string().trim().min(1),
    startAt: isoDateTimeWithOffset,
    endAt: isoDateTimeWithOffset,
    description: z.string().trim().min(1).max(2000),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startAt);
    const end = new Date(data.endAt);
    if (Number.isNaN(start.getTime())) {
      ctx.addIssue({ code: "custom", message: "Invalid startAt", path: ["startAt"] });
      return;
    }
    if (Number.isNaN(end.getTime())) {
      ctx.addIssue({ code: "custom", message: "Invalid endAt", path: ["endAt"] });
      return;
    }
    if (end <= start) {
      ctx.addIssue({ code: "custom", message: "endAt must be after startAt", path: ["endAt"] });
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
    technicianId: z.string().trim().min(1).optional(),
    includeCancelled: optionalBoolString,
  })
  .strict();

export type ListReservationsParsedQuery = z.infer<typeof listReservationsQuerySchema>;
