import type { NextFunction, Request, Response } from "express";
import { parseBody } from "../lib/parse-body";
import { createReservationBodySchema } from "../schemas/reservation-schema";
import * as reservationService from "../services/reservation-service";

export async function createReservation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = parseBody(createReservationBodySchema, req.body);
    const reservation = await reservationService.createReservation(body);
    res.status(201).json({ status: "ok", data: { reservation } });
  } catch (error: unknown) {
    next(error);
  }
}
