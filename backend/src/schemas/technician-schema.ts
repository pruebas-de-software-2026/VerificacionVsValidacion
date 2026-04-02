import { z } from "zod";

export const createTechnicianBodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  specialty: z
    .union([z.string().trim().max(200), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v === null || v === undefined ? null : v)),
  isActive: z.boolean().optional(),
});

export const updateTechnicianBodySchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  specialty: z
    .union([z.string().trim().max(200), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v === null || v === undefined ? undefined : v)),
  isActive: z.boolean().optional(),
});

export type CreateTechnicianBody = z.infer<typeof createTechnicianBodySchema>;
export type UpdateTechnicianBody = z.infer<typeof updateTechnicianBodySchema>;
