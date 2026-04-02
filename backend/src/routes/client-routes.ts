import { Router } from "express";
import { Role } from "../../generated/prisma/client";
import * as clientController from "../controllers/client-controller";
import { authenticate, authorizeRoles } from "../middleware/auth-middleware";

const clientRouter = Router();

clientRouter.get(
  "/",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.LECTOR),
  clientController.listClients,
);
clientRouter.get(
  "/:id",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.LECTOR),
  clientController.getClient,
);
clientRouter.post("/", authenticate, authorizeRoles(Role.ADMIN), clientController.createClient);
clientRouter.put("/:id", authenticate, authorizeRoles(Role.ADMIN), clientController.updateClient);

export { clientRouter };
