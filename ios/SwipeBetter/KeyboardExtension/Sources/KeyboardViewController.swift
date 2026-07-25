import UIKit

final class KeyboardViewController: UIInputViewController {
  private let rootStack = UIStackView()
  private let contextLabel = UILabel()
  private let accessLabel = UILabel()
  private var nextKeyboardButton: UIButton?
  private var replyButtons: [KeyboardReplyStyle: UIButton] = [:]
  private var pastedContext: String?
  private var snapPayload: SwipeBetterSnapPayload?
  private var snapRefreshTimer: Timer?

  private let coral = UIColor { traits in
    traits.userInterfaceStyle == .dark
      ? UIColor(red: 1.0, green: 0.39, blue: 0.34, alpha: 1)
      : UIColor(red: 0.91, green: 0.27, blue: 0.24, alpha: 1)
  }
  private let ink = UIColor { traits in
    traits.userInterfaceStyle == .dark
      ? UIColor(red: 0.95, green: 0.96, blue: 0.98, alpha: 1)
      : UIColor(red: 0.09, green: 0.10, blue: 0.12, alpha: 1)
  }
  private let canvas = UIColor { traits in
    traits.userInterfaceStyle == .dark
      ? UIColor(red: 0.055, green: 0.059, blue: 0.067, alpha: 1)
      : UIColor(red: 0.95, green: 0.96, blue: 0.97, alpha: 1)
  }
  private let buttonFill = UIColor { traits in
    traits.userInterfaceStyle == .dark
      ? UIColor(red: 0.91, green: 0.27, blue: 0.24, alpha: 1)
      : UIColor(red: 0.09, green: 0.10, blue: 0.12, alpha: 1)
  }

  override func viewDidLoad() {
    super.viewDidLoad()
    buildKeyboard()
    refreshContext()
  }

