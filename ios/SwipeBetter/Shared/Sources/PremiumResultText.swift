import Foundation

enum PremiumResultText {
  static func items(from text: String?) -> [String] {
    guard let text else { return [] }
    let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmed.isEmpty else { return [] }

    if let data = trimmed.data(using: .utf8),
       let values = try? JSONDecoder().decode([String].self, from: data) {
      return values
        .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
        .filter { !$0.isEmpty }
    }

    return [trimmed]
  }
}
