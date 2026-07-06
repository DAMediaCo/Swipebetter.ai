import Foundation
import UIKit

public enum SwipeBetterConfig {
  public static let apiBaseURL = URL(string: "https://swipebetter.ai")!
  public static let appGroupId = "group.ai.swipebetter.shared"
  public static let importPayloadKey = "pendingImportPayload"
  public static let starterProductId = "ai.swipebetter.starter"
  public static let monthlyProductId = "ai.swipebetter.unlimited.monthly"
  public static let annualProductId = "ai.swipebetter.unlimited.annual"
}

public enum SwipeBetterAPIError: LocalizedError {
  case invalidResponse
  case server(status: Int, message: String)
  case missingData

  public var errorDescription: String? {
    switch self {
    case .invalidResponse:
      return "The server returned an invalid response."
    case .server(_, let message):
      return message
    case .missingData:
      return "Missing required data."
    }
  }
}

public struct APIMessage: Decodable {
  public let error: String?
  public let message: String?
}

public struct AuthUser: Codable, Identifiable, Equatable {
  public let id: String
  public let email: String?
  public let firstName: String?
  public let lastName: String?

  public var displayName: String {
    let name = [firstName, lastName].compactMap { $0 }.joined(separator: " ")
    return name.isEmpty ? (email ?? "SwipeBetter user") : name
  }
}

public struct AuthUserResponse: Codable {
  public let user: AuthUser?
}

public struct LoginRequest: Encodable {
  public let email: String
  public let password: String
}

public struct PasswordResetRequest: Encodable {
  public let email: String
}

public struct SignupRequest: Encodable {
  public let email: String
  public let password: String
  public let firstName: String?
  public let lastName: String?
  public let promoCode: String?
}

public struct AppleAuthRequest: Encodable {
  public struct AppleUser: Encodable {
    public struct Name: Encodable {
      public let firstName: String?
      public let lastName: String?
    }

    public let email: String?
    public let name: Name?
  }

  public let identityToken: String
  public let user: AppleUser?
}

public struct MeResponse: Codable {
  public let user: AuthUser?
  public let isPro: Bool?
  public let proActive: Bool?
  public let planType: String?
  public let subscriptionStatus: String?
  public let oneTimeCredits: Int?
}

public struct CreditsResponse: Codable {
  public let planTier: String?
  public let credits: Int?
  public let hasAccess: Bool?
  public let isUnlimited: Bool?
  public let isSuperUser: Bool?
}

public struct ProfileAnalysisRequest: Encodable {
  public let platform: String
  public let gender: String
  public let intent: String
  public let screenshots: [String]
  public let enm: Bool?
}

public struct StartProfileResponse: Decodable {
  public let jobId: String
  public let status: String
  public let isFreeAnalysis: Bool?
  public let message: String?
}

public struct ProfileStatusResponse: Decodable {
  public let jobId: String?
  public let status: String
  public let message: String?
  public let error: String?
  public let analysis: ProfileAnalysis?
  public let isPaidUser: Bool?
}

public struct ProfileAnalysis: Codable, Identifiable, Equatable {
  public let id: Int?
  public let platform: String?
  public let gender: String?
  public let intent: String?
  public let bioSuggestions: String?
  public let photoFeedback: String?
  public let overallScore: Int?
  public let improvements: String?
  public let analysisStatus: String?
  public let createdAt: String?
  public let firstTip: String?

  public var stableId: String {
    if let id { return String(id) }
    return "\(platform ?? "profile")-\(createdAt ?? UUID().uuidString)"
  }
}

public struct ReplyAnalysisRequest: Encodable {
  public let tone: String
  public let goal: String?
  public let screenshots: [String]?
  public let conversationText: String?
  public let enm: Bool?
}

public struct ReplyAnalysisResponse: Decodable {
  public let analysis: ReplyAnalysis?
  public let parsed: ReplyParsed?
}

public struct ReplyParsed: Codable, Equatable {
  public let conversationContext: String?
  public let suggestedReplies: [String]?
}

public struct ReplyAnalysis: Codable, Identifiable, Equatable {
  public let id: Int?
  public let tone: String?
  public let suggestedReplies: [String]?
  public let conversationContext: String?
  public let createdAt: String?

