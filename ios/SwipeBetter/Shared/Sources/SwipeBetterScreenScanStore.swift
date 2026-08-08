import Foundation

public struct SwipeBetterScreenScanFrame: Codable, Equatable, Identifiable {
  public let id: String
  public let filename: String
  public let capturedAt: Date

  public init(id: String = UUID().uuidString, filename: String, capturedAt: Date = Date()) {
    self.id = id
    self.filename = filename
    self.capturedAt = capturedAt
  }
}

public enum SwipeBetterScreenScanStore {
  public static let directoryName = "ScreenScan"
  private static let framesKey = "screenScanFrames"
  private static let activeKey = "screenScanActive"
  private static let maxFrames = 12

  private static var defaults: UserDefaults? {
    UserDefaults(suiteName: SwipeBetterConfig.appGroupId)
  }

  private static var directoryURL: URL? {
    FileManager.default
      .containerURL(forSecurityApplicationGroupIdentifier: SwipeBetterConfig.appGroupId)?
      .appendingPathComponent(directoryName, isDirectory: true)
  }

  public static var isActive: Bool {
    defaults?.bool(forKey: activeKey) == true
  }

  public static func setActive(_ active: Bool) {
    defaults?.set(active, forKey: activeKey)
    defaults?.synchronize()
  }

  public static func reset() {
    defaults?.removeObject(forKey: framesKey)
    setActive(false)
    if let directoryURL {
      try? FileManager.default.removeItem(at: directoryURL)
    }
  }

  @discardableResult
  public static func appendJPEG(_ data: Data) -> SwipeBetterScreenScanFrame? {
    guard let directoryURL else { return nil }
    do {
      try FileManager.default.createDirectory(at: directoryURL, withIntermediateDirectories: true)
      let frame = SwipeBetterScreenScanFrame(filename: "\(UUID().uuidString).jpg")
      try data.write(to: directoryURL.appendingPathComponent(frame.filename), options: [.atomic, .completeFileProtection])
      var frames = loadMetadata()
      frames.append(frame)
      if frames.count > maxFrames {
        let expired = frames.prefix(frames.count - maxFrames)
        for old in expired {
          try? FileManager.default.removeItem(at: directoryURL.appendingPathComponent(old.filename))
        }
        frames = Array(frames.suffix(maxFrames))
      }
      defaults?.set(try JSONEncoder().encode(frames), forKey: framesKey)
      defaults?.synchronize()
      return frame
    } catch {
      return nil
    }
  }

  public static func loadFrames() -> [(SwipeBetterScreenScanFrame, Data)] {
    guard let directoryURL else { return [] }
    return loadMetadata().compactMap { frame in
      guard let data = try? Data(contentsOf: directoryURL.appendingPathComponent(frame.filename)) else { return nil }
      return (frame, data)
    }
  }

  private static func loadMetadata() -> [SwipeBetterScreenScanFrame] {
    guard let data = defaults?.data(forKey: framesKey),
          let frames = try? JSONDecoder().decode([SwipeBetterScreenScanFrame].self, from: data) else {
      return []
    }
    return frames
  }
}
