import { z } from "zod";

const optionalEmail = z
  .union([z.string().email("Introduce un correo electrónico válido"), z.literal(""), z.null()])
  .optional()
  .transform((v) => (v === "" || v === null || v === undefined ? undefined : v));

export const createClientBodySchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(200, "Máximo 200 caracteres"),
  email: optionalEmail,
  phone: z.string().trim().min(1, "El teléfono es obligatorio").max(50, "Máximo 50 caracteres"),
  address: z.string().trim().min(1, "La dirección es obligatoria").max(500, "Máximo 500 caracteres"),
});

export const updateClientBodySchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(200, "Máximo 200 caracteres").optional(),
  email: optionalEmail,
  phone: z.string().trim().min(1, "El teléfono es obligatorio").max(50, "Máximo 50 caracteres").optional(),
  address: z.string().trim().min(1, "La dirección es obligatoria").max(500, "Máximo 500 caracteres").optional(),
});

export type CreateClientBody = z.infer<typeof createClientBodySchema>;
export type UpdateClientBody = z.infer<typeof updateClientBodySchema>;

/** Query GET /clients */
export const listClientsQuerySchema = z
  .object({
    q: z.string().trim().max(200).optional(),
  })
  .strict();

export type ListClientsParsedQuery = z.infer<typeof listClientsQuerySchema>;
