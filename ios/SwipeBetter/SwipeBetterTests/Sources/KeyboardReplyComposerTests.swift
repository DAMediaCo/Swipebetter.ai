import XCTest

final class KeyboardReplyComposerTests: XCTestCase {
  func testFoodContextCreatesSpecificQuestion() {
    let reply = KeyboardReplyComposer.reply(
      for: "They said they love last-minute tacos.",
      style: .warm
    )

    XCTAssertEqual(reply, "Now I'm hungry. What's your go-to order?")
  }

  func testBusyContextCreatesLowPressureDate() {
    let reply = KeyboardReplyComposer.reply(
      for: "Work has been a crazy week.",
      style: .askOut
    )

    XCTAssertEqual(reply, "When things calm down, want to grab a drink?")
  }

  func testComplimentContextStaysConfident() {
    let reply = KeyboardReplyComposer.reply(for: "You're cute", style: .confident)

    XCTAssertEqual(reply, "Thanks, I was thinking the same about you.")
  }

  func testEmptyContextStillWorksLocally() {
    let reply = KeyboardReplyComposer.reply(for: nil, style: .warm)

    XCTAssertFalse(reply.isEmpty)
  }

  func testProfileResultTextSplitsJsonOptionsForIndividualCopying() {
    let items = PremiumResultText.items(from: "[\"First bio\", \"Second bio\", \"Third bio\"]")

    XCTAssertEqual(items, ["First bio", "Second bio", "Third bio"])
  }

  func testProfileResultTextKeepsPlainFeedbackReadable() {
    let items = PremiumResultText.items(from: "Move the outdoor photo to the first slot.")

    XCTAssertEqual(items, ["Move the outdoor photo to the first slot."])
  }

  func testSnapReturnsFreshGeneratedReply() {
    let now = Date()
    let payload = SwipeBetterSnapPayload(
      updatedAt: now,
      state: .ready,
      replies: ["  That sounds fun. What's the story?  "]
    )

    XCTAssertEqual(payload.usableReply(at: 0, now: now), "That sounds fun. What's the story?")
  }

  func testSnapRejectsExpiredReply() {
    let now = Date()
    let payload = SwipeBetterSnapPayload(
      updatedAt: now.addingTimeInterval(-31 * 60),
      state: .ready,
      replies: ["Old reply"]
    )

    XCTAssertNil(payload.usableReply(at: 0, now: now))
  }

  func testSnapRejectsReplyUntilReady() {
    let payload = SwipeBetterSnapPayload(
      state: .processing,
      replies: ["Not ready"]
    )

    XCTAssertNil(payload.usableReply(at: 0))
  }
}
