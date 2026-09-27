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
  const res = await request(app).post("/api/auth/login").send(STAFF_CREDENTIALS).expect(200);
  const token = res.body.data.accessToken;
  const auth = (req: request.Test) => req.set("Authorization", `Bearer ${token}`);

  return {
    token,
    get: (url: string) => auth(request(app).get(url)),
    post: (url: string) => auth(request(app).post(url)),
    patch: (url: string) => auth(request(app).patch(url)),
    put: (url: string) => auth(request(app).put(url)),
    delete: (url: string) => auth(request(app).delete(url)),
  };
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
