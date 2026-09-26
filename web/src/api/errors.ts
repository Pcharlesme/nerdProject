import { AxiosError } from "axios";
import type { ApiErrorBody, ApiErrorDetail } from "./types";

/** A normalised, typed error every hook/component can rely on, regardless of
 * whether the failure was a clean backend error response or a network/timeout. */
export class ApiError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly details?: ApiErrorDetail[];

  constructor(message: string, code: string, status?: number, details?: ApiErrorDetail[]) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }

  get isNotFound() {
    return this.status === 404;
  }
}

function hasErrorBody(data: unknown): data is ApiErrorBody {
  return typeof data === "object" && data !== null && "error" in data;
}

/** Every API function's catch block normalises through this, so callers (and
 * hooks' `error` state) only ever see an `ApiError`, never a raw AxiosError. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    if (!error.response) {
      return new ApiError("Couldn't reach the server. Check your connection and try again.", "NETWORK_ERROR");
    }
    const { status, data } = error.response;
    if (hasErrorBody(data)) {
      return new ApiError(data.error.message, data.error.code, status, data.error.details);
    }
    return new ApiError("Something went wrong on our side. Please try again.", "INTERNAL_ERROR", status);
  }

  if (error instanceof Error) {
    return new ApiError(error.message, "UNKNOWN_ERROR");
  }

  return new ApiError("Something went wrong. Please try again.", "UNKNOWN_ERROR");
}
