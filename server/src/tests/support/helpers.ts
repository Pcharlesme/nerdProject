import request from "supertest";
import { createApp } from "../../app";
import { prisma } from "../../lib/prisma";
import { seedDatabase } from "../../seed/seed";

export const STAFF_CREDENTIALS = { email: "staff@example.test", password: "correct-horse-battery" };

export const app = createApp();

export async function seed() {
  await seedDatabase(prisma, { staffEmail: STAFF_CREDENTIALS.email, staffPassword: STAFF_CREDENTIALS.password });
}

export async function signedInAgent() {
  const agent = request.agent(app);
  await agent.post("/api/auth/login").send(STAFF_CREDENTIALS).expect(200);
  return agent;
}

export function validShipmentPayload(overrides: Record<string, unknown> = {}) {
  return {
    originCity: "Testford",
    originRegion: "Mockshire",
    destinationCity: "Samplebury",
    destinationRegion: "Fixtureland",
    currentLocation: "Testford Depot",
    estimatedDeliveryAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    serviceLevel: "Express",
    packageCount: 2,
    weightKg: 5.5,
    referenceCode: "PO-TEST-1",
    sender: { name: "Test Sender", email: "sender@example.test" },
    receiver: { name: "Test Receiver" },
    ...overrides,
  };
}

export { prisma, request };
