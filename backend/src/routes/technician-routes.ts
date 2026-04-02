import { Router } from "express";
import { Role } from "../../generated/prisma/client";
import * as technicianController from "../controllers/technician-controller";
import { authenticate, authorizeRoles } from "../middleware/auth-middleware";

const technicianRouter = Router();

technicianRouter.get(
  "/",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.LECTOR),
  technicianController.listTechnicians,
);
technicianRouter.get(
  "/:id",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.LECTOR),
  technicianController.getTechnician,
);
technicianRouter.post("/", authenticate, authorizeRoles(Role.ADMIN), technicianController.createTechnician);
technicianRouter.put(
  "/:id",
  authenticate,
  authorizeRoles(Role.ADMIN),
  technicianController.updateTechnician,
);

export { technicianRouter };
