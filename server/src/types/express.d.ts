import type { SessionStaff } from "../modules/auth/auth.token";

declare global {
  namespace Express {
    interface Request {
      staff?: SessionStaff;
    }
  }
}

export {};
