import UIKit

final class KeyboardViewController: UIInputViewController {
  private let backgroundEffectView = UIVisualEffectView(
    effect: UIBlurEffect(style: .systemUltraThinMaterial)
  )
  private let rootStack = UIStackView()
  private let contextLabel = UILabel()
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
  private var accessibilityUtilityWidthConstraints: [NSLayoutConstraint] = []
  private var usesAccessibilityControlLayout = false
  private var reduceTransparencyObserver: NSObjectProtocol?

  private let coral = UIColor { traits in
    traits.userInterfaceStyle == .dark
      ? UIColor(red: 1.0, green: 0.36, blue: 0.40, alpha: 1)
      : UIColor(red: 0.82, green: 0.16, blue: 0.212, alpha: 1)
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
    reduceTransparencyObserver = NotificationCenter.default.addObserver(
      forName: UIAccessibility.reduceTransparencyStatusDidChangeNotification,
      object: nil,
      queue: .main
    ) { [weak self] _ in
      self?.updateBackgroundAppearance()
    }
    registerForTraitChanges([UITraitPreferredContentSizeCategory.self]) { (self: Self, _) in
      self.updatePreferredKeyboardHeight()
    }
    registerForTraitChanges([UITraitUserInterfaceStyle.self]) { (self: Self, _) in
      self.updateBackgroundAppearance()
    }
    refreshContext()
  }