  public var stableId: String {
    if let id { return String(id) }
    return "\(tone ?? "reply")-\(createdAt ?? UUID().uuidString)"
  }
}

public struct IAPSyncRequest: Encodable {
  public let transactionId: String
  public let productId: String
}

public struct IAPSyncResponse: Decodable {
  public let success: Bool
  public let processed: Bool?
  public let planTier: String?
  public let credits: Int?
}

public enum SwipeBetterImageProcessor {
  public static let maxPixelDimension: CGFloat = 1800
  public static let jpegCompressionQuality: CGFloat = 0.82

  public static func normalizedJPEGData(from data: Data) -> Data? {
    guard let image = UIImage(data: data) else { return nil }

    let maxSourceDimension = max(image.size.width, image.size.height)
    let targetSize: CGSize
    if maxSourceDimension > maxPixelDimension {
      let scale = maxPixelDimension / maxSourceDimension
      targetSize = CGSize(width: image.size.width * scale, height: image.size.height * scale)
    } else {
      targetSize = image.size
    }

    let format = UIGraphicsImageRendererFormat()
    format.scale = 1
    let renderer = UIGraphicsImageRenderer(size: targetSize, format: format)
    let rendered = renderer.image { _ in
      image.draw(in: CGRect(origin: .zero, size: targetSize))
    }
    return rendered.jpegData(compressionQuality: jpegCompressionQuality)
  }
}

public final class SwipeBetterAPI: Sendable {
  public static let shared = SwipeBetterAPI()
  private let session: URLSession
  private let decoder = JSONDecoder()
  private let encoder = JSONEncoder()

  public init(session: URLSession = .shared) {
    self.session = session
  }

  public func get<Response: Decodable>(_ path: String, as type: Response.Type = Response.self) async throws -> Response {
    var request = URLRequest(url: SwipeBetterConfig.apiBaseURL.appending(path: path))
    request.httpMethod = "GET"
    request.httpShouldHandleCookies = true
    return try await send(request)
  }

  public func post<Body: Encodable, Response: Decodable>(_ path: String, body: Body, as type: Response.Type = Response.self) async throws -> Response {
    var request = URLRequest(url: SwipeBetterConfig.apiBaseURL.appending(path: path))
    request.httpMethod = "POST"
    request.httpShouldHandleCookies = true
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try encoder.encode(body)
    return try await send(request)
  }

  public func post<Response: Decodable>(_ path: String, as type: Response.Type = Response.self) async throws -> Response {
    var request = URLRequest(url: SwipeBetterConfig.apiBaseURL.appending(path: path))
    request.httpMethod = "POST"
    request.httpShouldHandleCookies = true
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = Data("{}".utf8)
    return try await send(request)
  }

  public func delete<Response: Decodable>(_ path: String, as type: Response.Type = Response.self) async throws -> Response {
    var request = URLRequest(url: SwipeBetterConfig.apiBaseURL.appending(path: path))
    request.httpMethod = "DELETE"
    request.httpShouldHandleCookies = true
    return try await send(request)
  }

  private func send<Response: Decodable>(_ request: URLRequest) async throws -> Response {
    let (data, response) = try await session.data(for: request)
    guard let http = response as? HTTPURLResponse else {
      throw SwipeBetterAPIError.invalidResponse
    }
    guard 200..<300 ~= http.statusCode else {
      let apiMessage = try? decoder.decode(APIMessage.self, from: data)
      let message = apiMessage?.error ?? apiMessage?.message ?? "Server error \(http.statusCode)"
      throw SwipeBetterAPIError.server(status: http.statusCode, message: message)
    }
    if Response.self == EmptyResponse.self, let empty = EmptyResponse() as? Response {
      return empty
    }
    guard !data.isEmpty else {
      throw SwipeBetterAPIError.missingData
    }
    return try decoder.decode(Response.self, from: data)
  }
}

public struct EmptyResponse: Codable {
  public init() {}
}

public struct SharedImportPayload: Codable, Equatable {
  public let id: String
  public let receivedAt: Date
  public let text: String?
  public let imageFilenames: [String]

