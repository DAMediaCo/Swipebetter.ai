import AppIntents
import Foundation
import UIKit

struct CreateRepliesFromScreenshotIntent: AppIntent {
  static let title: LocalizedStringResource = "Create Replies from Screenshot"
  static let description = IntentDescription(
    "Reads a dating-app chat screenshot and prepares three replies in the SwipeBetter keyboard."
  )
  static let openAppWhenRun = false

  @Parameter(
    title: "Screenshot",
    description: "The screenshot produced by the Take Screenshot action.",
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
    let operationId = UUID().uuidString
    try SwipeBetterSnapStore.save(
      SwipeBetterSnapPayload(
        id: operationId,
        state: .processing,
        message: "Reading the conversation..."
      )
    )

    do {
      let imageData = screenshot.data
      guard UIImage(data: imageData) != nil,
            let screenshotDataURL = Self.jpegDataURL(from: imageData) else {
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

      return .result(dialog: "Your replies are ready. Open the SwipeBetter keyboard and tap one to send it.")
    } catch {
      let message = Self.friendlyMessage(for: error)
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

struct SwipeBetterAppShortcuts: AppShortcutsProvider {
  static var appShortcuts: [AppShortcut] {
    AppShortcut(
      intent: CreateRepliesFromScreenshotIntent(),
      phrases: [
        "Create replies with \(.applicationName)",
        "Analyze this chat with \(.applicationName)",
      ],
      shortTitle: "Create Chat Replies",
      systemImageName: "message.badge.waveform"
    )
  }

  static var shortcutTileColor: ShortcutTileColor {
    .orange
  }
}

enum SwipeBetterSnapIntentError: LocalizedError {
  case invalidImage
  case noReplies
  case requestFailed(String)

  var errorDescription: String? {
    switch self {
    case .invalidImage:
      return "The shortcut did not provide a readable screenshot."
    case .noReplies:
      return "SwipeBetter could not find enough conversation context in that screenshot."
    case .requestFailed(let message):
      return message
    }
  }
}
