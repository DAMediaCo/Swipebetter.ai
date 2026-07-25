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
    XCTAssertTrue(app.staticTexts["Stop guessing what to change."].exists)
    XCTAssertTrue(
      app.staticTexts[
        "Bring the profile or the conversation. Leave with a clear next move that still sounds like you."
      ].exists
    )
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

  func testRedesignedWorkspacesHaveDistinctHierarchy() throws {
    let audit = XCUIApplication()
    audit.launchArguments.append("-SWIPEBETTER_APP_STORE_SCREENSHOTS")
    audit.launchArguments.append("-SWIPEBETTER_SCREENSHOT_TAB")
    audit.launchArguments.append("audit")
    audit.launch()

    XCTAssertTrue(appText("PROFILE LAB", in: audit).waitForExistence(timeout: 8))
    XCTAssertTrue(appText("Build a profile worth pausing on.", in: audit).exists)
    XCTAssertTrue(audit.buttons["audit.runButton"].isHittable)

    let replies = XCUIApplication()
    replies.launchArguments.append("-SWIPEBETTER_APP_STORE_SCREENSHOTS")
    replies.launchArguments.append("-SWIPEBETTER_SCREENSHOT_TAB")
    replies.launchArguments.append("replies")
    replies.launch()

    XCTAssertTrue(appText("REPLY STUDIO", in: replies).waitForExistence(timeout: 8))
    XCTAssertTrue(appText("Say less. Land better.", in: replies).exists)
    XCTAssertTrue(replies.buttons["replies.generateButton"].isHittable)
  }

  func testAppleAccountDeletionReauthenticationIsClearAndActionable() throws {
    let app = XCUIApplication()
    app.launchArguments.append("-SWIPEBETTER_APP_STORE_SCREENSHOTS")
    app.launchArguments.append("-SWIPEBETTER_SCREENSHOT_TAB")
    app.launchArguments.append("account")
    app.launchArguments.append("-SWIPEBETTER_APPLE_DELETE_REAUTH")
    app.launch()

    XCTAssertTrue(app.staticTexts["Confirm with Apple"].waitForExistence(timeout: 8))
    let explanation = app.staticTexts.matching(
      NSPredicate(format: "label CONTAINS %@", "revoke its sign-in permission")
    ).firstMatch
    XCTAssertTrue(explanation.exists)
    XCTAssertTrue(app.buttons["account.appleDeletionReauthenticationButton"].isHittable)
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
    XCTAssertTrue(app.staticTexts["Step 1 of 3"].exists)
    XCTAssertTrue(app.staticTexts["Allow screenshot access"].exists)
    XCTAssertTrue(app.buttons["snap.photoAccessButton"].exists)

    let nextButton = app.buttons["snap.nextStepButton"]
    XCTAssertTrue(nextButton.isHittable)
    nextButton.tap()
    XCTAssertTrue(app.staticTexts["Step 2 of 3"].waitForExistence(timeout: 2))
    XCTAssertTrue(app.staticTexts["Take a screenshot"].exists)

    nextButton.tap()
    XCTAssertTrue(app.staticTexts["Step 3 of 3"].waitForExistence(timeout: 2))
    XCTAssertTrue(app.staticTexts["Tap Snap Back"].exists)
    XCTAssertTrue(app.staticTexts["snap.privacyNote"].exists)

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

  func testKeyboardExtensionVisualQA() throws {
    guard ProcessInfo.processInfo.environment["SWIPEBETTER_RUN_KEYBOARD_VISUAL_QA"] == "1" else {
      throw XCTSkip("Run manually after enabling SwipeBetter Keyboard in the simulator.")
    }

    let app = XCUIApplication()
    app.launchArguments.append("-SWIPEBETTER_KEYBOARD_VISUAL_TEST")
    app.launch()

    let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
    let continueButton = springboard.buttons["Continue"]
    if continueButton.waitForExistence(timeout: 3) {
      continueButton.tap()
    }

    let field = app.textFields["keyboardTest.textField"]
    XCTAssertTrue(field.waitForExistence(timeout: 8))
    field.tap()

    let swipeBetterButton = app.buttons["keyboard.warmReplyButton"]
    for _ in 0..<5 where !swipeBetterButton.exists {
      let nextKeyboard = app.buttons.matching(
        NSPredicate(format: "label CONTAINS[c] %@", "next keyboard")
      ).firstMatch
      guard nextKeyboard.waitForExistence(timeout: 2) else { break }
      nextKeyboard.tap()
    }

    XCTAssertTrue(swipeBetterButton.waitForExistence(timeout: 5))
    let attachment = XCTAttachment(screenshot: app.screenshot())
    attachment.name = "SwipeBetter Keyboard"
    attachment.lifetime = .keepAlways
    add(attachment)
  }

  private func appText(_ value: String, in app: XCUIApplication) -> XCUIElement {
    app.staticTexts[value]
  }
}
