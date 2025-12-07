import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";

/**
 * Global error handling middleware
 * Catches all errors and returns consistent JSON responses
 */
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  console.error("Error:", err.message);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  // Handle unexpected errors
  res.status(500).json({
    status: "error",
    message: "An unexpected error occurred",
  });
};

/**
 * 404 Not Found handler
 * Catches all unmatched routes
 */
export const notFoundMiddleware = (
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.method} ${req.path} not found`,
  });
};
