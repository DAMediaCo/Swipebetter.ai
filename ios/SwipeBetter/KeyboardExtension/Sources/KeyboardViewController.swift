import UIKit

final class KeyboardViewController: UIInputViewController {
  private let backgroundEffectView = UIVisualEffectView(
    effect: UIBlurEffect(style: .systemUltraThinMaterial)
  )
  private let rootStack = UIStackView()
  private let contextLabel = UILabel()
  private let accessLabel = UILabel()
  private var nextKeyboardButton: UIButton?
  private var replyButtons: [KeyboardReplyStyle: UIButton] = [:]
  private var pastedContext: String?
  private var snapPayload: SwipeBetterSnapPayload?
  private var snapRefreshTimer: Timer?
  private var preferredHeightConstraint: NSLayoutConstraint?
  private var replyRowContainer: UIStackView?
  private var utilityRowContainer: UIStackView?
  private var replyControls: [UIView] = []
  private var utilityControls: [UIView] = []
  private var usesAccessibilityControlLayout = false

  private let coral = UIColor { traits in
    _ = traits
    return UIColor(red: 0.82, green: 0.16, blue: 0.212, alpha: 1)
  }
  private let teal = UIColor { traits in
    _ = traits
    return UIColor(red: 0.00, green: 0.48, blue: 0.48, alpha: 1)
  }
  private let askOut = UIColor { traits in
    traits.userInterfaceStyle == .dark
      ? UIColor(red: 0.13, green: 0.37, blue: 0.67, alpha: 1)
      : UIColor(red: 0.12, green: 0.38, blue: 0.78, alpha: 1)
  }
  private let stageFill = UIColor { traits in
    traits.userInterfaceStyle == .dark
      ? UIColor.secondarySystemBackground
      : UIColor.systemBackground
  }
  private let ink = UIColor.label

  override func viewDidLoad() {
    super.viewDidLoad()
    buildKeyboard()
    registerForTraitChanges([UITraitPreferredContentSizeCategory.self]) { (self: Self, _) in
      self.updatePreferredKeyboardHeight()
    }
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
    view.backgroundColor = .clear
    backgroundEffectView.translatesAutoresizingMaskIntoConstraints = false
    view.addSubview(backgroundEffectView)

    rootStack.axis = .vertical
    rootStack.spacing = 10
    rootStack.layoutMargins = UIEdgeInsets(top: 10, left: 12, bottom: 9, right: 12)
    rootStack.isLayoutMarginsRelativeArrangement = true
    rootStack.translatesAutoresizingMaskIntoConstraints = false
    view.addSubview(rootStack)

    rootStack.addArrangedSubview(makeHeader())
    rootStack.addArrangedSubview(makeContextCard())
    rootStack.addArrangedSubview(makeReplyRow())
    rootStack.addArrangedSubview(makeUtilityRow())

    let preferredHeight = view.heightAnchor.constraint(equalToConstant: preferredKeyboardHeight)
    preferredHeight.priority = .defaultHigh
    preferredHeightConstraint = preferredHeight
    NSLayoutConstraint.activate([
      backgroundEffectView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
      backgroundEffectView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
      backgroundEffectView.topAnchor.constraint(equalTo: view.topAnchor),
      backgroundEffectView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
      rootStack.leadingAnchor.constraint(equalTo: view.leadingAnchor),
      rootStack.trailingAnchor.constraint(equalTo: view.trailingAnchor),
      rootStack.topAnchor.constraint(equalTo: view.topAnchor),
      rootStack.bottomAnchor.constraint(equalTo: view.bottomAnchor),
      preferredHeight,
    ])
  }

  private var preferredKeyboardHeight: CGFloat {
    traitCollection.preferredContentSizeCategory.isAccessibilityCategory ? 380 : 310
  }

  private func updatePreferredKeyboardHeight() {
    preferredHeightConstraint?.constant = preferredKeyboardHeight
    updateControlLayoutIfNeeded()
  }

  private func scaledFont(
    size: CGFloat,
    weight: UIFont.Weight,
    textStyle: UIFont.TextStyle = .subheadline
  ) -> UIFont {
    UIFontMetrics(forTextStyle: textStyle).scaledFont(
      for: .systemFont(ofSize: size, weight: weight)
    )
  }

