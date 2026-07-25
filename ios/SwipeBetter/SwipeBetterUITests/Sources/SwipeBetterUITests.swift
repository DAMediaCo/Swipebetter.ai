import XCTest

final class SwipeBetterUITests: XCTestCase {
  override func setUpWithError() throws {
    continueAfterFailure = false
  }

  func testSignedOutLaunchShowsAuthAndReviewSafeCopy() throws {
    let app = XCUIApplication()
    app.launchArguments.append("-SWIPEBETTER_UI_TESTING")
    app.launch()

    XCTAssertTrue(app.textFields["auth.emailField"].waitForExistence(timeout: 8))
    XCTAssertTrue(app.secureTextFields["auth.passwordField"].exists)
    XCTAssertTrue(app.buttons["auth.loginButton"].exists)
    XCTAssertTrue(app.buttons["auth.appleSignInButton"].exists)
    XCTAssertTrue(app.staticTexts["Turn profile screenshots and awkward chat moments into specific, useful next moves."].exists)
    XCTAssertTrue(app.staticTexts["iOS pricing includes Apple purchase fees."].exists)

    app.buttons["Create account"].tap()

    XCTAssertTrue(app.buttons["auth.createAccountButton"].waitForExistence(timeout: 2))
    XCTAssertTrue(app.textFields["auth.promoCodeField"].exists)
  }

  func testAppStoreScreenshotModeShowsSignedInAccountSurface() throws {
    let app = XCUIApplication()
    app.launchArguments.append("-SWIPEBETTER_APP_STORE_SCREENSHOTS")
    app.launchArguments.append("-SWIPEBETTER_SCREENSHOT_TAB")
    app.launchArguments.append("account")
    app.launch()

    XCTAssertTrue(app.buttons["account.restorePurchasesButton"].waitForExistence(timeout: 8))
    XCTAssertTrue(app.buttons["account.manageSubscriptionButton"].waitForExistence(timeout: 2))
  }

  func testSnapSetupGuideIsVisibleAndReadable() throws {
    let app = XCUIApplication()
    app.launchArguments.append("-SWIPEBETTER_APP_STORE_SCREENSHOTS")
    app.launchArguments.append("-SWIPEBETTER_SCREENSHOT_TAB")
    app.launchArguments.append("account")
    app.launch()

    let setupButton = app.buttons["account.setupSnapButton"]
    XCTAssertTrue(setupButton.waitForExistence(timeout: 8))
    XCTAssertTrue(setupButton.isHittable)
    setupButton.tap()

    XCTAssertTrue(app.staticTexts["SwipeBetter Snap"].waitForExistence(timeout: 3))
    XCTAssertTrue(app.staticTexts["Step 1 of 6"].exists)
    XCTAssertTrue(app.staticTexts["Use Shortcuts, not Siri"].exists)
    XCTAssertTrue(app.buttons["snap.openShortcutsButton"].isHittable)

    let nextButton = app.buttons["snap.nextStepButton"]
    XCTAssertTrue(nextButton.isHittable)
    nextButton.tap()
    XCTAssertTrue(app.staticTexts["Step 2 of 6"].waitForExistence(timeout: 2))
    XCTAssertTrue(app.staticTexts["Create a blank shortcut"].exists)

    for step in 3...6 {
      nextButton.tap()
      XCTAssertTrue(app.staticTexts["Step \(step) of 6"].waitForExistence(timeout: 2))
    }
    XCTAssertTrue(app.staticTexts["Connect Back Tap"].exists)
    XCTAssertTrue(app.staticTexts["Action Button option"].exists)

    let attachment = XCTAttachment(screenshot: app.screenshot())
    attachment.name = "SwipeBetter Snap Setup"
    attachment.lifetime = .keepAlways
    add(attachment)
  }

  func testReplyResultsRemainReadableAndCopyable() throws {
    let app = XCUIApplication()
    app.launchArguments.append("-SWIPEBETTER_APP_STORE_SCREENSHOTS")
    app.launchArguments.append("-SWIPEBETTER_SCREENSHOT_TAB")
    app.launchArguments.append("replies")
    app.launch()

    let copyButton = app.buttons["replies.copyButton.1"]
    for _ in 0..<5 where !copyButton.isHittable {
      app.swipeUp()
    }

    XCTAssertTrue(copyButton.waitForExistence(timeout: 3))
    XCTAssertTrue(copyButton.isHittable)
    copyButton.tap()
    XCTAssertEqual(copyButton.label, "Reply 1 copied")
  }
}
