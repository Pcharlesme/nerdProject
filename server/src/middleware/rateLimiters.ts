import rateLimit from "express-rate-limit";
import { env } from "../config/env";

const MINUTE = 60 * 1000;

function createLimiter(windowMs: number, limit: number, message: string, skipSuccessfulRequests = false) {
  return rateLimit({
    windowMs,
    limit,
    skipSuccessfulRequests,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, res, _next, options) => {
      res.status(options.statusCode).json({ error: { code: "RATE_LIMITED", message } });
    },
  });
}

export const apiLimiter = createLimiter(
  15 * MINUTE,
  env.API_RATE_LIMIT_MAX,
  "Too many requests. Please slow down and try again shortly.",
);

export const loginLimiter = createLimiter(
  15 * MINUTE,
  env.LOGIN_RATE_LIMIT_MAX,
  "Too many failed sign-in attempts. Please wait 15 minutes and try again.",
  true,
);

export const enquiryLimiter = createLimiter(
  60 * MINUTE,
  env.ENQUIRY_RATE_LIMIT_MAX,
  "You've sent several enquiries recently. Please wait a while before sending another.",
);
