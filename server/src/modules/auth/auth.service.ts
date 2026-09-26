import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import type { SessionStaff } from "./auth.token";



// Compared against when the email is unknown so both failure paths cost the same bcrypt round.

export const PASSWORD_HASH_ROUNDS = 12;

const TIMING_SAFE_HASH = bcrypt.hashSync("timing-safe-placeholder", PASSWORD_HASH_ROUNDS);
// 
export async function authenticateStaff(email: string, password: string): Promise<SessionStaff> {
  const user = await prisma.staffUser.findUnique({ where: { email } });
  const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? TIMING_SAFE_HASH);

  if (!user || !passwordMatches) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Incorrect email or password.");
  }

  return { id: user.id, email: user.email, name: user.name };
}

export async function getStaffById(id: string): Promise<SessionStaff> {
  const user = await prisma.staffUser.findUnique({
    where: { id },
    select: { id: true, email: true, name: true },
  });
  if (!user) throw AppError.unauthenticated("Your account is no longer active.");
  return user;
}
