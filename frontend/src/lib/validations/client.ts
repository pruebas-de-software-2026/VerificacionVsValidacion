import { z } from "zod";

const optionalEmail = z
  .union([z.string().email(), z.literal("")])
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : v));

export const clientFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre completo es obligatorio").max(200),
  email: optionalEmail,
  phone: z.string().trim().min(1, "El teléfono principal es obligatorio").max(50),
  address: z.string().trim().min(1, "La dirección de atención es obligatoria").max(500),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;
