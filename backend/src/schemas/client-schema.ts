import { z } from "zod";

const optionalEmail = z
  .union([z.string().email(), z.literal(""), z.null()])
  .optional()
  .transform((v) => (v === "" || v === null || v === undefined ? undefined : v));

export const createClientBodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: optionalEmail,
  phone: z
    .union([z.string().trim().max(50), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v === null || v === undefined ? null : v)),
});

export const updateClientBodySchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  email: optionalEmail,
  phone: z
    .union([z.string().trim().max(50), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v === null || v === undefined ? undefined : v)),
});

export type CreateClientBody = z.infer<typeof createClientBodySchema>;
export type UpdateClientBody = z.infer<typeof updateClientBodySchema>;
