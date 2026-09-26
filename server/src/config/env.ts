import dotenv from "dotenv";
import Joi from "joi";

dotenv.config({ quiet: true });

interface Env {
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
  HOST?: string;
  INTERNAL_API_PORT?: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN_MINUTES: number;
  CORS_ORIGIN: string[];
  TRUST_PROXY: number | string;
  API_RATE_LIMIT_MAX: number;
  LOGIN_RATE_LIMIT_MAX: number;
  ENQUIRY_RATE_LIMIT_MAX: number;
}

const schema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
  PORT: Joi.number().port().default(4000),
  HOST: Joi.string().hostname(),
  // Deliberately a different name than `PORT` and never set by Render itself — used only
  // by the combined single-service deploy (see root package.json's `start:server`) so this
  // process's real bind port can never be confused with whatever `$PORT` the platform
  // injects for the public-facing Next.js process running alongside it.
  INTERNAL_API_PORT: Joi.number().port(),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ["postgres", "postgresql"] })
    .required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN_MINUTES: Joi.number().integer().min(1).default(480),
  CORS_ORIGIN: Joi.string()
    .default("http://localhost:3000")
    .custom((value: string) =>
      value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  // A hop count, or Express's named subnets (e.g. "loopback, uniquelocal") when the proxy chain length varies.
  TRUST_PROXY: Joi.alternatives()
    .try(
      Joi.number().integer().min(0),
      Joi.string().pattern(/^(loopback|linklocal|uniquelocal)(\s*,\s*(loopback|linklocal|uniquelocal))*$/),
    )
    .default(0),
  API_RATE_LIMIT_MAX: Joi.number().integer().min(1).default(300),
  LOGIN_RATE_LIMIT_MAX: Joi.number().integer().min(1).default(10),
  ENQUIRY_RATE_LIMIT_MAX: Joi.number().integer().min(1).default(10),
}).unknown(true);

const { value, error } = schema.validate(process.env, { abortEarly: false, convert: true });

if (error) {
  const problems = error.details.map((detail) => `  - ${detail.message}`).join("\n");
  throw new Error(`Invalid environment configuration:\n${problems}`);
}

export const env = value as Env;
export const isProduction = env.NODE_ENV === "production";

// `INTERNAL_API_PORT`, when set, always wins over `PORT` — see the schema comment above.
if (env.INTERNAL_API_PORT) {
  env.PORT = env.INTERNAL_API_PORT;
}

// A missing `HOST` defaults to "all interfaces" in production, because this server
// most commonly runs as its own standalone deploy (e.g. a dedicated Render service,
// with a separately-deployed frontend calling it directly) — that shape needs to be
// reachable on whatever port the platform assigns, not loopback-only.
// The one exception is the combined single-service deploy (`root package.json`'s
// `start:server`, alongside `next start` in the same container) — there, the script
// explicitly sets `HOST=127.0.0.1` itself, which this default never overrides.
if (!env.HOST && isProduction) {
  env.HOST = "0.0.0.0";
}
