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
    XCTAssertTrue(app.staticTexts["Create the shortcut"].exists)
    XCTAssertTrue(app.staticTexts["Connect the gesture"].exists)
    XCTAssertTrue(app.buttons["snap.openShortcutEditorButton"].isHittable)

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
