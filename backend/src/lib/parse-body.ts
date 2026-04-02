import type { ZodSchema } from "zod";
import { ValidationError } from "../errors/validation-error";

export function parseBody<T>(schema: ZodSchema<T>, body: unknown): T {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues);
  }
  return parsed.data;
}
