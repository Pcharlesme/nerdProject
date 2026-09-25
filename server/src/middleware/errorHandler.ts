import type { ErrorRequestHandler, RequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../lib/AppError";

// Can't reach / timed out / pool exhausted / connection closed / transaction expired.
const DATABASE_UNAVAILABLE_CODES = new Set(["P1001", "P1002", "P1008", "P1017", "P2024", "P2028"]);

const databaseUnavailable = () =>
  new AppError(503, "SERVICE_UNAVAILABLE", "We're having trouble reaching our database. Please try again in a moment.");

function fromPrismaError(error: Prisma.PrismaClientKnownRequestError): AppError | null {
  if (DATABASE_UNAVAILABLE_CODES.has(error.code)) return databaseUnavailable();

  switch (error.code) {
    case "P2002":
      return AppError.conflict("A record with this value already exists.");
    case "P2025":
      return AppError.notFound("The requested record was not found.");
    default:
      return null;
  }
}

function isBodyParserError(error: unknown): error is { status: number; type: string } {
  return typeof error === "object" && error !== null && "type" in error && "status" in error;
}

export const notFoundHandler: RequestHandler = (req) => {
  throw AppError.notFound(`Route ${req.method} ${req.path} does not exist.`);
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  let appError: AppError | null = null;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    appError = fromPrismaError(error);
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    appError = databaseUnavailable();
  } else if (isBodyParserError(error) && error.status < 500) {
    appError =
      error.type === "entity.too.large"
        ? new AppError(413, "VALIDATION_ERROR", "Request body is too large.")
        : AppError.validation("Request body must be valid JSON.");
  }

  if (appError?.statusCode === 503) {
    console.error(`Database unavailable: ${(error as Error).message.trim().split("\n").at(-1)}`);
  }

  if (!appError) {
    console.error("Unhandled error:", error);
    appError = new AppError(500, "INTERNAL_ERROR", "Something went wrong on our side. Please try again.");
  }

  res.status(appError.statusCode).json({
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.details && { details: appError.details }),
    },
  });
};
