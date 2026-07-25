import AuthenticationServices
import Foundation
import Observation
import StoreKit
import UIKit

@MainActor
@Observable
final class AppModel {
  var user: AuthUser?
  var me: MeResponse?
  var credits: CreditsResponse?
  var profileHistory: [ProfileAnalysis] = []
  var replyHistory: [ReplyAnalysis] = []
  var pendingImportText = ""
  var pendingImportImages: [Data] = []
  var importRevision = 0
  var requestedTabIdentifier: String?
  var deepLinkRevision = 0
  var pendingSnapRequest = false
  var snapStatusMessage: String?
  var lastError: String?
  var isBusy = false
  var requiresAppleReauthenticationForDeletion = false

  let api = SwipeBetterAPI.shared
  let purchases = PurchaseStore()
  private var purchaseUpdatesTask: Task<Void, Never>?

  var isSignedIn: Bool { user != nil }

  func bootstrap() async {
    startPurchaseUpdates()
    loadSharedImport()
    await refreshSession()
    await purchases.loadProducts()
    if isSignedIn {
      await refreshAccount()
      await refreshHistory()
      _ = try? await purchases.syncCurrentEntitlements(api: api)
      await refreshAccount()
    }
    await processPendingSnapRequest()
  }

  func configureForAppStoreScreenshots() {
    guard let demoUser: AuthUser = SwipeBetterScreenshotFixtures.decode("""
      {
        "id": "app-store-demo",
        "email": "demo@swipebetter.ai",
        "firstName": "Alex",
        "lastName": "Demo"
      }
      """) else {
      return
    }

    user = demoUser
    me = SwipeBetterScreenshotFixtures.decode("""
      {
        "user": {
          "id": "app-store-demo",
          "email": "demo@swipebetter.ai",
          "firstName": "Alex",
          "lastName": "Demo"
        },
        "isPro": true,
        "proActive": true,
        "planType": "unlimited",
        "subscriptionStatus": "active",
        "oneTimeCredits": 12
      }
      """)
    credits = SwipeBetterScreenshotFixtures.decode("""
      {
        "planTier": "unlimited",
        "credits": 12,
        "hasAccess": true,
        "isUnlimited": true,
        "isSuperUser": false
      }
      """)
    profileHistory = SwipeBetterScreenshotFixtures.profileStatus?.analysis.map { [$0] } ?? []
    replyHistory = SwipeBetterScreenshotFixtures.replyResponse?.analysis.map { [$0] } ?? []
    lastError = nil
    isBusy = false
  }

  func startPurchaseUpdates() {
    guard purchaseUpdatesTask == nil else { return }

    purchaseUpdatesTask = Task { [weak self] in
      for await verification in Transaction.updates {
        guard let self else { return }
        await self.handlePurchaseUpdate(verification)
      }
    }
  }

  func stopPurchaseUpdates() {
    purchaseUpdatesTask?.cancel()
    purchaseUpdatesTask = nil
  }

  private func handlePurchaseUpdate(_ verification: VerificationResult<Transaction>) async {
    guard isSignedIn else { return }

    do {
      try await purchases.sync(verification: verification, api: api)
      await refreshAccount()
    } catch {
      purchases.lastPurchaseMessage = error.localizedDescription
    }
  }

  func refreshSession() async {
    do {
      let response: AuthUserResponse = try await api.get("/api/auth/user")
      user = response.user
    } catch SwipeBetterAPIError.server(let status, _) where status == 401 {
      user = nil
    } catch {
      lastError = error.localizedDescription
      user = nil
    }
  }

  func login(email: String, password: String) async {
    await runBusy {
      let response: AuthUserResponse = try await api.post("/api/auth/login", body: LoginRequest(email: email, password: password))
      user = response.user
      await refreshAfterAuth()
    }
    await processPendingSnapRequest()
  }

  func signup(email: String, password: String, firstName: String, lastName: String, promoCode: String) async {
    await runBusy {
      let request = SignupRequest(
        email: email,
        password: password,
        firstName: firstName.trimmedNil,
        lastName: lastName.trimmedNil,
        promoCode: promoCode.trimmedNil
      )
      let response: AuthUserResponse = try await api.post("/api/auth/signup", body: request)
      user = response.user
      await refreshAfterAuth()
    }
    await processPendingSnapRequest()
  }

  func requestPasswordReset(email: String) async -> String? {
    await runBusyReturning {
      let response: APIMessage = try await api.post(
        "/api/auth/forgot-password",
        body: PasswordResetRequest(email: email)
      )
      return response.message ?? "If an account exists with that email, we sent a reset link."
    }
  }

  func signInWithApple(credential: ASAuthorizationAppleIDCredential) async {
    await runBusy {
      let response = try await authenticateWithApple(credential: credential)
      user = response.user
      await refreshAfterAuth()
    }
    await processPendingSnapRequest()
  }

