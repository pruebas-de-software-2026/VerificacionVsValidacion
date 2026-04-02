import { z } from "zod";

export const technicianFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(200),
  specialty: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
});

export type TechnicianFormValues = z.infer<typeof technicianFormSchema>;
