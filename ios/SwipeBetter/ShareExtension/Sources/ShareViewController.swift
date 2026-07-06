import UIKit
import UniformTypeIdentifiers

final class ShareViewController: UIViewController {
  private let statusLabel = UILabel()

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = .systemBackground
    configureStatus()

    Task {
      await importSharedItems()
    }
  }

  private func configureStatus() {
    statusLabel.text = "Sending to SwipeBetter..."
    statusLabel.font = .preferredFont(forTextStyle: .headline)
    statusLabel.textAlignment = .center
    statusLabel.translatesAutoresizingMaskIntoConstraints = false
    view.addSubview(statusLabel)

    NSLayoutConstraint.activate([
      statusLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
      statusLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24),
      statusLabel.centerYAnchor.constraint(equalTo: view.centerYAnchor),
    ])
  }

  private func importSharedItems() async {
    let providers = extensionContext?.inputItems
      .compactMap { $0 as? NSExtensionItem }
      .flatMap { $0.attachments ?? [] } ?? []

    var textParts: [String] = []
    var images: [Data] = []

    for provider in providers {
      if provider.hasItemConformingToTypeIdentifier(UTType.image.identifier),
         let image = await loadImageData(from: provider) {
        images.append(image)
      }

      if provider.hasItemConformingToTypeIdentifier(UTType.plainText.identifier),
         let text = await loadText(from: provider) {
        textParts.append(text)
      }
    }

    do {
      _ = try SharedImportStore.save(
        text: textParts.joined(separator: "\n\n").trimmedNil,
        images: Array(images.prefix(10))
      )
      statusLabel.text = "Opening SwipeBetter..."
      openHostApp()
    } catch {
      statusLabel.text = "Could not import this item."
      completeAfterDelay()
    }
  }

  private func loadImageData(from provider: NSItemProvider) async -> Data? {
    await withCheckedContinuation { continuation in
      provider.loadItem(forTypeIdentifier: UTType.image.identifier, options: nil) { item, _ in
        if let data = item as? Data {
          continuation.resume(returning: data)
        } else if let url = item as? URL, let data = try? Data(contentsOf: url) {
          continuation.resume(returning: data)
        } else if let image = item as? UIImage {
          continuation.resume(returning: image.jpegData(compressionQuality: 0.85))
        } else {
          continuation.resume(returning: nil)
        }
      }
    }
  }

  private func loadText(from provider: NSItemProvider) async -> String? {
    await withCheckedContinuation { continuation in
      provider.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { item, _ in
        if let text = item as? String {
          continuation.resume(returning: text)
        } else if let data = item as? Data, let text = String(data: data, encoding: .utf8) {
          continuation.resume(returning: text)
        } else {
          continuation.resume(returning: nil)
        }
      }
    }
  }

  private func openHostApp() {
    guard let url = URL(string: "swipebetter://import") else {
      completeAfterDelay()
      return
    }
    extensionContext?.open(url) { [weak self] _ in
      self?.extensionContext?.completeRequest(returningItems: nil)
    }
  }

  private func completeAfterDelay() {
    DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) { [weak self] in
      self?.extensionContext?.completeRequest(returningItems: nil)
    }
  }
}

private extension String {
  var trimmedNil: String? {
    let trimmed = trimmingCharacters(in: .whitespacesAndNewlines)
    return trimmed.isEmpty ? nil : trimmed
  }
}

