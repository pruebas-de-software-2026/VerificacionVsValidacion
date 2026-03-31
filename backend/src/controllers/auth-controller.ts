import type { NextFunction, Request, Response } from "express";
import { authConfig, authCookieClearOptions, authCookieOptions } from "../config/auth-config";
import { HttpError } from "../errors/http-error";
import { authenticateUser, findActiveUserById, signAccessToken } from "../services/auth-service";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = (req.body ?? {}) as LoginBody;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      throw new HttpError(422, "email and password are required");
    }

    const user = await authenticateUser(email, password);
    if (!user) {
      throw new HttpError(401, "Invalid credentials");
    }

    const accessToken = signAccessToken(user);

    res.cookie(authConfig.cookieName, accessToken, authCookieOptions);
    res.status(200).json({
      status: "ok",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}

export function logout(_req: Request, res: Response): void {
  res.clearCookie(authConfig.cookieName, authCookieClearOptions);
  res.status(200).json({
    status: "ok",
    message: "Session closed",
  });
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.auth) {
      throw new HttpError(401, "Authentication required");
    }

    const user = await findActiveUserById(req.auth.userId);
    if (!user) {
      throw new HttpError(401, "Authentication required");
    }

    res.status(200).json({
      status: "ok",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    next(error);
  }
}
