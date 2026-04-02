import { z } from "zod";

const optionalEmail = z
  .union([z.string().email(), z.literal("")])
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : v));

export const clientFormSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(200),
  email: optionalEmail,
  phone: z
    .string()
    .trim()
    .max(50)
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;
