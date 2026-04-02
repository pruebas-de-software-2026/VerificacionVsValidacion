import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/http-error";
import { parseBody } from "../lib/parse-body";
import { pathParamId } from "../lib/path-param";
import { parsePaginationQuery } from "../lib/pagination";
import { createClientBodySchema, updateClientBodySchema } from "../schemas/client-schema";
import * as clientService from "../services/client-service";

export async function listClients(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pagination = parsePaginationQuery(req.query as Record<string, unknown>);
    const result = await clientService.listClients(pagination);
    res.status(200).json({ status: "ok", data: result });
  } catch (error: unknown) {
    next(error);
  }
}

export async function getClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = pathParamId(req.params.id);
    if (!id) {
      throw new HttpError(400, "El identificador es obligatorio");
    }

    const client = await clientService.getClientById(id);
    if (!client) {
      throw new HttpError(404, "No se encontró el cliente");
    }

    res.status(200).json({ status: "ok", data: { client } });
  } catch (error: unknown) {
    next(error);
  }
}

export async function createClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = parseBody(createClientBodySchema, req.body);
    const client = await clientService.createClient(body);
    res.status(201).json({ status: "ok", data: { client } });
  } catch (error: unknown) {
    next(error);
  }
}

export async function updateClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = pathParamId(req.params.id);
    if (!id) {
      throw new HttpError(400, "El identificador es obligatorio");
    }

    const body = parseBody(updateClientBodySchema, req.body);
    const existing = await clientService.getClientById(id);
    if (!existing) {
      throw new HttpError(404, "No se encontró el cliente");
    }

    const client = await clientService.updateClient(id, body);
    res.status(200).json({ status: "ok", data: { client } });
  } catch (error: unknown) {
    next(error);
  }
}
