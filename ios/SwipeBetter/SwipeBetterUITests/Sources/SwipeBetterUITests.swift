import XCTest

final class SwipeBetterUITests: XCTestCase {
  override func setUpWithError() throws {
    continueAfterFailure = false
  }

  func testSignedOutLaunchShowsAuthAndReviewSafeCopy() throws {
    let app = XCUIApplication()
    app.launchArguments.append("-SWIPEBETTER_UI_TESTING")
    app.launch()

    XCTAssertTrue(app.staticTexts["SwipeBetter"].waitForExistence(timeout: 8))
    XCTAssertTrue(app.buttons["auth.appleSignInButton"].exists)
    XCTAssertTrue(app.buttons["auth.appleSignInButton"].label.contains("Sign in with Apple"))
    XCTAssertTrue(app.buttons["auth.continueWithEmailButton"].exists)
    XCTAssertTrue(app.buttons["auth.createAccountChoiceButton"].exists)
    XCTAssertTrue(app.staticTexts["Screenshots are sent only for requested analysis and are excluded from your saved history."].exists)
    XCTAssertTrue(app.staticTexts["Your signed-in history syncs across devices."].exists)
    XCTAssertTrue(app.links["Terms"].exists)
    XCTAssertTrue(app.links["Privacy"].exists)
    XCTAssertTrue(app.links["Support"].exists)

    app.buttons["auth.continueWithEmailButton"].tap()

    XCTAssertTrue(app.textFields["auth.emailField"].waitForExistence(timeout: 3))
    XCTAssertTrue(app.secureTextFields["auth.passwordField"].exists)
    XCTAssertTrue(app.buttons["auth.loginButton"].exists)
    XCTAssertTrue(
      app.staticTexts[
        "A clearer next move."
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
    XCTAssertTrue(app.staticTexts["Unlimited"].exists)
    XCTAssertTrue(app.staticTexts["Active"].exists)
  }

  func testRedesignedWorkspacesHaveDistinctHierarchy() throws {
    let audit = XCUIApplication()
    audit.launchArguments.append("-SWIPEBETTER_APP_STORE_SCREENSHOTS")
    audit.launchArguments.append("-SWIPEBETTER_SCREENSHOT_TAB")
    audit.launchArguments.append("audit")
    audit.launch()

    XCTAssertTrue(appText("Profile Audit", in: audit).waitForExistence(timeout: 8))
    XCTAssertTrue(appText("DATING APP", in: audit).exists)
    XCTAssertTrue(audit.buttons["audit.runButton"].isHittable)

    let replies = XCUIApplication()
    replies.launchArguments.append("-SWIPEBETTER_APP_STORE_SCREENSHOTS")
    replies.launchArguments.append("-SWIPEBETTER_SCREENSHOT_TAB")
    replies.launchArguments.append("replies")
    replies.launch()

    XCTAssertTrue(appText("Replies", in: replies).waitForExistence(timeout: 8))
    XCTAssertTrue(appText("CONVERSATION", in: replies).exists)
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
    for _ in 0..<5 where !setupButton.exists {
      app.swipeUp()
    }
    XCTAssertTrue(setupButton.waitForExistence(timeout: 8))
    XCTAssertTrue(setupButton.isHittable)
    app.staticTexts["Snap Back"].tap()

    XCTAssertTrue(app.staticTexts["SwipeBetter Snap"].waitForExistence(timeout: 8))
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
    XCTAssertTrue(app.staticTexts["Choose voice or keyboard"].exists)
    XCTAssertTrue(app.staticTexts["Voice"].exists)
    XCTAssertTrue(app.staticTexts["Quiet"].exists)
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
    app.launchArguments.append("replyResult")
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

  func testReplyInputModeSwitchesVisibleContent() throws {
    let app = XCUIApplication()
    app.launchArguments.append("-SWIPEBETTER_APP_STORE_SCREENSHOTS")
    app.launchArguments.append("-SWIPEBETTER_SCREENSHOT_TAB")
    app.launchArguments.append("replies")
    app.launch()

    let mode = app.segmentedControls["replies.inputModePicker"]
    XCTAssertTrue(mode.waitForExistence(timeout: 8))
    XCTAssertTrue(app.textViews["replies.conversationEditor"].exists)
    mode.buttons["Screenshots"].tap()
    XCTAssertFalse(app.textViews["replies.conversationEditor"].exists)
    XCTAssertTrue(app.buttons["replies.addScreenshotsButton"].exists)
    XCTAssertTrue(app.buttons["replies.generateButton"].isHittable)
    mode.buttons["Paste text"].tap()
    XCTAssertTrue(app.textViews["replies.conversationEditor"].waitForExistence(timeout: 2))
  }

  func testAuditResultsRemainCopyable() throws {
    let app = XCUIApplication()
    app.launchArguments.append("-SWIPEBETTER_APP_STORE_SCREENSHOTS")
    app.launchArguments.append("-SWIPEBETTER_SCREENSHOT_TAB")
    app.launchArguments.append("auditResult")
    app.launch()

    let firstFixCopy = app.buttons["audit.copyButton.1.0"]
    XCTAssertTrue(firstFixCopy.waitForExistence(timeout: 3))
    XCTAssertTrue(firstFixCopy.isHittable)
    firstFixCopy.tap()
    XCTAssertEqual(firstFixCopy.label, "First fix copied")

    let improvementCopy = app.buttons["audit.copyButton.fixes.0"]
    XCTAssertTrue(improvementCopy.waitForExistence(timeout: 3))
    for _ in 0..<5 where !improvementCopy.isHittable { app.swipeUp() }
    XCTAssertTrue(improvementCopy.isHittable)
    improvementCopy.tap()
    XCTAssertEqual(improvementCopy.label, "Copied")

    let copyButton = app.buttons["audit.copyButton.2.0"]
    for _ in 0..<5 where !copyButton.isHittable { app.swipeUp() }
    XCTAssertTrue(copyButton.waitForExistence(timeout: 3))
    XCTAssertTrue(copyButton.isHittable)
    copyButton.tap()
    XCTAssertEqual(copyButton.label, "New bio copied")
    XCTAssertTrue(app.buttons["audit.copyButton.fixes.0"].exists)
  }

  func testHistoryParsesProductionFractionalTimestamps() throws {
    let app = XCUIApplication()
    app.launchArguments.append("-SWIPEBETTER_APP_STORE_SCREENSHOTS")
    app.launchArguments.append("-SWIPEBETTER_SCREENSHOT_TAB")
    app.launchArguments.append("history")
    app.launch()

    XCTAssertTrue(app.staticTexts["AUG 1"].firstMatch.waitForExistence(timeout: 8))
    XCTAssertTrue(app.staticTexts["JUL 31"].firstMatch.waitForExistence(timeout: 2))
    XCTAssertLessThan(
      app.staticTexts["AUG 1"].firstMatch.frame.minY,
      app.staticTexts["JUL 31"].firstMatch.frame.minY
    )
    XCTAssertFalse(app.staticTexts.matching(NSPredicate(format: "label MATCHES %@", "\\d{4}-\\d{2}-\\d{2}.*")).firstMatch.exists)
  }

  func testHistoryRowOpensClientOnlyDetail() throws {
    let app = XCUIApplication()
    app.launchArguments.append("-SWIPEBETTER_APP_STORE_SCREENSHOTS")
    app.launchArguments.append("-SWIPEBETTER_SCREENSHOT_TAB")
    app.launchArguments.append("history")
    app.launch()

    let row = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH 'history.row.'")).firstMatch
    XCTAssertTrue(row.waitForExistence(timeout: 8))
    row.tap()
    let backButton = app.navigationBars.buttons["History"]
    XCTAssertTrue(backButton.waitForExistence(timeout: 3))
    backButton.tap()
    XCTAssertTrue(app.staticTexts["History"].waitForExistence(timeout: 3))
  }

  func testHistoryEmptyStateIsActionable() throws {
    let app = XCUIApplication()
    app.launchArguments.append("-SWIPEBETTER_APP_STORE_SCREENSHOTS")
    app.launchArguments.append("-SWIPEBETTER_SCREENSHOT_TAB")
    app.launchArguments.append("historyEmpty")
    app.launch()

    XCTAssertTrue(app.staticTexts["Your history is empty"].waitForExistence(timeout: 8))
    XCTAssertTrue(app.buttons["history.runFirstAuditButton"].isHittable)
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
    XCTAssertTrue(app.buttons["keyboard.confidentReplyButton"].exists)
    XCTAssertTrue(app.buttons["keyboard.askOutReplyButton"].exists)
    XCTAssertTrue(app.buttons["keyboard.nextKeyboardButton"].exists)
    XCTAssertTrue(app.buttons["keyboard.deleteBackwardButton"].exists)
    let attachment = XCTAttachment(screenshot: app.screenshot())
    attachment.name = "SwipeBetter Keyboard"
    attachment.lifetime = .keepAlways
    add(attachment)
  }

  private func appText(_ value: String, in app: XCUIApplication) -> XCUIElement {
    app.staticTexts[value]
  }
}
