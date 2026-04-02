import { Router } from "express";
import { Role } from "../../generated/prisma/client";
import * as reservationController from "../controllers/reservation-controller";
import { authenticate, authorizeRoles } from "../middleware/auth-middleware";

const reservationRouter = Router();

reservationRouter.post(
  "/",
  authenticate,
  authorizeRoles(Role.ADMIN),
  reservationController.createReservation,
);

export { reservationRouter };
