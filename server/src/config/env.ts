import dotenv from "dotenv";
import Joi from "joi";

dotenv.config({ quiet: true });

interface Env {
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
  HOST?: string;
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
