import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../lib/AppError";

export interface SessionStaff {
  id: string;
  email: string;
  name: string;
}

interface AccessTokenPayload {
  sub: string;
  email: string;
  name: string;
}

export function signAccessToken(staff: SessionStaff): string {
  const payload: AccessTokenPayload = { sub: staff.id, email: staff.email, name: staff.name };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN_MINUTES * 60,
    algorithm: "HS256",
  });
}

export function verifyAccessToken(token: string): SessionStaff {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] }) as AccessTokenPayload;
    return { id: payload.sub, email: payload.email, name: payload.name };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, "SESSION_EXPIRED", "Your session has expired. Please sign in again.");
    }
    throw AppError.unauthenticated("Your session is invalid. Please sign in again.");
  }
}
