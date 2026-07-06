import SwiftUI

@main
struct SwipeBetterApp: App {
  @State private var model = AppModel()

  var body: some Scene {
    WindowGroup {
      RootView()
        .environment(model)
        .task {
          guard !ProcessInfo.processInfo.arguments.contains("-SWIPEBETTER_UI_TESTING") else { return }
          await model.bootstrap()
        }
        .onOpenURL { url in
          model.handleDeepLink(url)
        }
    }
  }
}
