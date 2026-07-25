import AppIntents
import Foundation
import Photos
import UIKit

struct CreateRepliesFromScreenshotIntent: AppIntent {
  static let title: LocalizedStringResource = "Create Replies from Screenshot (Legacy)"
  static let description = IntentDescription(
    "Legacy compatibility action. Use Create Replies from Latest Screenshot for new automations."
  )
  static let openAppWhenRun = false
  static let isDiscoverable = false

  @Parameter(
    title: "Screenshot",
    description: "The image provided by a screenshot automation or another Shortcuts photo action.",
    inputConnectionBehavior: .connectToPreviousIntentResult
  )
  var screenshot: IntentFile

  static var parameterSummary: some ParameterSummary {
    Summary("Create replies from \(\.$screenshot)")
  }

  init() {}

  init(screenshot: IntentFile) {
    self.screenshot = screenshot
  }

  func perform() async throws -> some IntentResult & ProvidesDialog {
    try await SwipeBetterSnapRunner.run(imageData: screenshot.data)
    return .result(dialog: "Your replies are ready. Open the SwipeBetter keyboard and tap one to send it.")
  }
}

struct CreateRepliesFromLatestScreenshotIntent: AppIntent {
  static let title: LocalizedStringResource = "Create Replies from Latest Screenshot"
  static let description = IntentDescription(
    "Reads only the newest screenshot in Photos and prepares three replies in the SwipeBetter keyboard."
  )
  static let openAppWhenRun = false

  func perform() async throws -> some IntentResult & ProvidesDialog {
    let imageData = try await SwipeBetterLatestScreenshotLoader.load()
    try await SwipeBetterSnapRunner.run(imageData: imageData)
    return .result(dialog: "Your replies are ready. Open the SwipeBetter keyboard and tap one to send it.")
  }
}

struct SwipeBetterAppShortcuts: AppShortcutsProvider {
  static var appShortcuts: [AppShortcut] {
    AppShortcut(
      intent: CreateRepliesFromLatestScreenshotIntent(),
      phrases: [
        "Create replies with \(.applicationName)",
        "Read my latest screenshot with \(.applicationName)",
      ],
      shortTitle: "Snap Back",
      systemImageName: "message.badge.waveform"
    )
  }
}

private enum SwipeBetterLatestScreenshotLoader {
  static func load(
    now: Date = Date(),
    maxAge: TimeInterval = 2 * 60
  ) async throws -> Data {
    let status = PHPhotoLibrary.authorizationStatus(for: .readWrite)
    guard status == .authorized else {
      throw SwipeBetterSnapIntentError.photoAccessRequired
    }

    for attempt in 0..<5 {
      if let asset = newestRecentScreenshot(now: now, maxAge: maxAge),
         let data = await imageData(for: asset) {
        return data
      }

      if attempt < 4 {
        try await Task.sleep(nanoseconds: 400_000_000)
      }
    }

    throw SwipeBetterSnapIntentError.noRecentScreenshot
  }

  private static func newestRecentScreenshot(now: Date, maxAge: TimeInterval) -> PHAsset? {
    let options = PHFetchOptions()
    options.fetchLimit = 25
    options.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]

    let assets = PHAsset.fetchAssets(with: .image, options: options)
    var result: PHAsset?
    assets.enumerateObjects { asset, _, stop in
      guard asset.mediaSubtypes.contains(.photoScreenshot),
            let createdAt = asset.creationDate,
            now.timeIntervalSince(createdAt) <= maxAge else {
        return
      }
      result = asset
      stop.pointee = true
    }
    return result
  }

  private static func imageData(for asset: PHAsset) async -> Data? {
    await withCheckedContinuation { continuation in
      let options = PHImageRequestOptions()
      options.deliveryMode = .highQualityFormat
      options.isNetworkAccessAllowed = true
      options.isSynchronous = false

      PHImageManager.default().requestImageDataAndOrientation(
        for: asset,
        options: options
      ) { data, _, _, _ in
        continuation.resume(returning: data)
      }
    }
  }
}

private enum SwipeBetterSnapRunner {
  static func run(imageData: Data) async throws {
    let operationId = UUID().uuidString
    try SwipeBetterSnapStore.save(
      SwipeBetterSnapPayload(
        id: operationId,
        state: .processing,
        message: "Reading the conversation..."
      )
    )

    do {
      guard UIImage(data: imageData) != nil,
            let screenshotDataURL = jpegDataURL(from: imageData) else {
        throw SwipeBetterSnapIntentError.invalidImage
      }

      let response: ReplyAnalysisResponse = try await SwipeBetterAPI.shared.post(
        "/api/analyze-reply",
        body: ReplyAnalysisRequest(
          tone: "flirty",
          goal: "keep_going",
          screenshots: [screenshotDataURL],
          conversationText: nil,
          enm: false
        )
      )

      let replies = (response.parsed?.suggestedReplies ?? response.analysis?.suggestedReplies ?? [])
        .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
        .filter { !$0.isEmpty }

      guard !replies.isEmpty else {
        throw SwipeBetterSnapIntentError.noReplies
      }

      try SwipeBetterSnapStore.save(
        SwipeBetterSnapPayload(
          id: operationId,
          state: .ready,
          conversationContext: response.parsed?.conversationContext ?? response.analysis?.conversationContext,
          replies: Array(replies.prefix(3)),
          message: "Replies are ready in the SwipeBetter keyboard."
        )
      )
    } catch {
      let message = friendlyMessage(for: error)
      try? SwipeBetterSnapStore.save(
        SwipeBetterSnapPayload(
          id: operationId,
          state: .failed,
          message: message
        )
      )
      throw SwipeBetterSnapIntentError.requestFailed(message)
    }
  }

  private static func jpegDataURL(from data: Data) -> String? {
    let jpeg = SwipeBetterImageProcessor.normalizedJPEGData(from: data) ?? data
    guard UIImage(data: jpeg) != nil else { return nil }
    return "data:image/jpeg;base64,\(jpeg.base64EncodedString())"
  }

  private static func friendlyMessage(for error: Error) -> String {
    if case SwipeBetterAPIError.server(let status, _) = error, status == 401 {
      return "Open SwipeBetter and sign in once, then run SwipeBetter Snap again."
    }
    if case SwipeBetterAPIError.server(let status, let message) = error, status == 402 || status == 403 {
      return message
    }
    if let error = error as? SwipeBetterSnapIntentError {
      return error.errorDescription ?? "SwipeBetter could not create replies."
    }
    return error.localizedDescription
  }
}

enum SwipeBetterSnapIntentError: LocalizedError {
  case invalidImage
  case photoAccessRequired
  case noRecentScreenshot
  case noReplies
  case requestFailed(String)

  var errorDescription: String? {
    switch self {
    case .invalidImage:
      return "The shortcut did not provide a readable screenshot."
    case .photoAccessRequired:
      return "Open SwipeBetter, set up SwipeBetter Snap, and allow Full Photo Access."
    case .noRecentScreenshot:
      return "No new screenshot was found. Take a screenshot, approve the automation, and try again."
    case .noReplies:
      return "SwipeBetter could not find enough conversation context in that screenshot."
    case .requestFailed(let message):
      return message
    }
  }
}
