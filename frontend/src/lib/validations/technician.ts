import { z } from "zod";

export const technicianFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre completo es obligatorio").max(200),
  specialty: z
    .string()
    .trim()
    .min(1, "La especialidad principal es obligatoria")
    .max(200),
});

export type TechnicianFormValues = z.infer<typeof technicianFormSchema>;
