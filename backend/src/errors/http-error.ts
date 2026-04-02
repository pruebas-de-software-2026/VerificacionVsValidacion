export class HttpError extends Error {
  statusCode: number;

  /** Código estable para el cliente (ej. RESERVATION_OVERLAP). */
  code?: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = code;
  }
}
