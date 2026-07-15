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
      return style == .askOut
        ? "We should settle this properly. Want to grab food this week?"
        : "Okay, strong answer. What's your go-to spot?"
    }

    if text.contains("busy") || text.contains("crazy week") || text.contains("work") {
      return style == .askOut
        ? "Let's make this easy. When your week calms down, want to grab a drink?"
        : "That sounds like a full week. What's been taking up most of your time?"
    }

    if text.contains("cute") || text.contains("handsome") || text.contains("beautiful") || text.contains("pretty") {
      return style == .confident
        ? "I was thinking the same about you."
        : "I'll happily take that. You're making this conversation easy."
    }

    if text.contains("weekend") || text.contains("saturday") || text.contains("sunday") {
      return style == .askOut
        ? "Let's turn that into a plan. Are you free this weekend?"
        : "That sounds like a good weekend. What was the best part?"
    }

    if raw.contains("?") {
      return style == .confident
        ? "Good question. I'll answer, but then I get to ask you one."
        : "I like that question. What's your answer?"
    }

    switch style {
    case .warm:
      return raw.isEmpty
        ? "You seem fun. What's something you're looking forward to this week?"
        : "I like where this conversation is going. Tell me more."
    case .confident:
      return raw.isEmpty
        ? "You caught my attention. What's your story?"
        : "That's a good answer. I have a feeling we'd get along."
    case .askOut:
      return "I like our vibe. Want to grab a drink this week?"
    }
  }
}
