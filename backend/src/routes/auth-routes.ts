import { Router } from "express";
import { Role } from "../../generated/prisma/client";
import { login, logout, me } from "../controllers/auth-controller";
import { authenticate, authorizeRoles } from "../middleware/auth-middleware";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", authenticate, me);

// Probe endpoints to validate RBAC policy quickly during development.
authRouter.get("/rbac/probe", authenticate, authorizeRoles(Role.ADMIN, Role.LECTOR), (_req, res) => {
  res.status(200).json({ status: "ok", access: "read" });
});

authRouter.post("/rbac/probe", authenticate, authorizeRoles(Role.ADMIN), (_req, res) => {
  res.status(200).json({ status: "ok", access: "write" });
});

export { authRouter };
