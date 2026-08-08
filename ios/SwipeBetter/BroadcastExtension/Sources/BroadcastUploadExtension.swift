import CoreImage
import CoreMedia
import ReplayKit

final class BroadcastUploadExtension: RPBroadcastSampleHandler {
  private let context = CIContext()
  private var lastCapture = Date.distantPast

  override func broadcastStarted(withSetupInfo setupInfo: [String : NSObject]?) {
    SwipeBetterScreenScanStore.reset()
    SwipeBetterScreenScanStore.setActive(true)
  }

  override func broadcastFinished() {
    SwipeBetterScreenScanStore.setActive(false)
  }

  override func processSampleBuffer(_ sampleBuffer: CMSampleBuffer, with sampleBufferType: RPSampleBufferType) {
    guard sampleBufferType == .video,
          Date().timeIntervalSince(lastCapture) >= 0.8,
          let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
      return
    }
    lastCapture = Date()

    let image = CIImage(cvPixelBuffer: pixelBuffer)
    guard let data = context.jpegRepresentation(of: image, colorSpace: CGColorSpaceCreateDeviceRGB(), options: [:]) else {
      return
    }
    _ = SwipeBetterScreenScanStore.appendJPEG(data)
  }
}
