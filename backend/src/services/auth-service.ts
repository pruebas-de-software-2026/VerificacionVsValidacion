import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { Role } from "../../generated/prisma/client";
import { authConfig } from "../config/auth-config";
import { HttpError } from "../errors/http-error";
import { prisma } from "./prisma";

type SafeUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
};

export type AuthTokenPayload = JwtPayload & {
  sub: string;
  email: string;
  role: Role;
};

export async function authenticateUser(email: string, password: string): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      passwordHash: true,
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
  };
}

export function signAccessToken(user: SafeUser): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    authConfig.jwtSecret,
    {
      expiresIn: authConfig.jwtExpiresIn as jwt.SignOptions["expiresIn"],
    },
  );
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  try {
    const decoded = jwt.verify(token, authConfig.jwtSecret) as AuthTokenPayload;

    if (!decoded.sub || !decoded.email || !decoded.role) {
      throw new HttpError(401, "Token de autenticación inválido");
    }

    if (decoded.role !== Role.ADMIN && decoded.role !== Role.LECTOR) {
      throw new HttpError(401, "Token de autenticación inválido");
    }

    return decoded;
  } catch {
    throw new HttpError(401, "Se requiere autenticación");
  }
}

export async function findActiveUserById(userId: string): Promise<SafeUser | null> {
  return prisma.user.findFirst({
    where: {
      id: userId,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
    },
  });
}
