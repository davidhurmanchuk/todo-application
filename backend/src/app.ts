import express from "express";
import cors from "cors";
import todosRouter from "./routes/todos";
import categoriesRouter from "./routes/categories";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((o) => o.trim());

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
      },
    }),
  );

  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/todos", todosRouter);
  app.use("/categories", categoriesRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
