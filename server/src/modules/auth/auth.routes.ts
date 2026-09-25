import { Router } from "express";
import { validate } from "../../middleware/validate";
import { requireStaff } from "../../middleware/requireStaff";
import { loginLimiter } from "../../middleware/rateLimiters";
import { loginSchema } from "./auth.schemas";
import * as controller from "./auth.controller";

export const authRouter = Router();

authRouter.post("/login", loginLimiter, validate({ body: loginSchema }), controller.login);
authRouter.post("/logout", controller.logout);
authRouter.get("/me", requireStaff, controller.me);