  func logout() async {
    await runBusy {
      let _: EmptyResponse = try await api.post("/api/auth/logout")
      clearLocalAccountState()
    }
  }

  func refreshAccount() async {
    do {
      me = try await api.get("/api/me")
      credits = try await api.get("/api/credits")
    } catch {
      lastError = error.localizedDescription
    }
  }

  func refreshHistory() async {
    do {
      async let profiles: [ProfileAnalysis] = api.get("/api/analyses/profile")
      async let replies: [ReplyAnalysis] = api.get("/api/analyses/reply")
      profileHistory = try await profiles
      replyHistory = try await replies
    } catch {
      lastError = error.localizedDescription
    }
  }

  private func refreshAfterAuth() async {
    startPurchaseUpdates()
    await refreshAccount()
    await refreshHistory()
    _ = try? await purchases.syncCurrentEntitlements(api: api)
    await refreshAccount()
  }

  func startProfileAudit(platform: String, gender: String, intent: String, enm: Bool, images: [Data]) async -> ProfileStatusResponse? {
    await runBusyReturning {
      let screenshots = images.prefix(10).compactMap { Self.jpegDataURL(from: $0) }
      guard !screenshots.isEmpty else {
        throw SwipeBetterAPIError.server(status: 400, message: "Add at least one screenshot first.")
      }
      let start: StartProfileResponse = try await api.post(
        "/api/analyze-profile",
        body: ProfileAnalysisRequest(platform: platform, gender: gender, intent: intent, screenshots: screenshots, enm: enm)
      )
      return try await pollProfile(jobId: start.jobId)
    }
  }

  func generateReplies(tone: String, goal: String, enm: Bool, conversationText: String, images: [Data]) async -> ReplyAnalysisResponse? {
    await runBusyReturning {
      let screenshots = images.prefix(3).compactMap { Self.jpegDataURL(from: $0) }
      let text = conversationText.trimmingCharacters(in: .whitespacesAndNewlines)
      guard !text.isEmpty || !screenshots.isEmpty else {
        throw SwipeBetterAPIError.server(status: 400, message: "Paste chat text or add a screenshot first.")
      }
      let response: ReplyAnalysisResponse = try await api.post(
        "/api/analyze-reply",
        body: ReplyAnalysisRequest(
          tone: tone,
          goal: goal.isEmpty ? nil : goal,
          screenshots: screenshots.isEmpty ? nil : screenshots,
          conversationText: text.isEmpty ? nil : text,
          enm: enm
        )
      )
      await refreshAccount()
      await refreshHistory()
      return response
    }
  }

  func purchase(_ product: Product) async {
    await runBusy {
      try await purchases.purchase(product, api: api, userId: user?.id)
      await refreshAccount()
    }
  }

  func restorePurchases() async {
    await runBusy {
      try await purchases.restorePurchases(api: api)
      await refreshAccount()
    }
  }

  func manageSubscriptions() async {
    await runBusy {
      try await purchases.manageSubscriptions()
      await refreshAccount()
    }
  }

  func deleteAccount() async {
    isBusy = true
    lastError = nil
    defer { isBusy = false }
    do {
      let _: EmptyResponse = try await api.delete("/api/account")
      clearLocalAccountState()
    } catch SwipeBetterAPIError.server(let status, _) where status == 409 {
      requiresAppleReauthenticationForDeletion = true
    } catch {
      lastError = error.localizedDescription
    }
  }

  func confirmAppleAndDelete(credential: ASAuthorizationAppleIDCredential) async {
    await runBusy {
      let response = try await authenticateWithApple(credential: credential)
      user = response.user
      let _: EmptyResponse = try await api.delete("/api/account")
      requiresAppleReauthenticationForDeletion = false
      clearLocalAccountState()
    }
  }

  func loadSharedImport() {
    guard let payload = SharedImportStore.load() else { return }
    pendingImportText = payload.text ?? ""
    pendingImportImages = SharedImportStore.imageData(for: payload)
    importRevision += 1
    SharedImportStore.clear(payload)
  }

  func consumePendingImport() {
    pendingImportText = ""
    pendingImportImages = []
  }

  func handleDeepLink(_ url: URL) {
    guard url.scheme == "swipebetter" else { return }

    let target = [url.host, url.path.trimmingCharacters(in: CharacterSet(charactersIn: "/"))]
      .compactMap { $0?.lowercased() }
      .first { !$0.isEmpty } ?? "import"
    let deepLinkText = URLComponents(url: url, resolvingAgainstBaseURL: false)?
      .queryItems?
      .first(where: { $0.name == "text" })?
      .value?
      .trimmingCharacters(in: .whitespacesAndNewlines)

    if let deepLinkText, !deepLinkText.isEmpty {
      pendingImportText = String(deepLinkText.prefix(5000))
      pendingImportImages = []
      importRevision += 1
      requestedTabIdentifier = "replies"
      deepLinkRevision += 1
      return
    }

    if target == "snap" {
      pendingSnapRequest = true
      requestedTabIdentifier = "replies"
    } else if target == "import" {
      loadSharedImport()
      requestedTabIdentifier = tabIdentifierForPendingImport(defaultingTo: "replies")
    } else {
      requestedTabIdentifier = tabIdentifier(for: target)
    }

    deepLinkRevision += 1
  }

