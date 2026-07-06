import UIKit

final class KeyboardViewController: UIInputViewController {
  private let stack = UIStackView()
  private var nextKeyboardButton: UIButton?

  override func viewDidLoad() {
    super.viewDidLoad()
    buildKeyboard()
  }

  override func viewWillLayoutSubviews() {
    super.viewWillLayoutSubviews()
    nextKeyboardButton?.isHidden = !needsInputModeSwitchKey
  }

  private func buildKeyboard() {
    view.backgroundColor = .secondarySystemBackground

    stack.axis = .vertical
    stack.spacing = 8
    stack.layoutMargins = UIEdgeInsets(top: 10, left: 10, bottom: 10, right: 10)
    stack.isLayoutMarginsRelativeArrangement = true
    stack.translatesAutoresizingMaskIntoConstraints = false
    view.addSubview(stack)

    let title = UILabel()
    title.text = "SwipeBetter"
    title.font = .preferredFont(forTextStyle: .headline)
    title.textAlignment = .center
    stack.addArrangedSubview(title)

    let row = UIStackView()
    row.axis = .horizontal
    row.distribution = .fillEqually
    row.spacing = 8
    stack.addArrangedSubview(row)

    let nextButton = button(title: "Next Keyboard", systemImage: "globe", action: #selector(switchToNextKeyboard))
    nextButton.accessibilityLabel = "Next keyboard"
    nextKeyboardButton = nextButton
    row.addArrangedSubview(nextButton)
    row.addArrangedSubview(button(title: "Coach Chat", systemImage: "sparkles", action: #selector(openCoach)))

    let replyRow = UIStackView()
    replyRow.axis = .horizontal
    replyRow.distribution = .fillEqually
    replyRow.spacing = 8
    stack.addArrangedSubview(replyRow)

    replyRow.addArrangedSubview(button(title: "Warm Reply", action: #selector(insertWarmReply)))
    replyRow.addArrangedSubview(button(title: "Ask Out", action: #selector(insertAskOutPrompt)))

    let reviveRow = UIStackView()
    reviveRow.axis = .horizontal
    reviveRow.distribution = .fillEqually
    reviveRow.spacing = 8
    stack.addArrangedSubview(reviveRow)

    reviveRow.addArrangedSubview(button(title: "Revive Chat", action: #selector(insertRevivePrompt)))

    NSLayoutConstraint.activate([
      stack.leadingAnchor.constraint(equalTo: view.leadingAnchor),
      stack.trailingAnchor.constraint(equalTo: view.trailingAnchor),
      stack.topAnchor.constraint(equalTo: view.topAnchor),
      stack.bottomAnchor.constraint(lessThanOrEqualTo: view.bottomAnchor),
    ])
  }

  private func button(title: String, systemImage: String? = nil, action: Selector) -> UIButton {
    var configuration = UIButton.Configuration.filled()
    configuration.title = title
    if let systemImage {
      configuration.image = UIImage(systemName: systemImage)
      configuration.imagePadding = 6
    }
    configuration.cornerStyle = .medium
    configuration.baseBackgroundColor = .systemBlue
    let button = UIButton(configuration: configuration)
    button.addTarget(self, action: action, for: .touchUpInside)
    return button
  }

  @objc private func switchToNextKeyboard() {
    advanceToNextInputMode()
  }

  @objc private func openCoach() {
    guard let url = coachURL() else { return }
    extensionContext?.open(url)
  }

  private func coachURL() -> URL? {
    guard let context = keyboardContext else {
      return URL(string: "swipebetter://replies")
    }

    var components = URLComponents()
    components.scheme = "swipebetter"
    components.host = "replies"
    components.queryItems = [
      URLQueryItem(name: "text", value: context),
    ]
    return components.url
  }

  private var keyboardContext: String? {
    let before = textDocumentProxy.documentContextBeforeInput ?? ""
    let after = textDocumentProxy.documentContextAfterInput ?? ""
    let combined = [before, after]
      .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
      .filter { !$0.isEmpty }
      .joined(separator: "\n")
      .trimmingCharacters(in: .whitespacesAndNewlines)

    guard !combined.isEmpty else { return nil }
    return String(combined.suffix(1200))
  }

  @objc private func insertWarmReply() {
    textDocumentProxy.insertText("I want to keep this playful and easy. What would make this week fun for you?")
  }

  @objc private func insertAskOutPrompt() {
    textDocumentProxy.insertText("I like where this is going. Want to grab a drink this week?")
  }

  @objc private func insertRevivePrompt() {
    textDocumentProxy.insertText("I disappeared for a minute, but this conversation deserved a better comeback.")
  }
}
