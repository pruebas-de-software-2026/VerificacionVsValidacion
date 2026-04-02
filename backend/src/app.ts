import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { getRequestId, httpLogger } from "./http-logger";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { authRouter } from "./routes/auth-routes";
import { clientRouter } from "./routes/client-routes";
import { technicianRouter } from "./routes/technician-routes";

export function createApp(): express.Express {
  const app = express();
  const environment = process.env.NODE_ENV ?? "development";
  const startedAt = Date.now();
  const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.disable("x-powered-by");
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("CORS origin not allowed"));
      },
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json());
  app.use(httpLogger);

  app.use("/auth", authRouter);
  app.use("/clients", clientRouter);
  app.use("/technicians", technicianRouter);

  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      service: "backend",
      env: environment,
      uptimeSec: Math.floor(process.uptime()),
      startedAt: new Date(startedAt).toISOString(),
      timestamp: new Date().toISOString(),
      requestId: getRequestId(req, res),
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
