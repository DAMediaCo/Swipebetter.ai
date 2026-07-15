import XCTest

final class KeyboardReplyComposerTests: XCTestCase {
  func testFoodContextCreatesSpecificQuestion() {
    let reply = KeyboardReplyComposer.reply(
      for: "They said they love last-minute tacos.",
      style: .warm
    )

    XCTAssertEqual(reply, "Okay, strong answer. What's your go-to spot?")
  }

  func testBusyContextCreatesLowPressureDate() {
    let reply = KeyboardReplyComposer.reply(
      for: "Work has been a crazy week.",
      style: .askOut
    )

    XCTAssertTrue(reply.contains("week calms down"))
  }

  func testComplimentContextStaysConfident() {
    let reply = KeyboardReplyComposer.reply(for: "You're cute", style: .confident)

    XCTAssertEqual(reply, "I was thinking the same about you.")
  }

  func testEmptyContextStillWorksLocally() {
    let reply = KeyboardReplyComposer.reply(for: nil, style: .warm)

    XCTAssertFalse(reply.isEmpty)
  }
}
