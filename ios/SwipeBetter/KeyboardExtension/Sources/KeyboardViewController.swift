import UIKit

final class KeyboardViewController: UIInputViewController {
  private let stack = UIStackView()

  override func viewDidLoad() {
    super.viewDidLoad()
    buildKeyboard()
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

    row.addArrangedSubview(button(title: "Open App", action: #selector(openApp)))
    row.addArrangedSubview(button(title: "Paste Context", action: #selector(pasteSavedContext)))

    let replyRow = UIStackView()
    replyRow.axis = .horizontal
    replyRow.distribution = .fillEqually
    replyRow.spacing = 8
    stack.addArrangedSubview(replyRow)

    replyRow.addArrangedSubview(button(title: "Ask Out", action: #selector(insertAskOutPrompt)))
    replyRow.addArrangedSubview(button(title: "Revive Chat", action: #selector(insertRevivePrompt)))

    NSLayoutConstraint.activate([
      stack.leadingAnchor.constraint(equalTo: view.leadingAnchor),
      stack.trailingAnchor.constraint(equalTo: view.trailingAnchor),
      stack.topAnchor.constraint(equalTo: view.topAnchor),
      stack.bottomAnchor.constraint(lessThanOrEqualTo: view.bottomAnchor),
    ])
  }

  private func button(title: String, action: Selector) -> UIButton {
    var configuration = UIButton.Configuration.filled()
    configuration.title = title
    configuration.cornerStyle = .medium
    configuration.baseBackgroundColor = .systemBlue
    let button = UIButton(configuration: configuration)
    button.addTarget(self, action: action, for: .touchUpInside)
    return button
  }

  @objc private func openApp() {
    guard let url = URL(string: "swipebetter://import") else { return }
    extensionContext?.open(url)
  }

  @objc private func pasteSavedContext() {
    if let payload = SharedImportStore.load(), let text = payload.text, !text.isEmpty {
      textDocumentProxy.insertText(text)
    } else {
      textDocumentProxy.insertText("I want to keep this playful and easy. What would make this week fun for you?")
    }
  }

  @objc private func insertAskOutPrompt() {
    textDocumentProxy.insertText("I like where this is going. Want to grab a drink this week?")
  }

  @objc private func insertRevivePrompt() {
    textDocumentProxy.insertText("I disappeared for a minute, but this conversation deserved a better comeback.")
  }
}

