export interface AppErrorDetail {
  field: string;
  message: string;
}

/** A typed application error carrying the HTTP status and stable `code` the client branches on. */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: AppErrorDetail[];

  constructor(statusCode: number, code: string, message: string, details?: AppErrorDetail[]) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static notFound(message = "The requested resource was not found."): AppError {
    return new AppError(404, "NOT_FOUND", message);
  }

  static conflict(message: string, details?: AppErrorDetail[]): AppError {
    return new AppError(409, "CONFLICT", message, details);
  }

  static validation(message: string, details?: AppErrorDetail[]): AppError {
    return new AppError(422, "VALIDATION_ERROR", message, details);
  }

  static unauthenticated(message = "Authentication is required."): AppError {
    return new AppError(401, "UNAUTHENTICATED", message);
  }
}
