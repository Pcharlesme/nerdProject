import { execSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type EmbeddedPostgres from "embedded-postgres" with { "resolution-mode": "import" };
import type { TestProject } from "vitest/node" with { "resolution-mode": "import" };

declare module "vitest" {
  export interface ProvidedContext {
    databaseUrl: string;
  }
}

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, () => {
      const { port } = server.address() as { port: number };
      server.close(() => resolve(port));
    });
  });
}

async function startEmbeddedPostgres() {
  // embedded-postgres ships ESM-only; this file compiles as CommonJS, so a dynamic
  // import is required regardless of the module target.
  const { default: EmbeddedPostgres } = await import("embedded-postgres");
  const databaseDir = mkdtempSync(join(tmpdir(), "nerdshipping-pg-"));
  const port = await freePort();
  const pg = new EmbeddedPostgres({
    databaseDir,
    port,
    user: "postgres",
    password: "postgres",
    persistent: false,
    onLog: () => {},
  });

  await pg.initialise();
  await pg.start();
  await pg.createDatabase("nerdshipping_test");

  return {
    url: `postgresql://postgres:postgres@localhost:${port}/nerdshipping_test`,
    stop: async () => {
      await pg.stop();
      rmSync(databaseDir, { recursive: true, force: true });
    },
  };
}

export default async function setup(project: TestProject) {
  const external = process.env.TEST_DATABASE_URL;
  const embedded = external ? null : await startEmbeddedPostgres();
  const databaseUrl = external ?? embedded!.url;

  try {
    execSync("npx prisma migrate deploy", {
      env: { ...process.env, DATABASE_URL: databaseUrl, DIRECT_URL: databaseUrl },
      stdio: "pipe",
    });
  } catch (error) {
    await embedded?.stop();
    const stderr = (error as { stderr?: Buffer }).stderr?.toString() ?? "";
    throw new Error(`Migrating the test database failed:\n${stderr}`);
  }

  project.provide("databaseUrl", databaseUrl);

  return async () => {
    await embedded?.stop();
  };
}
