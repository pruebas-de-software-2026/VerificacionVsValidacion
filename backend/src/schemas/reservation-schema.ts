import { z } from "zod";

const isoDateTimeWithOffset = z.iso.datetime({ offset: true });

export const createReservationBodySchema = z
  .object({
    clientId: z.string().trim().min(1),
    technicianId: z.string().trim().min(1),
    startAt: isoDateTimeWithOffset,
    endAt: isoDateTimeWithOffset,
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
