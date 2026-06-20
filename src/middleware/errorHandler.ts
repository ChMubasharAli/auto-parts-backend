import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { sendError } from "../utils/response";
import { Prisma } from "../../generated/prisma/client";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Error:", err);

  // Zod validation errors
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    err.issues.forEach((error) => {
      const path = error.path.join(".");
      if (!errors[path]) errors[path] = [];
      errors[path].push(error.message);
    });
    return sendError(res, 400, "Validation failed", errors);
  }

  // Prisma unique constraint violation
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if ((err as any).code === "P2002") {
      return sendError(res, 409, "A record with this value already exists");
    }
    if ((err as any).code === "P2025") {
      return sendError(res, 404, "Record not found");
    }
    return sendError(res, 500, "Database error");
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return sendError(res, 401, "Invalid token");
  }
  if (err.name === "TokenExpiredError") {
    return sendError(res, 401, "Token expired");
  }

  // Default error
  return sendError(
    res,
    500,
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
  );
};
