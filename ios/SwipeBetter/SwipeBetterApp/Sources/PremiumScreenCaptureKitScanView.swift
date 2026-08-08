#if canImport(ScreenCaptureKit)
import CoreImage
import CoreMedia
import ScreenCaptureKit
import SwiftUI
import Vision

@available(iOS 27.0, *)
struct PremiumScreenCaptureKitScanView: View {
  @Environment(\.dismiss) private var dismiss
  @StateObject private var scanner = ScreenCaptureKitScannerModel()
  @State private var frames: [Data] = []
  @State private var recognizedText = ""
  let onImport: ([Data]) -> Void

  var body: some View {
    List {
      Section {
        VStack(alignment: .leading, spacing: 10) {
          Label("Scan what is on screen", systemImage: "viewfinder")
            .font(.headline.weight(.semibold))
          Text("Tap Start screen scan, choose the dating app in Apple’s system picker, then scroll through the profile manually.")
            .font(.subheadline)
            .foregroundStyle(SBTheme.secondaryInk)
            .fixedSize(horizontal: false, vertical: true)
          Button {
            scanner.start()
          } label: {
            Label(scanner.isCapturing ? "Screen scan active" : "Start screen scan", systemImage: scanner.isCapturing ? "record.circle.fill" : "viewfinder")
              .frame(maxWidth: .infinity, minHeight: 46)
          }
          .buttonStyle(SBPrimaryButtonStyle())
          .disabled(scanner.isCapturing)
          .accessibilityIdentifier("screenScan.startButton")
        }
        .padding(.vertical, 8)

        Text("Apple’s picker appears immediately. There is no separate notification or broadcast menu. SwipeBetter never controls or scrolls the other app.")
          .font(.caption)
          .foregroundStyle(SBTheme.secondaryInk)
          .fixedSize(horizontal: false, vertical: true)
      } header: {
        Text("START A GUIDED SCAN")
      }

      Section {
        HStack(spacing: 12) {
          Circle()
            .fill(scanner.isCapturing ? SBTheme.teal : SBTheme.secondaryInk.opacity(0.35))
            .frame(width: 10, height: 10)
          Text(scanner.isCapturing ? "Capturing visible profile screens" : "Waiting for capture")
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

        if let error = scanner.errorMessage {
          PremiumInlineError(message: error, retry: scanner.start)
        }
      } header: {
        Text("SCAN STATUS")
      }

      Section {
        Button {
          scanner.stop()
          importFrames()
        } label: {
          Label("Use captured screens", systemImage: "checkmark.circle.fill")
        }
        .disabled(frames.isEmpty)
        .frame(minHeight: 44, alignment: .leading)

        Button(role: .destructive) {
          scanner.stop()
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
        Button("Done") {
          scanner.stop()
          dismiss()
        }
      }
    }
    .onAppear {
      refreshFrames()
      scanner.onFrameChange = { refreshFrames() }
    }
    .onDisappear {
      scanner.onFrameChange = nil
    }
  }

  private func refreshFrames() {
    let loaded = SwipeBetterScreenScanStore.loadFrames()
    frames = loaded.map(\.1)
    guard let latest = frames.last else { return }
    Task.detached {
      let text = await Self.recognizeText(in: latest)
      await MainActor.run { recognizedText = text }
    }
  }

  private func importFrames() {
    onImport(Array(frames.prefix(10)))
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

@available(iOS 27.0, *)
private final class ScreenCaptureKitScannerModel: NSObject, ObservableObject, SCContentSharingPickerObserver, SCStreamOutput, SCStreamDelegate {
  @Published var isCapturing = false
  @Published var errorMessage: String?
  var onFrameChange: (() -> Void)?

  private let picker = SCContentSharingPicker.shared
  private let context = CIContext()
  private var stream: SCStream?
  private var lastCapture = Date.distantPast
  private let frameQueue = DispatchQueue(label: "ai.swipebetter.screen-scan", qos: .userInitiated)

  func start() {
    errorMessage = nil
    SwipeBetterScreenScanStore.reset()
    picker.defaultConfiguration = SCContentSharingPickerConfiguration()
    picker.isActive = true
    picker.add(self)
    picker.present()
  }

  func stop() {
    picker.isActive = false
    if let stream {
      stream.stopCapture { _ in }
    }
    stream = nil
    SwipeBetterScreenScanStore.setActive(false)
    DispatchQueue.main.async { self.isCapturing = false }
  }

  func contentSharingPicker(_ picker: SCContentSharingPicker, didUpdateWith filter: SCContentFilter, for stream: SCStream?) {
    frameQueue.async { [weak self] in
      self?.startStream(with: filter)
    }
  }

  func contentSharingPicker(_ picker: SCContentSharingPicker, didCancelFor stream: SCStream?) {
    DispatchQueue.main.async { self.errorMessage = "Screen scan was cancelled before a source was selected." }
  }

  func contentSharingPickerStartDidFailWithError(_ error: Error) {
    DispatchQueue.main.async { self.errorMessage = error.localizedDescription }
  }

  func stream(_ stream: SCStream, didOutputSampleBuffer sampleBuffer: CMSampleBuffer, of type: SCStreamOutputType) {
    guard type == .screen,
          Date().timeIntervalSince(lastCapture) >= 0.8,
          let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
    lastCapture = Date()
    guard let data = context.jpegRepresentation(of: CIImage(cvPixelBuffer: pixelBuffer), colorSpace: CGColorSpaceCreateDeviceRGB(), options: [:]) else { return }
    _ = SwipeBetterScreenScanStore.appendJPEG(data)
    DispatchQueue.main.async { self.onFrameChange?() }
  }

  func stream(_ stream: SCStream, didStopWithError error: Error) {
    DispatchQueue.main.async {
      self.isCapturing = false
      self.errorMessage = error.localizedDescription
    }
    SwipeBetterScreenScanStore.setActive(false)
  }

  private func startStream(with filter: SCContentFilter) {
    let configuration = SCStreamConfiguration()
    configuration.width = 1179
    configuration.height = 2556
    configuration.capturesAudio = false
    let nextStream = SCStream(filter: filter, configuration: configuration, delegate: self)
    do {
      try nextStream.addStreamOutput(self, type: .screen, sampleHandlerQueue: frameQueue)
      stream = nextStream
      SwipeBetterScreenScanStore.setActive(true)
      nextStream.startCapture { [weak self] error in
        DispatchQueue.main.async {
          if let error {
            self?.errorMessage = error.localizedDescription
            self?.isCapturing = false
            SwipeBetterScreenScanStore.setActive(false)
          } else {
            self?.isCapturing = true
          }
        }
      }
    } catch {
      DispatchQueue.main.async { self.errorMessage = error.localizedDescription }
    }
  }
}
#else
import SwiftUI

@available(iOS 17.0, *)
struct PremiumScreenCaptureKitScanView: View {
  let onImport: ([Data]) -> Void

  var body: some View {
    PremiumReplayKitScanView(onImport: onImport)
  }
}
#endif
