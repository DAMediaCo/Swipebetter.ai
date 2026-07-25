import Foundation

public enum SwipeBetterSnapState: String, Codable, Equatable {
  case processing
  case ready
  case failed
}

public struct SwipeBetterSnapPayload: Codable, Equatable {
  public let id: String
  public let updatedAt: Date
  public let state: SwipeBetterSnapState
  public let conversationContext: String?
  public let replies: [String]
  public let message: String?

  public init(
    id: String = UUID().uuidString,
    updatedAt: Date = Date(),
    state: SwipeBetterSnapState,
    conversationContext: String? = nil,
    replies: [String] = [],
    message: String? = nil
  ) {
    self.id = id
    self.updatedAt = updatedAt
    self.state = state
    self.conversationContext = conversationContext
    self.replies = replies
    self.message = message
  }

  public func usableReply(at index: Int, now: Date = Date(), maxAge: TimeInterval = 30 * 60) -> String? {
    guard state == .ready,
          now.timeIntervalSince(updatedAt) <= maxAge,
          replies.indices.contains(index) else {
      return nil
    }
    let reply = replies[index].trimmingCharacters(in: .whitespacesAndNewlines)
    return reply.isEmpty ? nil : reply
  }

  public func isCurrent(now: Date = Date(), maxAge: TimeInterval = 30 * 60) -> Bool {
    now.timeIntervalSince(updatedAt) <= maxAge
  }
}

public enum SwipeBetterSnapStore {
  public static let appGroupId = "group.ai.swipebetter.shared"
  public static let payloadKey = "swipeBetterSnapPayload"

  public static var defaults: UserDefaults? {
    UserDefaults(suiteName: appGroupId)
  }

  public static func save(_ payload: SwipeBetterSnapPayload) throws {
    guard let defaults else {
      throw SwipeBetterSnapStoreError.sharedContainerUnavailable
    }
    defaults.set(try JSONEncoder().encode(payload), forKey: payloadKey)
    defaults.synchronize()
  }

  public static func load() -> SwipeBetterSnapPayload? {
    guard let data = defaults?.data(forKey: payloadKey) else { return nil }
    return try? JSONDecoder().decode(SwipeBetterSnapPayload.self, from: data)
  }

  public static func clear() {
    defaults?.removeObject(forKey: payloadKey)
  }
}

public enum SwipeBetterSnapStoreError: LocalizedError {
  case sharedContainerUnavailable

  public var errorDescription: String? {
    "SwipeBetter could not access its secure shared storage."
  }
}
