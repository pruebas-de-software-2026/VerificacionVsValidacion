import "dotenv/config";
import type { CookieOptions } from "express";

const jwtSecret = process.env.JWT_SECRET?.trim();

if (!jwtSecret) {
  throw new Error("Missing required environment variable: JWT_SECRET");
}

const authCookieName = process.env.AUTH_COOKIE_NAME?.trim() || "auth_token";
const jwtExpiresIn = process.env.JWT_EXPIRES_IN?.trim() || "15m";
const secureCookie = process.env.AUTH_COOKIE_SECURE
  ? process.env.AUTH_COOKIE_SECURE === "true"
  : process.env.NODE_ENV === "production";

function resolveSameSite(): CookieOptions["sameSite"] {
  const raw = process.env.AUTH_COOKIE_SAMESITE?.trim().toLowerCase();

  if (raw === "strict" || raw === "lax" || raw === "none") {
    return raw;
  }

  return "lax";
}

function resolveMaxAgeMs(): number {
  const raw = process.env.AUTH_COOKIE_MAX_AGE_MS?.trim();

  if (!raw) {
    return 15 * 60 * 1000;
  }

  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error("AUTH_COOKIE_MAX_AGE_MS must be a positive integer");
  }

  return parsed;
}

const authCookiePath = process.env.AUTH_COOKIE_PATH?.trim() || "/";

export const authConfig = {
  jwtSecret,
  jwtExpiresIn,
  cookieName: authCookieName,
};

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: secureCookie,
  sameSite: resolveSameSite(),
  path: authCookiePath,
  maxAge: resolveMaxAgeMs(),
};

export const authCookieClearOptions: CookieOptions = {
  httpOnly: true,
  secure: authCookieOptions.secure,
  sameSite: authCookieOptions.sameSite,
  path: authCookieOptions.path,
};
