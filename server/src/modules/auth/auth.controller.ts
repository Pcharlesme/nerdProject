import type { Request, Response } from "express";
import { AppError } from "../../lib/AppError";
import { validatedBody } from "../../lib/validated";
import { authenticateStaff, getStaffById } from "./auth.service";
import { SESSION_COOKIE, sessionCookieOptions, signSessionToken } from "./auth.token";
import type { LoginBody } from "./auth.schemas";

export async function login(req: Request, res: Response) {
  const { email, password } = validatedBody<LoginBody>(req);
  const staff = await authenticateStaff(email, password);

  res.cookie(SESSION_COOKIE, signSessionToken(staff), sessionCookieOptions);
  res.json({ data: staff });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(SESSION_COOKIE, sessionCookieOptions);
  res.status(204).end();
}

export async function me(req: Request, res: Response) {
  if (!req.staff) throw AppError.unauthenticated();
  res.json({ data: await getStaffById(req.staff.id) });
}
