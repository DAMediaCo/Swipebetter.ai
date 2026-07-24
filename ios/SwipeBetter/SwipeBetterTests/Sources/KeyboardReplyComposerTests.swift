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
}
