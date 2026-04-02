import type { NextFunction, Request, Response } from "express";
import { Role } from "../../generated/prisma/client";
import { authConfig } from "../config/auth-config";
import { HttpError } from "../errors/http-error";
import { verifyAccessToken } from "../services/auth-service";

type AuthContext = {
  userId: string;
  email: string;
  role: Role;
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

function readBearerToken(req: Request): string | undefined {
  const raw = req.headers.authorization?.trim();
  if (!raw) {
    return undefined;
  }

  const match = /^Bearer\s+(.+)$/i.exec(raw);
  return match?.[1]?.trim() || undefined;
}

function readAuthToken(req: Request): string | undefined {
  const bearer = readBearerToken(req);
  if (bearer) {
    return bearer;
  }

  const reqWithCookies = req as Request & { cookies?: Record<string, string> };
  return reqWithCookies.cookies?.[authConfig.cookieName];
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = readAuthToken(req);

    if (!token) {
      throw new HttpError(401, "Authentication required");
    }

    const payload = verifyAccessToken(token);
    req.auth = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error: unknown) {
    next(error);
  }
}

export function authorizeRoles(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(new HttpError(401, "Authentication required"));
      return;
    }

    if (!allowedRoles.includes(req.auth.role)) {
      next(new HttpError(403, "Insufficient permissions"));
      return;
    }

    next();
  };
}
