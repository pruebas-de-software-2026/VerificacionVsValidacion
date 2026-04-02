import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/http-error";
import { parseBody } from "../lib/parse-body";
import { parsePaginationQuery } from "../lib/pagination";
import { pathParamId } from "../lib/path-param";
import {
  createReservationBodySchema,
  listReservationsQuerySchema,
} from "../schemas/reservation-schema";
import * as reservationService from "../services/reservation-service";

export async function listReservations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pagination = parsePaginationQuery(req.query as Record<string, unknown>);
    const filters = parseBody(listReservationsQuerySchema, {
      from: req.query.from,
      technicianId: req.query.technicianId,
      includeCancelled: req.query.includeCancelled,
    });
    const result = await reservationService.listReservations({ ...pagination, ...filters });
    res.status(200).json({ status: "ok", data: result });
  } catch (error: unknown) {
    next(error);
  }
}

export async function createReservation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = parseBody(createReservationBodySchema, req.body);
    const reservation = await reservationService.createReservation(body);
    res.status(201).json({ status: "ok", data: { reservation } });
  } catch (error: unknown) {
    next(error);
  }
}

export async function cancelReservation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = pathParamId(req.params.id);
    if (!id) {
      throw new HttpError(400, "id is required");
    }
    const reservation = await reservationService.cancelReservation(id);
    res.status(200).json({ status: "ok", data: { reservation } });
  } catch (error: unknown) {
    next(error);
  }
}