  private func makeHeader() -> UIView {
    let row = UIStackView()
    row.axis = .horizontal
    row.alignment = .center
    row.spacing = 8

    let mark = UILabel()
    mark.text = "S"
    mark.font = .systemFont(ofSize: 14, weight: .bold)
    mark.textColor = .white
    mark.textAlignment = .center
    mark.backgroundColor = coral
    mark.layer.cornerRadius = 12.5
    mark.layer.masksToBounds = true
    mark.widthAnchor.constraint(equalToConstant: 25).isActive = true
    mark.heightAnchor.constraint(equalToConstant: 25).isActive = true

    let title = UILabel()
    title.text = "SwipeBetter"
    title.font = scaledFont(size: 14, weight: .bold, textStyle: .subheadline)
    title.adjustsFontForContentSizeCategory = true
    title.textColor = ink

    let subtitle = UILabel()
    subtitle.text = "REPLY COACH"
    subtitle.font = scaledFont(size: 9, weight: .bold, textStyle: .caption2)
    subtitle.adjustsFontForContentSizeCategory = true
    subtitle.textColor = .secondaryLabel

    let titleStack = UIStackView(arrangedSubviews: [title, subtitle])
    titleStack.axis = .vertical
    titleStack.spacing = 0

    accessLabel.font = scaledFont(size: 11, weight: .medium, textStyle: .caption1)
    accessLabel.adjustsFontForContentSizeCategory = true
    accessLabel.textAlignment = .right

    row.addArrangedSubview(mark)
    row.addArrangedSubview(titleStack)
    row.addArrangedSubview(UIView())
    row.addArrangedSubview(accessLabel)
    return row
  }

