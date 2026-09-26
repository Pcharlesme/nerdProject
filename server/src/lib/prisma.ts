import { PrismaClient } from "@prisma/client";

// One client per process — Prisma pools connections internally, so a singleton
// (not one per request) is the correct, documented pattern.
export const prisma = new PrismaClient();
