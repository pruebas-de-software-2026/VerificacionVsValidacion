import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/http-error";
import { parseBody } from "../lib/parse-body";
import { pathParamId } from "../lib/path-param";
import { parsePaginationQuery } from "../lib/pagination";
import {
  createTechnicianBodySchema,
  listTechniciansQuerySchema,
  updateTechnicianBodySchema,
} from "../schemas/technician-schema";
import * as technicianService from "../services/technician-service";

export async function listTechnicians(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pagination = parsePaginationQuery(req.query as Record<string, unknown>);
    const filters = parseBody(listTechniciansQuerySchema, {
      q: req.query.q,
      specialty: req.query.specialty,
      isActive: req.query.isActive,
    });
    const result = await technicianService.listTechnicians({ ...pagination, ...filters });
    res.status(200).json({ status: "ok", data: result });
  } catch (error: unknown) {
    next(error);
  }
}

export async function getTechnician(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = pathParamId(req.params.id);
    if (!id) {
      throw new HttpError(400, "El identificador es obligatorio");
    }

    const technician = await technicianService.getTechnicianById(id);
    if (!technician) {
      throw new HttpError(404, "No se encontró el técnico");
    }

    res.status(200).json({ status: "ok", data: { technician } });
  } catch (error: unknown) {
    next(error);
  }
}

export async function createTechnician(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = parseBody(createTechnicianBodySchema, req.body);
    const technician = await technicianService.createTechnician(body);
    res.status(201).json({ status: "ok", data: { technician } });
  } catch (error: unknown) {
    next(error);
  }
}

export async function updateTechnician(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = pathParamId(req.params.id);
    if (!id) {
      throw new HttpError(400, "El identificador es obligatorio");
    }

    const body = parseBody(updateTechnicianBodySchema, req.body);
    const existing = await technicianService.getTechnicianById(id);
    if (!existing) {
      throw new HttpError(404, "No se encontró el técnico");
    }

    const technician = await technicianService.updateTechnician(id, body);
    res.status(200).json({ status: "ok", data: { technician } });
  } catch (error: unknown) {
    next(error);
  }
}
