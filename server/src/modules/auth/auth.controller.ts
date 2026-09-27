import type { Request, Response } from "express";
import { AppError } from "../../lib/AppError";
import { validatedBody } from "../../lib/validated";
import { authenticateStaff, getStaffById } from "./auth.service";
import { signAccessToken } from "./auth.token";
import type { LoginBody } from "./auth.schemas";

export async function login(req: Request, res: Response) {
  const { email, password } = validatedBody<LoginBody>(req);
  const staff = await authenticateStaff(email, password);

  res.json({ data: { accessToken: signAccessToken(staff), staff } });
}

// Stateless JWT — there is no server-side session to invalidate. This endpoint exists so
// the frontend has one clear place to call before forgetting its own copy of the token
// (and so a future move to a revocable/blacklisted token model has somewhere to live).
export function logout(_req: Request, res: Response) {
  res.status(204).end();
}

export async function me(req: Request, res: Response) {
  if (!req.staff) throw AppError.unauthenticated();
  res.json({ data: await getStaffById(req.staff.id) });
}
