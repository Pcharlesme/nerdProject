import type { RequestHandler } from "express";
import { AppError } from "../lib/AppError";
import { SESSION_COOKIE, sessionCookieOptions, verifySessionToken } from "../modules/auth/auth.token";

function readToken(cookieToken: unknown, authorization: string | undefined): string | null {
  if (typeof cookieToken === "string" && cookieToken) return cookieToken;
  if (authorization?.startsWith("Bearer ")) return authorization.slice(7);
  return null;
}

export const requireStaff: RequestHandler = (req, res, next) => {
  const token = readToken(req.cookies?.[SESSION_COOKIE], req.headers.authorization);
  if (!token) throw AppError.unauthenticated();

  
  try {
    req.staff = verifySessionToken(token);
  } catch (error) {
    res.clearCookie(SESSION_COOKIE, sessionCookieOptions);
    throw error;
  }

  next();
};
