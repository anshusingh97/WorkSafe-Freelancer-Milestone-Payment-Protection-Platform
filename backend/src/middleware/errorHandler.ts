import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Sentry } from "../config/sentry";

export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error("[unhandled error]", err);
  Sentry.captureException(err);

  const message =
    process.env.NODE_ENV === "production"
      ? "Something went wrong. Please try again."
      : err instanceof Error
        ? err.message
        : "Unknown error";

  res.status(500).json({ error: message });
}
