import AppIntents
import SwiftUI

@main
struct SwipeBetterApp: App {
  @State private var model = AppModel()

  var body: some Scene {
    WindowGroup {
      RootView(initialTab: AppTab.screenshotInitialTab(from: ProcessInfo.processInfo.arguments))
        .environment(model)
        .task {
          SwipeBetterAppShortcuts.updateAppShortcutParameters()

          let arguments = ProcessInfo.processInfo.arguments
          if arguments.contains("-SWIPEBETTER_APP_STORE_SCREENSHOTS") {
            model.configureForAppStoreScreenshots()
            if arguments.contains("-SWIPEBETTER_APPLE_DELETE_REAUTH") {
              model.requiresAppleReauthenticationForDeletion = true
            }
            return
          }
          guard !arguments.contains("-SWIPEBETTER_UI_TESTING") else { return }
          await model.bootstrap()
        }
        .onOpenURL { url in
          model.handleDeepLink(url)
        }
    }
  }
}
