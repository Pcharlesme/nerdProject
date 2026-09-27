import { Router } from "express";
import bcrypt from "bcryptjs";
import Joi from "joi";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/AppError";
import { validate } from "../../middleware/validate";
import { validatedBody } from "../../lib/validated";
import { PASSWORD_HASH_ROUNDS } from "./auth.service";

interface RegisterStaffBody {
  email: string;
  password: string;
  name: string;
}

const registerStaffSchema = Joi.object<RegisterStaffBody>({
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).max(254).required(),
  password: Joi.string().min(8).max(128).required(),
  name: Joi.string().trim().min(1).max(120).required(),
});


// Mounted under the staff sub-router in app.ts, so it already requires an existing staff token.
export const registerStaffRouter = Router();

registerStaffRouter.post("/", validate({ body: registerStaffSchema }), async (req, res) => {
  const { email, password, name } = validatedBody<RegisterStaffBody>(req);

  try {
    const staff = await prisma.staffUser.create({
      data: { email, name, passwordHash: await bcrypt.hash(password, PASSWORD_HASH_ROUNDS) },
      select: { id: true, email: true, name: true },
    });
    res.status(201).json({ data: staff });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw AppError.conflict(`An account with email ${email} already exists.`);
    }
    throw error;
  }
});
