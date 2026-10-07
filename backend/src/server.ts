import app from "./app";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";

async function start(): Promise<void> {
  await connectDatabase();
  app.listen(env.PORT, () => {
    console.info(`API listening on port ${env.PORT}`);
  });
}

start().catch((error: unknown) => {
  console.error("Failed to start API", error);
  process.exitCode = 1;
});
