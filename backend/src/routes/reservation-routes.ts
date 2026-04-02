import { Router } from "express";
import { Role } from "../../generated/prisma/client";
import * as reservationController from "../controllers/reservation-controller";
import { authenticate, authorizeRoles } from "../middleware/auth-middleware";

const reservationRouter = Router();

reservationRouter.get(
  "/",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.LECTOR),
  reservationController.listReservations,
);

reservationRouter.post(
  "/",
  authenticate,
  authorizeRoles(Role.ADMIN),
  reservationController.createReservation,
);

reservationRouter.patch(
  "/:id/cancel",
  authenticate,
  authorizeRoles(Role.ADMIN),
  reservationController.cancelReservation,
);

reservationRouter.patch(
  "/:id/complete",
  authenticate,
  authorizeRoles(Role.ADMIN),
  reservationController.completeReservation,
);

export { reservationRouter };
