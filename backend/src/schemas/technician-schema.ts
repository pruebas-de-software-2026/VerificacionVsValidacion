import { z } from "zod";

export const createTechnicianBodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  specialty: z.string().trim().min(1).max(200),
  isActive: z.boolean().optional(),
});

export const updateTechnicianBodySchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  specialty: z.string().trim().min(1).max(200).optional(),
  isActive: z.boolean().optional(),
});

export type CreateTechnicianBody = z.infer<typeof createTechnicianBodySchema>;
export type UpdateTechnicianBody = z.infer<typeof updateTechnicianBodySchema>;