  override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    refreshContext()
    startSnapRefreshTimer()
  }

  override func viewDidDisappear(_ animated: Bool) {
    super.viewDidDisappear(animated)
    snapRefreshTimer?.invalidate()
    snapRefreshTimer = nil
  }

  override func viewWillLayoutSubviews() {
    super.viewWillLayoutSubviews()
    nextKeyboardButton?.isHidden = !needsInputModeSwitchKey
  }

  override func textDidChange(_ textInput: UITextInput?) {
    super.textDidChange(textInput)
    pastedContext = nil
    refreshContext()
  }

  private func buildKeyboard() {
    view.backgroundColor = canvas

    rootStack.axis = .vertical
    rootStack.spacing = 9
    rootStack.layoutMargins = UIEdgeInsets(top: 10, left: 12, bottom: 10, right: 12)
    rootStack.isLayoutMarginsRelativeArrangement = true
    rootStack.translatesAutoresizingMaskIntoConstraints = false
    view.addSubview(rootStack)

    rootStack.addArrangedSubview(makeHeader())
    rootStack.addArrangedSubview(makeContextCard())
    rootStack.addArrangedSubview(makeReplyRow())
    rootStack.addArrangedSubview(makeUtilityRow())

    let preferredHeight = view.heightAnchor.constraint(equalToConstant: 286)
    preferredHeight.priority = .defaultHigh
    NSLayoutConstraint.activate([
      rootStack.leadingAnchor.constraint(equalTo: view.leadingAnchor),
      rootStack.trailingAnchor.constraint(equalTo: view.trailingAnchor),
      rootStack.topAnchor.constraint(equalTo: view.topAnchor),
      rootStack.bottomAnchor.constraint(equalTo: view.bottomAnchor),
      preferredHeight,
    ])
  }

  private func makeHeader() -> UIView {
    let row = UIStackView()
    row.axis = .horizontal
    row.alignment = .center
    row.spacing = 8

    let mark = UILabel()
    mark.text = "S"
    mark.font = .systemFont(ofSize: 13, weight: .black)
    mark.textColor = .white
    mark.textAlignment = .center
    mark.backgroundColor = coral
    mark.layer.cornerRadius = 5
    mark.layer.masksToBounds = true
    mark.widthAnchor.constraint(equalToConstant: 25).isActive = true
    mark.heightAnchor.constraint(equalToConstant: 25).isActive = true

    let title = UILabel()
    title.text = "SwipeBetter"
    title.font = .systemFont(ofSize: 15, weight: .bold)
    title.textColor = ink

    accessLabel.font = .systemFont(ofSize: 11, weight: .semibold)
    accessLabel.textAlignment = .right

    row.addArrangedSubview(mark)
    row.addArrangedSubview(title)
    row.addArrangedSubview(UIView())
    row.addArrangedSubview(accessLabel)
    return row
  }

  private func makeContextCard() -> UIView {
    let card = UIView()
    card.backgroundColor = .secondarySystemBackground
    card.layer.cornerRadius = 8
    card.layer.borderWidth = 1
    card.layer.borderColor = UIColor.black.withAlphaComponent(0.08).cgColor

    let caption = UILabel()
    caption.text = "CONTEXT NEAR CURSOR"
    caption.font = .systemFont(ofSize: 10, weight: .bold)
    caption.textColor = .secondaryLabel

    contextLabel.font = .systemFont(ofSize: 13, weight: .medium)
    contextLabel.textColor = ink
    contextLabel.numberOfLines = 3

    let stack = UIStackView(arrangedSubviews: [caption, contextLabel])
    stack.axis = .vertical
    stack.spacing = 4
    stack.translatesAutoresizingMaskIntoConstraints = false
    card.addSubview(stack)

    NSLayoutConstraint.activate([
      stack.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 12),
      stack.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -12),
      stack.topAnchor.constraint(equalTo: card.topAnchor, constant: 9),
      stack.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -9),
      card.heightAnchor.constraint(greaterThanOrEqualToConstant: 78),
    ])
    return card
  }

  private func makeReplyRow() -> UIView {
    let row = UIStackView()
    row.axis = .horizontal
    row.distribution = .fillEqually
    row.spacing = 7

    for (index, style) in KeyboardReplyStyle.allCases.enumerated() {
      let button = filledButton(title: style.title, systemImage: style == .askOut ? "calendar.badge.plus" : nil)
      button.tag = index
      button.accessibilityIdentifier = style.accessibilityIdentifier
      button.addTarget(self, action: #selector(insertSuggestedReply(_:)), for: .touchUpInside)
      replyButtons[style] = button
      row.addArrangedSubview(button)
    }
    return row
  }

  private func makeUtilityRow() -> UIView {
    let row = UIStackView()
    row.axis = .horizontal
    row.distribution = .fillEqually
    row.spacing = 7

    let next = outlineButton(title: "", systemImage: "globe")
    next.accessibilityIdentifier = "keyboard.nextKeyboardButton"
    next.accessibilityLabel = "Next keyboard"
    next.addTarget(self, action: #selector(switchToNextKeyboard), for: .touchUpInside)
    nextKeyboardButton = next

    let paste = outlineButton(title: "Paste chat", systemImage: "doc.on.clipboard")
    paste.accessibilityIdentifier = "keyboard.pasteChatButton"
    paste.addTarget(self, action: #selector(importClipboard), for: .touchUpInside)

    let coach = outlineButton(title: "AI Coach", systemImage: "sparkles")
    coach.accessibilityIdentifier = "keyboard.coachChatButton"
    coach.addTarget(self, action: #selector(openCoach), for: .touchUpInside)

    row.addArrangedSubview(next)
    row.addArrangedSubview(paste)
    row.addArrangedSubview(coach)
    return row
  }

  private func filledButton(title: String, systemImage: String? = nil) -> UIButton {
    var config = UIButton.Configuration.filled()
    config.title = title
    config.image = systemImage.flatMap(UIImage.init(systemName:))
    config.imagePadding = 5
    config.baseBackgroundColor = buttonFill
    config.baseForegroundColor = .white
    config.cornerStyle = .medium
    config.contentInsets = NSDirectionalEdgeInsets(top: 11, leading: 9, bottom: 11, trailing: 9)
    let button = UIButton(configuration: config)
    button.titleLabel?.font = .systemFont(ofSize: 13, weight: .semibold)
    return button
  }

  private func outlineButton(title: String, systemImage: String) -> UIButton {
    var config = UIButton.Configuration.gray()
    config.title = title.isEmpty ? nil : title
    config.image = UIImage(systemName: systemImage)
    config.imagePadding = 5
    config.baseForegroundColor = ink
    config.cornerStyle = .medium
    config.contentInsets = NSDirectionalEdgeInsets(top: 10, leading: 8, bottom: 10, trailing: 8)
    return UIButton(configuration: config)
  }

  private func refreshContext() {
    refreshSnapPayload()
    let context = activeContext
    accessLabel.text = hasFullAccess ? "Full Access on" : "Local mode"
    accessLabel.textColor = hasFullAccess ? .systemGreen : .secondaryLabel
    contextLabel.text = contextMessage(fallbackContext: context)
    contextLabel.textColor = context == nil && snapPayload == nil ? .secondaryLabel : ink

    for (index, style) in KeyboardReplyStyle.allCases.enumerated() {
      let snapReply = snapPayload?.usableReply(at: index)
      replyButtons[style]?.accessibilityValue = snapReply ?? KeyboardReplyComposer.reply(for: context, style: style)
      replyButtons[style]?.configuration?.title = snapReply == nil ? style.title : "Reply \(index + 1)"
    }
  }

  private var activeContext: String? {
    if let pastedContext, !pastedContext.isEmpty { return pastedContext }
    let before = textDocumentProxy.documentContextBeforeInput ?? ""
    let after = textDocumentProxy.documentContextAfterInput ?? ""
    let combined = [before, after]
      .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
      .filter { !$0.isEmpty }
      .joined(separator: "\n")
      .trimmingCharacters(in: .whitespacesAndNewlines)
    return combined.isEmpty ? nil : String(combined.suffix(1600))
  }

  @objc private func switchToNextKeyboard() {
    advanceToNextInputMode()
  }

  @objc private func insertSuggestedReply(_ sender: UIButton) {
    guard KeyboardReplyStyle.allCases.indices.contains(sender.tag) else { return }
    let style = KeyboardReplyStyle.allCases[sender.tag]
    let reply = snapPayload?.usableReply(at: sender.tag) ?? KeyboardReplyComposer.reply(for: activeContext, style: style)
    let before = textDocumentProxy.documentContextBeforeInput ?? ""
    let separator = before.last.map { $0.isWhitespace ? "" : " " } ?? ""
    textDocumentProxy.insertText(separator + reply)
  }

  @objc private func importClipboard() {
    guard hasFullAccess else {
      contextLabel.text = "Turn on Full Access in Settings to paste a chat."
      contextLabel.textColor = coral
      return
    }
    guard let text = UIPasteboard.general.string?.trimmingCharacters(in: .whitespacesAndNewlines), !text.isEmpty else {
      contextLabel.text = "The clipboard does not contain text."
      contextLabel.textColor = coral
      return
    }
    pastedContext = String(text.suffix(3000))
    refreshContext()
  }

  @objc private func openCoach() {
    guard let url = coachURL() else { return }
    extensionContext?.open(url)
  }

  private func coachURL() -> URL? {
    var components = URLComponents()
    components.scheme = "swipebetter"
    components.host = "replies"
    if let context = activeContext {
      components.queryItems = [URLQueryItem(name: "text", value: context)]
    }
    return components.url
  }

  private func startSnapRefreshTimer() {
    snapRefreshTimer?.invalidate()
    snapRefreshTimer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
      self?.refreshContext()
    }
  }

  private func refreshSnapPayload() {
    guard hasFullAccess,
          let payload = SwipeBetterSnapStore.load(),
          payload.isCurrent(maxAge: 30 * 60) else {
      snapPayload = nil
      return
    }
    snapPayload = payload
  }

  private func contextMessage(fallbackContext: String?) -> String {
    guard let snapPayload else {
      return fallbackContext ?? "No readable text here yet. Paste the chat or start typing."
    }

    switch snapPayload.state {
    case .processing:
      return "SwipeBetter Snap is creating replies..."
    case .ready:
      return snapPayload.conversationContext?.trimmedKeyboardContext
        ?? "SwipeBetter Snap is ready. Tap Reply 1, 2, or 3."
    case .failed:
      return snapPayload.message ?? "SwipeBetter Snap could not create replies."
    }
  }
}

private extension String {
  var trimmedKeyboardContext: String? {
    let clean = trimmingCharacters(in: .whitespacesAndNewlines)
    return clean.isEmpty ? nil : String(clean.prefix(220))
  }
}
