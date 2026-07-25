import assert from "node:assert/strict";
import test from "node:test";
import { excludeScreenshotsFromHistory } from "./privacy";

test("screenshots are excluded from saved analysis history", () => {
  const original = {
    userId: "user-1",
    tone: "thoughtful",
    screenshots: ["data:image/jpeg;base64,private-image"],
  };

  const saved = excludeScreenshotsFromHistory(original);

  assert.deepEqual(saved.screenshots, []);
  assert.equal(saved.userId, original.userId);
  assert.deepEqual(original.screenshots, ["data:image/jpeg;base64,private-image"]);
});
