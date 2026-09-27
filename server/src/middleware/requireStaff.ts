import type { RequestHandler } from "express";
import { AppError } from "../lib/AppError";
import { verifyAccessToken } from "../modules/auth/auth.token";

function readBearerToken(authorization: string | undefined): string | null {
  if (authorization?.startsWith("Bearer ")) return authorization.slice(7);
  return null;
}

export const requireStaff: RequestHandler = (req, _res, next) => {
  const token = readBearerToken(req.headers.authorization);
  if (!token) throw AppError.unauthenticated();

  req.staff = verifyAccessToken(token);
  next();
};
