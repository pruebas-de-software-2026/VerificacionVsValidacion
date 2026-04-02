import { z } from "zod";

export const createTechnicianBodySchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(200, "Máximo 200 caracteres"),
  specialty: z.string().trim().min(1, "La especialidad es obligatoria").max(200, "Máximo 200 caracteres"),
  isActive: z.boolean().optional(),
});

export const updateTechnicianBodySchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(200, "Máximo 200 caracteres").optional(),
  specialty: z.string().trim().min(1, "La especialidad es obligatoria").max(200, "Máximo 200 caracteres").optional(),
  isActive: z.boolean().optional(),
});

export type CreateTechnicianBody = z.infer<typeof createTechnicianBodySchema>;
export type UpdateTechnicianBody = z.infer<typeof updateTechnicianBodySchema>;

const optionalBoolString = z
  .enum(["true", "false"])
  .optional()
  .transform((v) => (v === undefined ? undefined : v === "true"));

/** Query GET /technicians */
export const listTechniciansQuerySchema = z
  .object({
    q: z.string().trim().max(200).optional(),
    specialty: z.string().trim().max(200).optional(),
    isActive: optionalBoolString,
  })
  .strict();

export type ListTechniciansParsedQuery = z.infer<typeof listTechniciansQuerySchema>;
