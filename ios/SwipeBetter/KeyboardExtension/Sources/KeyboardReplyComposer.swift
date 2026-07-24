import Foundation

enum KeyboardReplyStyle: CaseIterable {
  case warm
  case confident
  case askOut

  var title: String {
    switch self {
    case .warm: "Warm"
    case .confident: "Confident"
    case .askOut: "Ask out"
    }
  }

  var accessibilityIdentifier: String {
    switch self {
    case .warm: "keyboard.warmReplyButton"
    case .confident: "keyboard.confidentReplyButton"
    case .askOut: "keyboard.askOutReplyButton"
    }
  }
}

enum KeyboardReplyComposer {
  static func reply(for context: String?, style: KeyboardReplyStyle) -> String {
    let raw = context?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
    let text = raw.lowercased()

    if text.contains("taco") || text.contains("pizza") || text.contains("sushi") || text.contains("food") {
      switch style {
      case .warm: return "Now I'm hungry. What's your go-to order?"
      case .confident: return "That's a solid choice. What's your go-to order?"
      case .askOut: return "Want to grab food sometime this week?"
      }
    }

    if text.contains("busy") || text.contains("crazy week") || text.contains("work") {
      switch style {
      case .warm: return "That sounds like a lot. How's the rest of your week looking?"
      case .confident: return "Sounds busy. What have you been working on?"
      case .askOut: return "When things calm down, want to grab a drink?"
      }
    }

    if text.contains("cute") || text.contains("handsome") || text.contains("beautiful") || text.contains("pretty") {
      switch style {
      case .warm: return "That's sweet, thank you."
      case .confident: return "Thanks, I was thinking the same about you."
      case .askOut: return "Thank you. Want to grab a drink this week?"
      }
    }

    if text.contains("weekend") || text.contains("saturday") || text.contains("sunday") {
      switch style {
      case .warm: return "That sounds nice. What was the best part?"
      case .confident: return "Sounds like a good weekend. What was the highlight?"
      case .askOut: return "Are you free sometime this weekend?"
      }
    }

    switch style {
    case .warm:
      return raw.isEmpty
        ? "What are you looking forward to this week?"
        : "Tell me more about that."
    case .confident:
      return raw.isEmpty
        ? "What's something I should know about you?"
        : "That's a good answer. I think we'd get along."
    case .askOut:
      return "Want to grab a drink sometime this week?"
    }
  }
}