  func processPendingSnapRequest() async {
    guard pendingSnapRequest, isSignedIn, !isBusy else { return }

    pendingSnapRequest = false
    isBusy = true
    lastError = nil
    snapStatusMessage = nil
    defer { isBusy = false }

    do {
      let imageData = try await SwipeBetterLatestScreenshotLoader.load()
      try await SwipeBetterSnapRunner.run(imageData: imageData)
      snapStatusMessage = "Replies are ready. Return to your dating app and open the SwipeBetter keyboard."
      await refreshAccount()
      await refreshHistory()
    } catch {
      let message = error.localizedDescription
      lastError = message
      try? SwipeBetterSnapStore.save(
        SwipeBetterSnapPayload(
          state: .failed,
          message: message
        )
      )
    }
  }

  private func pollProfile(jobId: String) async throws -> ProfileStatusResponse {
    for _ in 0..<30 {
      try Task.checkCancellation()
      let status: ProfileStatusResponse = try await api.get("/api/analyze-profile/status/\(jobId)")
      if status.status == "completed" || status.status == "failed" {
        await refreshAccount()
        await refreshHistory()
        return status
      }
      try await Task.sleep(for: .seconds(2))
    }
    throw SwipeBetterAPIError.server(status: 408, message: "The audit is still running. Check History in a minute.")
  }

  private func runBusy(_ operation: () async throws -> Void) async {
    isBusy = true
    lastError = nil
    defer { isBusy = false }
    do {
      try await operation()
    } catch {
      lastError = error.localizedDescription
    }
  }

  private func authenticateWithApple(
    credential: ASAuthorizationAppleIDCredential
  ) async throws -> AuthUserResponse {
    guard let tokenData = credential.identityToken,
          let identityToken = String(data: tokenData, encoding: .utf8),
          let codeData = credential.authorizationCode,
          let authorizationCode = String(data: codeData, encoding: .utf8) else {
      throw SwipeBetterAPIError.server(
        status: 400,
        message: "Apple did not return the authorization needed to secure this account."
      )
    }
    let name = AppleAuthRequest.AppleUser.Name(
      firstName: credential.fullName?.givenName,
      lastName: credential.fullName?.familyName
    )
    let appleUser = AppleAuthRequest.AppleUser(
      email: credential.email,
      name: name.firstName == nil && name.lastName == nil ? nil : name
    )
    return try await api.post(
      "/api/auth/apple",
      body: AppleAuthRequest(
        identityToken: identityToken,
        authorizationCode: authorizationCode,
        user: appleUser
      )
    )
  }

  private func runBusyReturning<T>(_ operation: () async throws -> T) async -> T? {
    isBusy = true
    lastError = nil
    defer { isBusy = false }
    do {
      return try await operation()
    } catch {
      lastError = error.localizedDescription
      return nil
    }
  }

  static func jpegDataURL(from data: Data) -> String? {
    let jpeg = SwipeBetterImageProcessor.normalizedJPEGData(from: data) ?? data
    return "data:image/jpeg;base64,\(jpeg.base64EncodedString())"
  }

  private func tabIdentifierForPendingImport(defaultingTo fallback: String) -> String {
    if !pendingImportText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
      return "replies"
    }
    if !pendingImportImages.isEmpty {
      return "audit"
    }
    return fallback
  }

  private func tabIdentifier(for target: String) -> String {
    switch target {
    case "audit", "profile", "profiles":
      return "audit"
    case "reply", "replies", "chat", "keyboard":
      return "replies"
    case "history":
      return "history"
    case "account", "billing", "plans", "subscription":
      return "account"
    default:
      return "replies"
    }
  }

  private func clearLocalAccountState() {
    user = nil
    me = nil
    credits = nil
    profileHistory = []
    replyHistory = []
    pendingImportText = ""
    pendingImportImages = []
    requiresAppleReauthenticationForDeletion = false
    requestedTabIdentifier = nil
    stopPurchaseUpdates()
    purchases.resetTransientState()
    importRevision += 1
    deepLinkRevision += 1
    SharedImportStore.clearAll()
  }
}

extension String {
  var trimmedNil: String? {
    let trimmed = trimmingCharacters(in: .whitespacesAndNewlines)
    return trimmed.isEmpty ? nil : trimmed
  }
}
