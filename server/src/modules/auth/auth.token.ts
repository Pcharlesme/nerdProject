import jwt from "jsonwebtoken";
import type { CookieOptions } from "express";
import { env, isProduction } from "../../config/env";
import { AppError } from "../../lib/AppError";

export const SESSION_COOKIE = "ns_session";

export interface SessionStaff {
  id: string;
  email: string;
  name: string;
}

interface SessionPayload {
  sub: string;
  email: string;
  name: string;
}

// No maxAge: the cookie outlives the JWT so an expired token reaches the server and can be reported as SESSION_EXPIRED.
export const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
};

export function signSessionToken(staff: SessionStaff): string {
  const payload: SessionPayload = { sub: staff.id, email: staff.email, name: staff.name };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN_MINUTES * 60,
    algorithm: "HS256",
  });
}

export function verifySessionToken(token: string): SessionStaff {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] }) as SessionPayload;
    return { id: payload.sub, email: payload.email, name: payload.name };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, "SESSION_EXPIRED", "Your session has expired. Please sign in again.");
    }
    throw AppError.unauthenticated("Your session is invalid. Please sign in again.");
  }
}
