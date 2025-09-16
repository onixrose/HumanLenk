import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { logger } from "../utils/logger";

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class AppError extends Error implements ApiError {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: ApiError | Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let details: any = undefined;

  // Log the error
  logger.error("Error occurred:", {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Handle different types of errors
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle Prisma errors
    switch (error.code) {
      case "P2002":
        statusCode = 409;
        message = "Resource already exists";
        details = { field: error.meta?.target };
        break;
      case "P2025":
        statusCode = 404;
        message = "Resource not found";
        break;
      case "P2003":
        statusCode = 400;
        message = "Invalid foreign key constraint";
        break;
      default:
        statusCode = 400;
        message = "Database operation failed";
    }
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 500;
    message = "Database connection error";
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data provided";
  } else if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
  } else if (error.name === "UnauthorizedError" || error.message.includes("jwt")) {
    statusCode = 401;
    message = "Authentication failed";
  } else if (error.name === "MulterError") {
    statusCode = 400;
    message = "File upload error";
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === "production" && statusCode === 500) {
    message = "Internal Server Error";
    details = undefined;
  }

  const response: any = {
    success: false,
    error: message,
  };

  if (details) {
    response.details = details;
  }

  if (process.env.NODE_ENV === "development") {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
