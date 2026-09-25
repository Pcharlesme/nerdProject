import Joi from "joi";

export interface LoginBody {
  email: string;
  password: string;
}

export const loginSchema = Joi.object<LoginBody>({
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .max(254)
    .required(),
  password: Joi.string().min(1).max(128).required(),
});
