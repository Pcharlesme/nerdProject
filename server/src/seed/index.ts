import dotenv from "dotenv";
import { prisma } from "../lib/prisma";
import { seedDatabase } from "./seed";

dotenv.config({ quiet: true });

async function main() {
  const staffEmail = process.env.SEED_STAFF_EMAIL ?? "staff@shiptrack.com";
  const staffPassword = process.env.SEED_STAFF_PASSWORD ?? "demo1234";

  const { shipmentCount } = await seedDatabase(prisma, { staffEmail, staffPassword });
  console.log(`Seeded ${shipmentCount} shipments and demo staff account ${staffEmail}`);
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
