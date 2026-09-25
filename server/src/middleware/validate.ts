import type { RequestHandler } from "express";
import type { ObjectSchema } from "joi";
import { AppError } from "../lib/AppError";

type RequestPart = "body" | "query" | "params";

type ValidationSchemas = Partial<Record<RequestPart, ObjectSchema>>;

const PARTS: RequestPart[] = ["params", "query", "body"];

export function validate(schemas: ValidationSchemas): RequestHandler {
  return (req, _res, next) => {
    for (const part of PARTS) {
      const schema = schemas[part];
      if (!schema) continue;

      const { value, error } = schema.validate(req[part] ?? {}, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        const details = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message.replace(/"/g, ""),
        }));
        throw AppError.validation("Some fields are missing or invalid.", details);
      }

      // Express 5 exposes req.query as a getter, so the sanitised value has to be redefined rather than assigned.
      Object.defineProperty(req, part, { value, writable: true, enumerable: true, configurable: true });
    }

    next();
  };
}
