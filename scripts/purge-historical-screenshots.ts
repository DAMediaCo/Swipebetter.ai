import pg from "pg";
import {
  auditHistoricalScreenshots,
  purgeHistoricalScreenshots,
} from "../server/historicalScreenshotCleanup";

const EXECUTE_FLAG = "--execute";
const CONFIRMATION = "PURGE SCREENSHOTS ONLY";
async function main() {
  const execute = process.argv.includes(EXECUTE_FLAG);

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  if (execute && process.env.PURGE_HISTORICAL_SCREENSHOTS_CONFIRM !== CONFIRMATION) {
    throw new Error(
      `Execution requires PURGE_HISTORICAL_SCREENSHOTS_CONFIRM="${CONFIRMATION}"`,
    );
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    if (execute) {
      const result = await purgeHistoricalScreenshots(client);
      console.log(JSON.stringify({ mode: "execute", ...result }, null, 2));
    } else {
      const audit = await auditHistoricalScreenshots(client);
      console.log(JSON.stringify({ mode: "dry-run", audit }, null, 2));
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
