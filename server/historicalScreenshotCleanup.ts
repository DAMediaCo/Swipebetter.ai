type QueryResult<Row = Record<string, unknown>> = {
  rows: Row[];
  rowCount?: number | null;
};

export type ScreenshotCleanupClient = {
  query<Row = Record<string, unknown>>(sql: string): Promise<QueryResult<Row>>;
};

export type ScreenshotAudit = {
  profileRows: number;
  profileScreenshots: number;
  replyRows: number;
  replyScreenshots: number;
};

type CountRow = {
  rowCount: number | string;
  screenshotCount: number | string;
};

const PROFILE_AUDIT_SQL = `
  SELECT
    count(*)::integer AS "rowCount",
    coalesce(sum(cardinality(screenshots)), 0)::integer AS "screenshotCount"
  FROM profile_analyses
  WHERE cardinality(screenshots) > 0
`;

const REPLY_AUDIT_SQL = `
  SELECT
    count(*)::integer AS "rowCount",
    coalesce(sum(cardinality(screenshots)), 0)::integer AS "screenshotCount"
  FROM reply_analyses
  WHERE cardinality(screenshots) > 0
`;

const CLEAR_PROFILE_SCREENSHOTS_SQL = `
  UPDATE profile_analyses
  SET screenshots = ARRAY[]::text[]
  WHERE cardinality(screenshots) > 0
`;

const CLEAR_REPLY_SCREENSHOTS_SQL = `
  UPDATE reply_analyses
  SET screenshots = ARRAY[]::text[]
  WHERE cardinality(screenshots) > 0
`;

function counts(row: CountRow | undefined) {
  return {
    rows: Number(row?.rowCount ?? 0),
    screenshots: Number(row?.screenshotCount ?? 0),
  };
}

export async function auditHistoricalScreenshots(
  client: ScreenshotCleanupClient,
): Promise<ScreenshotAudit> {
  const profile = await client.query<CountRow>(PROFILE_AUDIT_SQL);
  const reply = await client.query<CountRow>(REPLY_AUDIT_SQL);
  const profileCounts = counts(profile.rows[0]);
  const replyCounts = counts(reply.rows[0]);

  return {
    profileRows: profileCounts.rows,
    profileScreenshots: profileCounts.screenshots,
    replyRows: replyCounts.rows,
    replyScreenshots: replyCounts.screenshots,
  };
}

export async function purgeHistoricalScreenshots(
  client: ScreenshotCleanupClient,
): Promise<{ before: ScreenshotAudit; after: ScreenshotAudit }> {
  await client.query("BEGIN");

  try {
    const before = await auditHistoricalScreenshots(client);
    await client.query(CLEAR_PROFILE_SCREENSHOTS_SQL);
    await client.query(CLEAR_REPLY_SCREENSHOTS_SQL);
    const after = await auditHistoricalScreenshots(client);

    if (after.profileRows !== 0 || after.replyRows !== 0) {
      throw new Error("Screenshot cleanup verification failed");
    }

    await client.query("COMMIT");
    return { before, after };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}
