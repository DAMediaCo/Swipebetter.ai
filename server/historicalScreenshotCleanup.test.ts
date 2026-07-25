import assert from "node:assert/strict";
import test from "node:test";
import {
  auditHistoricalScreenshots,
  purgeHistoricalScreenshots,
  type ScreenshotCleanupClient,
} from "./historicalScreenshotCleanup";

function countResult(rows: number, screenshots: number) {
  return {
    rows: [{ rowCount: rows, screenshotCount: screenshots }],
  };
}

test("historical screenshot audit is read-only", async () => {
  const queries: string[] = [];
  const results = [countResult(60, 180), countResult(17, 17)];
  const client: ScreenshotCleanupClient = {
    async query(sql) {
      queries.push(sql);
      return results.shift() ?? { rows: [] };
    },
  };

  const audit = await auditHistoricalScreenshots(client);

  assert.deepEqual(audit, {
    profileRows: 60,
    profileScreenshots: 180,
    replyRows: 17,
    replyScreenshots: 17,
  });
  assert.equal(queries.length, 2);
  assert.ok(queries.every((sql) => /^\s*SELECT/i.test(sql)));
});

test("purge changes only screenshot columns and verifies before commit", async () => {
  const queries: string[] = [];
  const countResults = [
    countResult(60, 180),
    countResult(17, 17),
    countResult(0, 0),
    countResult(0, 0),
  ];
  const client: ScreenshotCleanupClient = {
    async query(sql) {
      queries.push(sql);
      if (/^\s*SELECT/i.test(sql)) {
        return countResults.shift() ?? { rows: [] };
      }
      return { rows: [], rowCount: 0 };
    },
  };

  const result = await purgeHistoricalScreenshots(client);

  assert.equal(result.before.profileRows, 60);
  assert.equal(result.before.replyRows, 17);
  assert.deepEqual(result.after, {
    profileRows: 0,
    profileScreenshots: 0,
    replyRows: 0,
    replyScreenshots: 0,
  });
  assert.deepEqual(
    queries.filter((sql) => /^\s*(BEGIN|COMMIT|ROLLBACK)/i.test(sql)).map((sql) => sql.trim()),
    ["BEGIN", "COMMIT"],
  );

  const updates = queries.filter((sql) => /^\s*UPDATE/i.test(sql));
  assert.equal(updates.length, 2);
  assert.ok(updates.every((sql) => /SET screenshots = ARRAY\[\]::text\[\]/i.test(sql)));
  assert.ok(updates.every((sql) => !/users|subscriptions|credits|score|suggested_replies/i.test(sql)));
});

test("purge rolls back when post-update verification is not empty", async () => {
  const queries: string[] = [];
  const countResults = [
    countResult(1, 1),
    countResult(0, 0),
    countResult(1, 1),
    countResult(0, 0),
  ];
  const client: ScreenshotCleanupClient = {
    async query(sql) {
      queries.push(sql);
      if (/^\s*SELECT/i.test(sql)) {
        return countResults.shift() ?? { rows: [] };
      }
      return { rows: [], rowCount: 0 };
    },
  };

  await assert.rejects(
    purgeHistoricalScreenshots(client),
    /verification failed/,
  );
  assert.equal(queries.at(-1), "ROLLBACK");
  assert.ok(!queries.includes("COMMIT"));
});