  public init(id: String = UUID().uuidString, receivedAt: Date = Date(), text: String?, imageFilenames: [String]) {
    self.id = id
    self.receivedAt = receivedAt
    self.text = text
    self.imageFilenames = imageFilenames
  }
}

public enum SharedImportStore {
  public static var defaults: UserDefaults? {
    UserDefaults(suiteName: SwipeBetterConfig.appGroupId)
  }

  public static var directoryURL: URL? {
    FileManager.default
      .containerURL(forSecurityApplicationGroupIdentifier: SwipeBetterConfig.appGroupId)?
      .appendingPathComponent("Imports", isDirectory: true)
  }

  public static func save(text: String?, images: [Data]) throws -> SharedImportPayload {
    guard let defaults, let directoryURL else {
      throw SwipeBetterAPIError.missingData
    }

    let cleanText = text?.trimmingCharacters(in: .whitespacesAndNewlines)
    guard cleanText?.isEmpty == false || !images.isEmpty else {
      throw SwipeBetterAPIError.missingData
    }

    clearAll()
    try prepareImportDirectory(directoryURL)
    let id = UUID().uuidString
    let normalizedImages = images.compactMap(SwipeBetterImageProcessor.normalizedJPEGData(from:))
    guard cleanText?.isEmpty == false || !normalizedImages.isEmpty else {
      throw SwipeBetterAPIError.missingData
    }

    let filenames = try normalizedImages.enumerated().map { index, data in
      let filename = "\(id)-\(index).jpg"
      try data.write(to: directoryURL.appendingPathComponent(filename), options: [.atomic, .completeFileProtection])
      return filename
    }
    let payload = SharedImportPayload(id: id, text: cleanText?.isEmpty == false ? cleanText : nil, imageFilenames: filenames)
    defaults.set(try JSONEncoder().encode(payload), forKey: SwipeBetterConfig.importPayloadKey)
    defaults.synchronize()
    return payload
  }

  public static func load() -> SharedImportPayload? {
    guard let data = defaults?.data(forKey: SwipeBetterConfig.importPayloadKey) else {
      return nil
    }
    return try? JSONDecoder().decode(SharedImportPayload.self, from: data)
  }

  public static func imageData(for payload: SharedImportPayload) -> [Data] {
    guard let directoryURL else { return [] }
    return payload.imageFilenames.compactMap { filename in
      try? Data(contentsOf: directoryURL.appendingPathComponent(filename))
    }
  }

  public static func clear(_ payload: SharedImportPayload? = load()) {
    defaults?.removeObject(forKey: SwipeBetterConfig.importPayloadKey)
    guard let payload, let directoryURL else { return }
    for filename in payload.imageFilenames {
      try? FileManager.default.removeItem(at: directoryURL.appendingPathComponent(filename))
    }
    removeDirectoryIfEmpty(directoryURL)
  }

  public static func clearAll() {
    defaults?.removeObject(forKey: SwipeBetterConfig.importPayloadKey)
    guard let directoryURL else { return }
    try? FileManager.default.removeItem(at: directoryURL)
  }

  private static func prepareImportDirectory(_ directoryURL: URL) throws {
    try FileManager.default.createDirectory(at: directoryURL, withIntermediateDirectories: true)
    try FileManager.default.setAttributes([.protectionKey: FileProtectionType.complete], ofItemAtPath: directoryURL.path)
    var resourceValues = URLResourceValues()
    resourceValues.isExcludedFromBackup = true
    var mutableDirectoryURL = directoryURL
    try mutableDirectoryURL.setResourceValues(resourceValues)
  }

  private static func removeDirectoryIfEmpty(_ directoryURL: URL) {
    guard let contents = try? FileManager.default.contentsOfDirectory(atPath: directoryURL.path),
          contents.isEmpty else {
      return
    }
    try? FileManager.default.removeItem(at: directoryURL)
  }
}

extension URL {
  fileprivate func appending(path: String) -> URL {
    appendingPathComponent(path.trimmingCharacters(in: CharacterSet(charactersIn: "/")))
  }
}
