import type { Request } from "express";

// Thin typed accessors over a request the `validate()` middleware has already sanitised —
// centralised here so a controller never casts `req.body`/`req.query`/`req.params` inline.
export function validatedBody<T>(req: Request): T {
  return req.body as T;
}

export function validatedParams<T>(req: Request): T {
  return req.params as T;
}

export function validatedQuery<T>(req: Request): T {
  return req.query as T;
}
