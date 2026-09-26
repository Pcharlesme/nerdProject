import { inject } from "vitest";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = inject("databaseUrl");
process.env.DIRECT_URL = process.env.DATABASE_URL;
process.env.JWT_SECRET = "test-secret-that-is-definitely-long-enough-123";
process.env.API_RATE_LIMIT_MAX ??= "10000";
process.env.LOGIN_RATE_LIMIT_MAX ??= "10000";
process.env.ENQUIRY_RATE_LIMIT_MAX ??= "10000";
