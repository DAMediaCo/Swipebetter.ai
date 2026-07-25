import assert from "node:assert/strict";
import test from "node:test";
import {
  buildProfileAnalysisPrompt,
  buildProfileSynthesisPrompt,
  buildPhotoFeedbackPrompt,
  buildReplyAnalysisPrompt,
} from "./aiPrompts.ts";

test("reply prompt requires natural, context-grounded messages", () => {
  const prompt = buildReplyAnalysisPrompt("witty", "", "");

  assert.match(prompt, /Match the user's apparent vocabulary/);
  assert.match(prompt, /Never invent a venue/);
  assert.match(prompt, /one low-pressure, one more playful, and one more direct/);
  assert.match(prompt, /Do not add emojis unless the user already uses them/);
  assert.match(prompt, /array of exactly 3 send-ready strings/);
});

test("profile prompts prohibit invented details and ad-like bios", () => {
  const analysisPrompt = buildProfileAnalysisPrompt("Hinge", "Man", "Relationship", "");
  const synthesisPrompt = buildProfileSynthesisPrompt();
  const photoPrompt = buildPhotoFeedbackPrompt();

  assert.match(analysisPrompt, /clearly marked detail for the user to fill in/);
  assert.match(analysisPrompt, /one warm, one playful, and one direct/);
  assert.match(synthesisPrompt, /not an advertisement/);
  assert.match(synthesisPrompt, /not present in the supplied notes/);
  assert.match(photoPrompt, /without sounding harsh, clinical, or formulaic/);
});

test("ENM partner-photo context survives every profile analysis stage", () => {
  const enmContext = `
Photos may intentionally show the user with their partner, including a partner of the opposite sex.
Do not recommend removing the photo solely because it shows their partner.`;

  const analysisPrompt = buildProfileAnalysisPrompt("Hinge", "Woman", "Dating", enmContext);
  const photoPrompt = buildPhotoFeedbackPrompt(enmContext);
  const synthesisPrompt = buildProfileSynthesisPrompt(enmContext);

  for (const prompt of [analysisPrompt, photoPrompt, synthesisPrompt]) {
    assert.match(prompt, /partner of the opposite sex/);
    assert.match(prompt, /Do not recommend removing/);
  }
});
