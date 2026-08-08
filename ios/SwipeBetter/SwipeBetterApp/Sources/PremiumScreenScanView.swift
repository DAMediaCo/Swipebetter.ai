import ReplayKit
import SwiftUI
import Vision

struct PremiumScreenScanView: View {
  @Environment(\.dismiss) private var dismiss
  @State private var frames: [Data] = []
  @State private var recognizedText = ""
  @State private var isCapturing = false
  @State private var pollTask: Task<Void, Never>?
  let onImport: ([Data]) -> Void

  var body: some View {
    List {
      Section {
        PremiumScreenScanInstructions()
        VStack(alignment: .leading, spacing: 10) {
          Text("1. Tap the capture button")
            .font(.subheadline.weight(.semibold))
          HStack(spacing: 12) {
            BroadcastPickerButton()
              .frame(width: 58, height: 52)
              .background(SBTheme.accent, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
            Text("Choose **SwipeBetter Screen Scan** in Apple's menu.")
              .font(.subheadline)
              .foregroundStyle(SBTheme.secondaryInk)
              .fixedSize(horizontal: false, vertical: true)
          }
          Text("2. Switch to Bumble, Tinder, Hinge, or another dating app")
            .font(.subheadline.weight(.semibold))
          Text("3. Scroll through your profile manually, then return here and tap Use captured screens")
            .font(.subheadline.weight(.semibold))
        }
        .accessibilityIdentifier("screenScan.broadcastPicker")
        Text("There is no separate notification. Apple shows a red recording indicator while the scan is running. SwipeBetter never controls or scrolls the other app.")
          .font(.caption)
          .foregroundStyle(SBTheme.secondaryInk)
          .fixedSize(horizontal: false, vertical: true)
      } header: {
        Text("START A GUIDED SCAN")
      }

      Section {
        HStack(spacing: 12) {
          Circle()
            .fill(isCapturing ? SBTheme.teal : SBTheme.secondaryInk.opacity(0.35))
            .frame(width: 10, height: 10)
          Text(isCapturing ? "Capturing visible profile screens" : "Waiting for capture")
            .font(.subheadline.weight(.semibold))
          Spacer()
          Text("\(frames.count)/12")
            .font(.subheadline.monospacedDigit())
            .foregroundStyle(SBTheme.secondaryInk)
        }
        .frame(minHeight: 44)

        if !recognizedText.isEmpty {
          Text(recognizedText)
            .font(.caption)
            .foregroundStyle(SBTheme.secondaryInk)
            .lineLimit(8)
        }

        Text("Keep the profile visible for a few seconds while you scroll. We collect up to 12 recent frames and process the text on this device before you choose what to send for analysis.")
          .font(.caption)
          .foregroundStyle(SBTheme.secondaryInk)
          .fixedSize(horizontal: false, vertical: true)
      } header: {
        Text("SCAN STATUS")
      }

      Section {
        Button {
          importFrames()
        } label: {
          Label("Use captured screens", systemImage: "checkmark.circle.fill")
        }
        .disabled(frames.isEmpty)
        .frame(minHeight: 44, alignment: .leading)

        Button(role: .destructive) {
          stopPolling()
          SwipeBetterScreenScanStore.reset()
          frames = []
          recognizedText = ""
        } label: {
          Label("Discard scan", systemImage: "trash")
        }
        .frame(minHeight: 44, alignment: .leading)
      } header: {
        Text("REVIEW")
      }
    }
    .scrollContentBackground(.hidden)
    .sbPageBackground()
    .navigationTitle("Scan Profile")
    .navigationBarTitleDisplayMode(.inline)
    .toolbar {
      ToolbarItem(placement: .topBarLeading) {
        Button("Done") { dismiss() }
      }
    }
    .onAppear {
      refreshFrames()
      startPolling()
    }
    .onDisappear { stopPolling() }
  }

  private func startPolling() {
    guard pollTask == nil else { return }
    pollTask = Task {
      while !Task.isCancelled {
        refreshFrames()
        try? await Task.sleep(for: .seconds(1))
      }
    }
  }

  private func stopPolling() {
    pollTask?.cancel()
    pollTask = nil
  }

  private func refreshFrames() {
    let loaded = SwipeBetterScreenScanStore.loadFrames()
    frames = loaded.map(\.1)
    isCapturing = SwipeBetterScreenScanStore.isActive
    guard let latest = frames.last else { return }
    Task.detached {
      let text = await Self.recognizeText(in: latest)
      await MainActor.run { recognizedText = text }
    }
  }

  private func importFrames() {
    stopPolling()
    SwipeBetterScreenScanStore.setActive(false)
    onImport(frames)
    dismiss()
  }

  private static func recognizeText(in data: Data) async -> String {
    guard let image = CIImage(data: data) else { return "" }
    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .fast
    request.usesLanguageCorrection = true
    let handler = VNImageRequestHandler(ciImage: image)
    try? handler.perform([request])
    return (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\n")
  }
}

private struct PremiumScreenScanInstructions: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 10) {
      Label("Scan what is on screen", systemImage: "viewfinder")
        .font(.headline.weight(.semibold))
      Text("No screenshots to take. Start the scan, open the dating app, and scroll through your profile at a normal pace.")
        .font(.subheadline)
        .foregroundStyle(SBTheme.secondaryInk)
        .fixedSize(horizontal: false, vertical: true)
    }
    .padding(.vertical, 8)
  }
}

private struct BroadcastPickerButton: UIViewRepresentable {
  func makeUIView(context: Context) -> RPSystemBroadcastPickerView {
    let view = RPSystemBroadcastPickerView(frame: .zero)
    view.preferredExtension = "app.replit.swipebetter.broadcast"
    view.showsMicrophoneButton = false
    return view
  }

  func updateUIView(_ uiView: RPSystemBroadcastPickerView, context: Context) {}
}
