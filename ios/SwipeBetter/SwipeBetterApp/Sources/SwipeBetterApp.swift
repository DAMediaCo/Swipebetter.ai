import SwiftUI

@main
struct SwipeBetterApp: App {
  @State private var model = AppModel()

  var body: some Scene {
    WindowGroup {
      RootView()
        .environment(model)
        .task {
          await model.bootstrap()
        }
        .onOpenURL { url in
          if url.scheme == "swipebetter" {
            model.loadSharedImport()
          }
        }
    }
  }
}

