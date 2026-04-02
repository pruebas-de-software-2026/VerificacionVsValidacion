import type { ZodIssue } from "zod";

export class ValidationError extends Error {
  readonly statusCode = 400;

  readonly issues: ZodIssue[];

  constructor(issues: ZodIssue[]) {
    super("Los datos enviados no son válidos");
    this.name = "ValidationError";
    this.issues = issues;
  }
}
