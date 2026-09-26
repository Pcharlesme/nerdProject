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
//
// `sameSite`: "lax" in dev, where the browser and API share an origin via Next's
// rewrite. In production this app is commonly deployed as two separate origins
// (a Vercel frontend calling a Render API directly) — a "lax" cookie is stored
// after login but never attached to the cross-site XHR/fetch calls every staff
// screen makes afterwards, which looks exactly like "login works, then every
// request is 401". "none" is required for a credentialed cross-site request to
// carry the cookie at all, and browsers only accept "none" paired with `secure`
// (already true in production below), so this is safe to always use in production
// even for same-origin deploys.
export const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
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
