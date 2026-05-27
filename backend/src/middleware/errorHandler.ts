import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error("[Unhandled Error]", err);
  res.status(500).json({
    error: "server_error",
    message: err.message || "An unexpected error occurred",
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "not_found", message: "Route not found" });
}