  private func makeContextCard() -> UIView {
    let card = UIView()
    card.backgroundColor = stageFill
    card.layer.cornerCurve = .continuous
    card.layer.cornerRadius = 8

    let caption = UILabel()
    caption.text = "CONVERSATION IN VIEW"
    caption.font = scaledFont(size: 11, weight: .semibold, textStyle: .caption1)
    caption.adjustsFontForContentSizeCategory = true
    caption.textColor = .secondaryLabel

    contextLabel.font = scaledFont(size: 13, weight: .regular, textStyle: .body)
    contextLabel.adjustsFontForContentSizeCategory = true
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
      card.heightAnchor.constraint(greaterThanOrEqualToConstant: 76),
    ])
    return card
  }

  private func makeReplyRow() -> UIView {
    let row = UIStackView()
    replyRowContainer = row
    replyControls = []

    for (index, style) in KeyboardReplyStyle.allCases.enumerated() {
      let tint: UIColor
      switch style {
      case .warm:
        tint = coral
      case .confident:
        tint = teal
      case .askOut:
        tint = askOut
      }
      let button = filledButton(
        title: style.title,
        systemImage: style == .askOut ? "calendar.badge.plus" : nil,
        tint: tint
      )
      button.tag = index
      button.accessibilityIdentifier = style.accessibilityIdentifier
      button.addTarget(self, action: #selector(insertSuggestedReply(_:)), for: .touchUpInside)
      replyButtons[style] = button
      replyControls.append(button)
    }
    configureControlRows(row, controls: replyControls)
    return row
  }

  private func makeUtilityRow() -> UIView {
    let row = UIStackView()
    utilityRowContainer = row
    utilityControls = []

    let next = outlineButton(title: "", systemImage: "globe")
    next.accessibilityIdentifier = "keyboard.nextKeyboardButton"
    next.accessibilityLabel = "Next keyboard"
    next.addTarget(self, action: #selector(switchToNextKeyboard), for: .touchUpInside)
    nextKeyboardButton = next

    let paste = outlineButton(title: "Paste chat", systemImage: "doc.on.clipboard")
    paste.accessibilityIdentifier = "keyboard.pasteChatButton"
    paste.addTarget(self, action: #selector(importClipboard), for: .touchUpInside)

    let snapBack = outlineButton(title: "Snap Back", systemImage: "camera.viewfinder")
    snapBack.accessibilityIdentifier = "keyboard.snapBackButton"
    snapBack.addTarget(self, action: #selector(openSnapBack), for: .touchUpInside)

    utilityControls = [next, paste, snapBack]
    configureControlRows(row, controls: utilityControls)
    return row
  }

  private func configureControlRows(_ container: UIStackView, controls: [UIView]) {
    let accessibilityLayout = traitCollection.preferredContentSizeCategory.isAccessibilityCategory
    usesAccessibilityControlLayout = accessibilityLayout

    controls.forEach { $0.removeFromSuperview() }
    container.arrangedSubviews.forEach {
      container.removeArrangedSubview($0)
      $0.removeFromSuperview()
    }

    guard accessibilityLayout else {
      container.axis = .horizontal
      container.distribution = .fillEqually
      container.spacing = 7
      controls.forEach { container.addArrangedSubview($0) }
      return
    }

    container.axis = .vertical
    container.distribution = .fill
    container.spacing = 7

    if controls.count > 2 {
      let firstRow = UIStackView()
      firstRow.axis = .horizontal
      firstRow.distribution = .fillEqually
      firstRow.spacing = 7
      firstRow.addArrangedSubview(controls[0])
      firstRow.addArrangedSubview(controls[1])
      container.addArrangedSubview(firstRow)
      container.addArrangedSubview(controls[2])
    } else {
      controls.forEach { container.addArrangedSubview($0) }
    }
  }

  private func updateControlLayoutIfNeeded() {
    let accessibilityLayout = traitCollection.preferredContentSizeCategory.isAccessibilityCategory
    guard accessibilityLayout != usesAccessibilityControlLayout else { return }
    if let replyRowContainer {
      configureControlRows(replyRowContainer, controls: replyControls)
    }
    if let utilityRowContainer {
      configureControlRows(utilityRowContainer, controls: utilityControls)
    }
  }

  private func filledButton(
    title: String,
    systemImage: String? = nil,
    tint: UIColor
  ) -> UIButton {
    var config = UIButton.Configuration.filled()
    config.title = title
    config.image = systemImage.flatMap(UIImage.init(systemName:))
    config.imagePadding = 5
    config.baseBackgroundColor = tint
    config.baseForegroundColor = .white
    config.cornerStyle = .capsule
    config.contentInsets = NSDirectionalEdgeInsets(top: 12, leading: 9, bottom: 12, trailing: 9)
    let button = UIButton(configuration: config)
    button.titleLabel?.font = scaledFont(size: 13, weight: .semibold, textStyle: .subheadline)
    button.titleLabel?.adjustsFontForContentSizeCategory = true
    button.titleLabel?.numberOfLines = 0
    button.titleLabel?.lineBreakMode = .byWordWrapping
    button.titleLabel?.textAlignment = .center
    button.heightAnchor.constraint(greaterThanOrEqualToConstant: 44).isActive = true
    return button
  }

  private func outlineButton(title: String, systemImage: String) -> UIButton {
    var config = UIButton.Configuration.gray()
    config.title = title.isEmpty ? nil : title
    config.image = UIImage(systemName: systemImage)
    config.imagePadding = 5
    config.baseForegroundColor = ink
    config.cornerStyle = .capsule
    config.contentInsets = NSDirectionalEdgeInsets(top: 11, leading: 8, bottom: 11, trailing: 8)
    let button = UIButton(configuration: config)
    button.titleLabel?.font = scaledFont(size: 13, weight: .regular, textStyle: .subheadline)
    button.titleLabel?.adjustsFontForContentSizeCategory = true
    button.titleLabel?.numberOfLines = 0
    button.titleLabel?.lineBreakMode = .byWordWrapping
    button.titleLabel?.textAlignment = .center
    button.heightAnchor.constraint(greaterThanOrEqualToConstant: 44).isActive = true
    return button
  }

  private func refreshContext() {
    refreshSnapPayload()
    let context = activeContext
    accessLabel.text = hasFullAccess ? "FULL ACCESS" : "PRIVATE"
    accessLabel.textColor = hasFullAccess ? .systemTeal : .secondaryLabel
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
    let generatedReply = snapPayload?.usableReply(at: sender.tag)
    let reply = generatedReply ?? KeyboardReplyComposer.reply(for: activeContext, style: style)
    let before = textDocumentProxy.documentContextBeforeInput ?? ""
    let separator = before.last.map { $0.isWhitespace ? "" : " " } ?? ""
    textDocumentProxy.insertText(separator + reply)
    if generatedReply != nil {
      SwipeBetterSnapStore.clear()
      snapPayload = nil
      refreshContext()
    }
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

  @objc private func openSnapBack() {
    guard hasFullAccess else {
      contextLabel.text = "Turn on Full Access to use Snap Back."
      contextLabel.textColor = coral
      return
    }
    guard let url = URL(string: "swipebetter://snap") else { return }

    try? SwipeBetterSnapStore.save(
      SwipeBetterSnapPayload(
        state: .processing,
        message: "Opening SwipeBetter to read your newest screenshot..."
      )
    )
    refreshContext()

    extensionContext?.open(url) { opened in
      guard !opened else { return }
      try? SwipeBetterSnapStore.save(
        SwipeBetterSnapPayload(
          state: .failed,
          message: "SwipeBetter could not open. Open the app once, then try again."
        )
      )
    }
  }

  private func startSnapRefreshTimer() {
    snapRefreshTimer?.invalidate()
    snapRefreshTimer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
      self?.refreshContext()
    }
  }

  private func refreshSnapPayload() {
    guard hasFullAccess, let payload = SwipeBetterSnapStore.load() else {
      snapPayload = nil
      return
    }
    guard payload.isCurrent(maxAge: 30 * 60) else {
      SwipeBetterSnapStore.clear()
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