  deinit {
    if let reduceTransparencyObserver {
      NotificationCenter.default.removeObserver(reduceTransparencyObserver)
    }
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
    backgroundEffectView.layer.cornerRadius = 18
    backgroundEffectView.layer.cornerCurve = .continuous
    backgroundEffectView.layer.maskedCorners = [.layerMinXMinYCorner, .layerMaxXMinYCorner]
    backgroundEffectView.clipsToBounds = true
    view.addSubview(backgroundEffectView)
    updateBackgroundAppearance()

    rootStack.axis = .vertical
    rootStack.spacing = 10
    rootStack.layoutMargins = UIEdgeInsets(top: 10, left: 12, bottom: 9, right: 12)
    rootStack.isLayoutMarginsRelativeArrangement = true
    rootStack.translatesAutoresizingMaskIntoConstraints = false
    view.addSubview(rootStack)

    rootStack.addArrangedSubview(makeInsightRow())
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

  private func updateBackgroundAppearance() {
    guard isViewLoaded else { return }
    let darkMode = traitCollection.userInterfaceStyle == .dark
    if UIAccessibility.isReduceTransparencyEnabled {
      backgroundEffectView.effect = nil
      backgroundEffectView.backgroundColor = darkMode
        ? UIColor(red: 0.08, green: 0.08, blue: 0.09, alpha: 1)
        : UIColor.systemBackground
    } else {
      backgroundEffectView.effect = UIBlurEffect(style: darkMode ? .systemMaterialDark : .systemUltraThinMaterial)
      backgroundEffectView.backgroundColor = darkMode ? coral.withAlphaComponent(0.08) : .clear
    }
  }

  private var preferredKeyboardHeight: CGFloat {
    traitCollection.preferredContentSizeCategory.isAccessibilityCategory ? 420 : 352
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

  private func makeInsightRow() -> UIView {
    let row = UIStackView()
    row.axis = .horizontal
    row.alignment = .center
    row.spacing = 8

    let mark = UILabel()
    mark.text = "S"
    mark.font = .systemFont(ofSize: 12, weight: .bold)
    mark.textColor = .white
    mark.textAlignment = .center
    mark.backgroundColor = coral
    mark.layer.cornerRadius = 7
    mark.layer.masksToBounds = true
    mark.widthAnchor.constraint(equalToConstant: 22).isActive = true
    mark.heightAnchor.constraint(equalToConstant: 22).isActive = true

    contextLabel.font = scaledFont(size: 13, weight: .regular, textStyle: .body)
    contextLabel.adjustsFontForContentSizeCategory = true
    contextLabel.textColor = ink
    contextLabel.numberOfLines = 2

    row.addArrangedSubview(mark)
    row.addArrangedSubview(contextLabel)
    row.isLayoutMarginsRelativeArrangement = true
    row.layoutMargins = UIEdgeInsets(top: 4, left: 2, bottom: 4, right: 2)
    return row
  }

  private func makeReplyRow() -> UIView {
    let card = UIView()
    card.backgroundColor = stageFill
    card.layer.cornerCurve = .continuous
    card.layer.cornerRadius = 14
    card.heightAnchor.constraint(greaterThanOrEqualToConstant: 154).isActive = true
    let scrollView = UIScrollView()
    scrollView.alwaysBounceVertical = false
    scrollView.showsVerticalScrollIndicator = true
    scrollView.keyboardDismissMode = .interactive
    scrollView.translatesAutoresizingMaskIntoConstraints = false
    let row = UIStackView()
    replyRowContainer = row
    replyControls = []

    for (index, style) in KeyboardReplyStyle.allCases.enumerated() {
      let button = replyButton(
        title: style.title,
        systemImage: "plus"
      )
      button.tag = index
      button.accessibilityIdentifier = style.accessibilityIdentifier
      button.addTarget(self, action: #selector(insertSuggestedReply(_:)), for: .touchUpInside)
      replyButtons[style] = button
      replyControls.append(button)
    }
    configureControlRows(row, controls: replyControls, forceVertical: true)
    row.translatesAutoresizingMaskIntoConstraints = false
    scrollView.addSubview(row)
    card.addSubview(scrollView)
    NSLayoutConstraint.activate([
      scrollView.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 8),
      scrollView.trailingAnchor.constraint(equalTo: card.trailingAnchor, constant: -8),
      scrollView.topAnchor.constraint(equalTo: card.topAnchor, constant: 4),
      scrollView.bottomAnchor.constraint(equalTo: card.bottomAnchor, constant: -4),
      row.leadingAnchor.constraint(equalTo: scrollView.contentLayoutGuide.leadingAnchor),
      row.trailingAnchor.constraint(equalTo: scrollView.contentLayoutGuide.trailingAnchor),
      row.topAnchor.constraint(equalTo: scrollView.contentLayoutGuide.topAnchor),
      row.bottomAnchor.constraint(equalTo: scrollView.contentLayoutGuide.bottomAnchor),
      row.widthAnchor.constraint(equalTo: scrollView.frameLayoutGuide.widthAnchor),
    ])
    return card
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
    paste.configuration?.baseBackgroundColor = coral
    paste.configuration?.baseForegroundColor = .white
    paste.accessibilityIdentifier = "keyboard.pasteChatButton"
    paste.addTarget(self, action: #selector(importClipboard), for: .touchUpInside)

    let snapBack = outlineButton(title: "Snap Back", systemImage: "camera.viewfinder")
    snapBack.configuration?.baseBackgroundColor = coral.withAlphaComponent(0.14)
    snapBack.configuration?.baseForegroundColor = coral
    snapBack.accessibilityIdentifier = "keyboard.snapBackButton"
    snapBack.addTarget(self, action: #selector(openSnapBack), for: .touchUpInside)

    let delete = outlineButton(title: "", systemImage: "delete.left")
    delete.accessibilityIdentifier = "keyboard.deleteBackwardButton"
    delete.accessibilityLabel = "Delete backward"
    delete.addTarget(self, action: #selector(deleteBackward), for: .touchUpInside)
    utilityControls = [next, paste, snapBack, delete]
    configureControlRows(row, controls: utilityControls)
    return row
  }

  private func configureControlRows(
    _ container: UIStackView,
    controls: [UIView],
    forceVertical: Bool = false
  ) {
    let accessibilityLayout = traitCollection.preferredContentSizeCategory.isAccessibilityCategory
    usesAccessibilityControlLayout = accessibilityLayout
    accessibilityUtilityWidthConstraints.forEach { $0.isActive = false }
    accessibilityUtilityWidthConstraints.removeAll()

    controls.forEach { $0.removeFromSuperview() }
    container.arrangedSubviews.forEach {
      container.removeArrangedSubview($0)
      $0.removeFromSuperview()
    }

    if forceVertical {
      container.axis = .vertical
      container.distribution = .fill
      container.spacing = 0
      for (index, control) in controls.enumerated() {
        container.addArrangedSubview(control)
        if index < controls.count - 1 {
          let divider = UIView()
          divider.backgroundColor = .separator
          divider.heightAnchor.constraint(equalToConstant: 0.5).isActive = true
          container.addArrangedSubview(divider)
        }
      }
      return
    }

    guard accessibilityLayout else {
      container.axis = .horizontal
      container.distribution = .fill
      container.spacing = 7
      controls.forEach { container.addArrangedSubview($0) }
      if controls.count > 3 {
        let leadingWidth = controls[0].widthAnchor.constraint(equalToConstant: 44)
        let trailingWidth = controls[3].widthAnchor.constraint(equalToConstant: 44)
        let middleWidth = controls[1].widthAnchor.constraint(equalTo: controls[2].widthAnchor)
        NSLayoutConstraint.activate([leadingWidth, trailingWidth, middleWidth])
        accessibilityUtilityWidthConstraints = [leadingWidth, trailingWidth, middleWidth]
      }
      return
    }

    container.axis = .vertical
    container.distribution = .fill
    container.spacing = 7

    if controls.count > 3 {
      let row = UIStackView()
      row.axis = .horizontal
      row.distribution = .fill
      row.spacing = 7
      let leadingWidth = controls[0].widthAnchor.constraint(equalToConstant: 44)
      let trailingWidth = controls[3].widthAnchor.constraint(equalToConstant: 44)
      NSLayoutConstraint.activate([leadingWidth, trailingWidth])
      accessibilityUtilityWidthConstraints = [leadingWidth, trailingWidth]
      row.addArrangedSubview(controls[0])
      row.addArrangedSubview(controls[1])
      row.addArrangedSubview(controls[2])
      row.addArrangedSubview(controls[3])
      container.addArrangedSubview(row)
    } else if controls.count > 2 {
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
      configureControlRows(replyRowContainer, controls: replyControls, forceVertical: true)
    }
    if let utilityRowContainer {
      configureControlRows(utilityRowContainer, controls: utilityControls)
    }
  }

  private func replyButton(title: String, systemImage: String) -> UIButton {
    let button = UIButton(type: .custom)
    button.backgroundColor = .clear
    button.accessibilityTraits = [.button]

    let label = UILabel()
    label.tag = 2001
    label.text = title
    label.font = scaledFont(size: 16, weight: .regular, textStyle: .body)
    label.adjustsFontForContentSizeCategory = true
    label.textColor = ink
    label.numberOfLines = 0
    label.lineBreakMode = .byWordWrapping

    let plus = UIImageView(image: UIImage(systemName: systemImage))
    plus.tag = 2002
    plus.tintColor = coral
    plus.contentMode = .scaleAspectFit
    label.translatesAutoresizingMaskIntoConstraints = false
    plus.translatesAutoresizingMaskIntoConstraints = false
    button.addSubview(label)
    button.addSubview(plus)
    NSLayoutConstraint.activate([
      label.leadingAnchor.constraint(equalTo: button.leadingAnchor, constant: 10),
      label.topAnchor.constraint(equalTo: button.topAnchor, constant: 8),
      label.bottomAnchor.constraint(equalTo: button.bottomAnchor, constant: -8),
      label.trailingAnchor.constraint(lessThanOrEqualTo: plus.leadingAnchor, constant: -10),
      plus.trailingAnchor.constraint(equalTo: button.trailingAnchor, constant: -10),
      plus.centerYAnchor.constraint(equalTo: button.centerYAnchor),
      plus.widthAnchor.constraint(equalToConstant: 20),
      plus.heightAnchor.constraint(equalToConstant: 20),
    ])
    button.heightAnchor.constraint(greaterThanOrEqualToConstant: 48).isActive = true
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
    contextLabel.text = contextMessage(fallbackContext: context)
    contextLabel.textColor = context == nil && snapPayload == nil ? .secondaryLabel : ink

    for (index, style) in KeyboardReplyStyle.allCases.enumerated() {
      let snapReply = snapPayload?.usableReply(at: index)
      let reply = snapReply ?? KeyboardReplyComposer.reply(for: context, style: style)
      if let button = replyButtons[style] {
        button.viewWithTag(2001).flatMap { $0 as? UILabel }?.text = reply
        button.accessibilityLabel = reply
        button.accessibilityHint = "Double tap to insert"
      }
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

  @objc private func deleteBackward() {
    textDocumentProxy.deleteBackward()
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
