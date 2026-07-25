import StoreKit
import SwiftUI
import UIKit

struct PremiumHistoryView: View {
  @Environment(AppModel.self) private var model

  var body: some View {
    ScrollView {
      LazyVStack(spacing: 16) {
        SBPageHeader(
          eyebrow: "YOUR PLAYBOOK",
          title: "What worked before",
          detail: "Revisit profile advice and reply sessions without starting over."
        )

        historySection(
          title: "Profile audits",
          detail: "Saved profile scores and highest-priority fixes",
          isEmpty: model.profileHistory.isEmpty,
          emptyTitle: "No profile audits yet",
          emptyDetail: "Run your first audit and the result will be saved here.",
          emptyImage: "person.crop.rectangle"
        ) {
          ForEach(model.profileHistory, id: \.stableId) { item in
            PremiumHistoryRow(
              eyebrow: item.platform ?? "Profile",
              title: item.firstTip ?? item.improvements ?? "Profile audit saved",
              trailing: item.overallScore.map(String.init),
              systemImage: "person.crop.rectangle.stack"
            )
          }
        }

        historySection(
          title: "Reply sessions",
          detail: "Conversation context and the tone you chose",
          isEmpty: model.replyHistory.isEmpty,
          emptyTitle: "No reply sessions yet",
          emptyDetail: "Generate replies and the session will appear here.",
          emptyImage: "message"
        ) {
          ForEach(model.replyHistory, id: \.stableId) { item in
            PremiumHistoryRow(
              eyebrow: item.tone?.capitalized ?? "Reply coaching",
              title: item.conversationContext ?? item.suggestedReplies?.first ?? "Reply session saved",
              trailing: nil,
              systemImage: "message.badge.waveform"
            )
          }
        }
      }
      .padding(.bottom, 28)
    }
    .refreshable { await model.refreshHistory() }
    .task {
      guard !SwipeBetterScreenshotFixtures.isEnabled else { return }
      await model.refreshHistory()
    }
    .sbPageBackground()
    .navigationBarHidden(true)
    .accessibilityIdentifier("history.list")
  }

  @ViewBuilder
  private func historySection<Content: View>(
    title: String,
    detail: String,
    isEmpty: Bool,
    emptyTitle: String,
    emptyDetail: String,
    emptyImage: String,
    @ViewBuilder content: () -> Content
  ) -> some View {
    VStack(spacing: 10) {
      SBSectionHeader(title: title, detail: detail)

      SBSurface {
        if isEmpty {
          SBEmptyState(title: emptyTitle, detail: emptyDetail, systemImage: emptyImage)
        } else {
          VStack(spacing: 0) {
            content()
          }
        }
      }
    }
    .padding(.horizontal, 20)
  }
}

struct PremiumHistoryRow: View {
  let eyebrow: String
  let title: String
  let trailing: String?
  let systemImage: String

  var body: some View {
    HStack(alignment: .top, spacing: 12) {
      Image(systemName: systemImage)
        .font(.system(size: 16, weight: .semibold))
        .foregroundStyle(SBTheme.accent)
        .frame(width: 36, height: 36)
        .background(SBTheme.accentSoft)
        .clipShape(RoundedRectangle(cornerRadius: 7, style: .continuous))

      VStack(alignment: .leading, spacing: 4) {
        Text(eyebrow)
          .font(.caption.weight(.bold))
          .foregroundStyle(SBTheme.accent)

        Text(title)
          .font(.subheadline)
          .foregroundStyle(SBTheme.ink)
          .lineLimit(3)
      }

      Spacer(minLength: 8)

      if let trailing {
        Text(trailing)
          .font(.system(.title3, design: .rounded, weight: .bold))
          .foregroundStyle(SBTheme.teal)
      }
    }
    .padding(.vertical, 12)
    .overlay(alignment: .bottom) {
      SBDivider()
    }
  }
}

struct PremiumAccountView: View {
  @Environment(AppModel.self) private var model
  @State private var showingDeleteConfirmation = false
  @State private var showingKeyboardGuide = false
  @State private var showingSnapGuide = false

  var body: some View {
    ScrollView {
      LazyVStack(spacing: 16) {
        SBPageHeader(
          eyebrow: "ACCOUNT",
          title: greeting,
          detail: "Manage access, Apple billing, keyboard setup, and account privacy."
        )

        accountSummary
        keyboardSection
        plansSection
        billingSection
        helpSection
        destructiveSection
      }
      .padding(.horizontal, 20)
      .padding(.bottom, 30)
    }
    .refreshable {
      await model.refreshAccount()
      await model.purchases.loadProducts()
    }
    .sbPageBackground()
    .navigationBarHidden(true)
    .sheet(isPresented: $showingKeyboardGuide) {
      PremiumKeyboardGuide()
        .presentationDetents([.large])
        .presentationDragIndicator(.visible)
    }
    .sheet(isPresented: $showingSnapGuide) {
      PremiumSnapSetupGuide()
        .presentationDetents([.large])
        .presentationDragIndicator(.visible)
    }
    .confirmationDialog(
      "Delete your SwipeBetter account?",
      isPresented: $showingDeleteConfirmation,
      titleVisibility: .visible
    ) {
      Button("Delete Account", role: .destructive) {
        Task { await model.deleteAccount() }
      }
      Button("Cancel", role: .cancel) {}
    } message: {
      Text("This cannot be undone. Apple subscriptions must be managed through Apple billing.")
    }
  }

  private var greeting: String {
    if let firstName = model.user?.firstName, !firstName.isEmpty {
      return "Good to see you, \(firstName)"
    }
    return "Your SwipeBetter account"
  }

  private var accountSummary: some View {
    SBSurface {
      VStack(spacing: 14) {
        HStack(alignment: .center, spacing: 12) {
          Text(initials)
            .font(.system(.headline, design: .rounded, weight: .bold))
            .foregroundStyle(.white)
            .frame(width: 48, height: 48)
            .background(SBTheme.strongFill)
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))

          VStack(alignment: .leading, spacing: 3) {
            Text(model.user?.email ?? model.user?.displayName ?? "SwipeBetter member")
              .font(.subheadline.weight(.semibold))
              .foregroundStyle(SBTheme.ink)
              .lineLimit(1)

            Text("Signed in securely")
              .font(.caption)
              .foregroundStyle(SBTheme.secondaryInk)
          }

          Spacer()
        }

        SBDivider()

        HStack(spacing: 12) {
          summaryMetric(
            label: "Plan",
            value: model.credits?.planTier?.capitalized ?? model.me?.planType?.capitalized ?? "Free",
            color: SBTheme.teal
          )
          summaryMetric(
            label: "Credits",
            value: "\(model.credits?.credits ?? model.me?.oneTimeCredits ?? 0)",
            color: SBTheme.accent
          )
        }
      }
    }
  }

  private var plansSection: some View {
    VStack(spacing: 10) {
      SBSectionHeader(
        title: "Choose your access",
        detail: "App Store pricing includes Apple purchase fees."
      )

      if model.purchases.products.isEmpty {
        SBSurface {
          if model.purchases.isLoadingProducts {
            PremiumLoadingRows()
          } else {
            VStack(alignment: .leading, spacing: 12) {
              Label("Plans are temporarily unavailable", systemImage: "wifi.exclamationmark")
                .font(.headline)
                .foregroundStyle(SBTheme.ink)

              Text("Check your connection, then reload the App Store products.")
                .font(.subheadline)
                .foregroundStyle(SBTheme.secondaryInk)

              Button {
                Task { await model.purchases.loadProducts() }
              } label: {
                Label("Reload plans", systemImage: "arrow.clockwise")
              }
              .buttonStyle(SBSecondaryButtonStyle())
            }
          }
        }
      } else {
        VStack(spacing: 10) {
          ForEach(model.purchases.products, id: \.id) { product in
            PremiumProductRow(
              product: product,
              isPurchasing: model.purchases.purchasingProductId == product.id,
              isRecommended: product.id == SwipeBetterConfig.monthlyProductId
            ) {
              Task { await model.purchase(product) }
            }
            .disabled(model.isBusy || model.purchases.purchasingProductId != nil)
            .accessibilityIdentifier("account.purchaseButton.\(product.id)")
          }
        }
      }

      Text("Purchases are billed by Apple. Stripe checkout is not shown in the iOS app.")
        .font(.caption)
        .foregroundStyle(SBTheme.secondaryInk)
        .frame(maxWidth: .infinity, alignment: .leading)
    }
  }

  private var keyboardSection: some View {
    VStack(spacing: 10) {
      SBSectionHeader(
        title: "Keyboard & sharing",
        detail: "Bring chat context into SwipeBetter without retyping it."
      )

      SBSurface {
        VStack(alignment: .leading, spacing: 12) {
          HStack(alignment: .top, spacing: 12) {
            Image(systemName: "hand.tap")
              .font(.system(size: 18, weight: .semibold))
              .foregroundStyle(SBTheme.teal)
              .frame(width: 40, height: 40)
              .background(SBTheme.tealSoft)
              .clipShape(RoundedRectangle(cornerRadius: 7, style: .continuous))

            VStack(alignment: .leading, spacing: 4) {
              Text("SwipeBetter Snap")
                .font(.headline)
                .foregroundStyle(SBTheme.ink)
              Text("Double-tap your phone to turn any visible chat into three replies without copying text.")
                .font(.caption)
                .foregroundStyle(SBTheme.secondaryInk)
                .fixedSize(horizontal: false, vertical: true)
            }
          }

          Button {
            showingSnapGuide = true
          } label: {
            Label("Set up SwipeBetter Snap", systemImage: "wand.and.stars")
          }
          .buttonStyle(SBPrimaryButtonStyle())
          .accessibilityIdentifier("account.setupSnapButton")

          SBDivider()

          HStack(alignment: .top, spacing: 12) {
            Image(systemName: "keyboard")
              .font(.system(size: 18, weight: .semibold))
              .foregroundStyle(SBTheme.accent)
              .frame(width: 40, height: 40)
              .background(SBTheme.accentSoft)
              .clipShape(RoundedRectangle(cornerRadius: 7, style: .continuous))

            VStack(alignment: .leading, spacing: 4) {
              Text("SwipeBetter Keyboard")
                .font(.headline)
                .foregroundStyle(SBTheme.ink)
              Text("Reads text available around the active cursor. For full conversations, share a screenshot into SwipeBetter.")
                .font(.caption)
                .foregroundStyle(SBTheme.secondaryInk)
                .fixedSize(horizontal: false, vertical: true)
            }
          }

          Button {
            showingKeyboardGuide = true
          } label: {
            Label("Keyboard setup & privacy", systemImage: "slider.horizontal.3")
          }
          .buttonStyle(SBSecondaryButtonStyle())
        }
      }
    }
  }

  private var billingSection: some View {
    VStack(spacing: 10) {
      SBSectionHeader(title: "Apple billing", detail: "Restore or manage subscriptions through Apple.")

      SBSurface {
        VStack(spacing: 0) {
          PremiumActionRow(
            title: "Restore purchases",
            detail: "Sync active App Store access",
            systemImage: "arrow.clockwise.circle",
            isLoading: model.purchases.isRestoringPurchases
          ) {
            Task { await model.restorePurchases() }
          }
          .disabled(model.isBusy || model.purchases.isRestoringPurchases)
          .accessibilityIdentifier("account.restorePurchasesButton")

          SBDivider()

          PremiumActionRow(
            title: "Manage subscription",
            detail: "Open Apple subscription settings",
            systemImage: "creditcard"
          ) {
            Task { await model.manageSubscriptions() }
          }
          .accessibilityIdentifier("account.manageSubscriptionButton")
        }
      }

      if let message = model.purchases.lastPurchaseMessage {
        Label(message, systemImage: "checkmark.circle.fill")
          .font(.subheadline.weight(.medium))
          .foregroundStyle(SBTheme.teal)
          .padding(12)
          .frame(maxWidth: .infinity, alignment: .leading)
          .background(SBTheme.tealSoft)
          .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
      }
    }
  }

  private var helpSection: some View {
    VStack(spacing: 10) {
      SBSectionHeader(title: "Help & policies")

      SBSurface {
        VStack(spacing: 0) {
          PremiumLinkRow(title: "Contact support", systemImage: "questionmark.circle", url: accountURL("/contact"))
          SBDivider()
          PremiumLinkRow(title: "Terms of service", systemImage: "doc.text", url: accountURL("/terms"))
          SBDivider()
          PremiumLinkRow(title: "Privacy policy", systemImage: "hand.raised", url: accountURL("/privacy"))
          SBDivider()
          PremiumLinkRow(title: "Refund policy", systemImage: "arrow.uturn.backward.circle", url: accountURL("/refund-policy"))
        }
      }
    }
  }

  private var destructiveSection: some View {
    VStack(spacing: 10) {
      Button {
        Task { await model.logout() }
      } label: {
        Label("Log out", systemImage: "rectangle.portrait.and.arrow.right")
      }
      .buttonStyle(SBSecondaryButtonStyle())
      .accessibilityIdentifier("account.logoutButton")

      Button(role: .destructive) {
        showingDeleteConfirmation = true
      } label: {
        Label("Delete account", systemImage: "trash")
          .font(.subheadline.weight(.semibold))
          .foregroundStyle(SBTheme.accentPressed)
          .frame(maxWidth: .infinity, minHeight: 44)
      }
      .accessibilityIdentifier("account.deleteAccountButton")
    }
  }

  private var initials: String {
    let first = model.user?.firstName?.first.map(String.init) ?? "S"
    let last = model.user?.lastName?.first.map(String.init) ?? "B"
    return first + last
  }

  private func summaryMetric(label: String, value: String, color: Color) -> some View {
    VStack(alignment: .leading, spacing: 4) {
      Text(label)
        .font(.caption)
        .foregroundStyle(SBTheme.secondaryInk)
      Text(value)
        .font(.system(.title3, design: .rounded, weight: .bold))
        .foregroundStyle(color)
        .lineLimit(1)
        .minimumScaleFactor(0.8)
    }
    .padding(12)
    .frame(maxWidth: .infinity, alignment: .leading)
    .background(SBTheme.canvas)
    .clipShape(RoundedRectangle(cornerRadius: 7, style: .continuous))
  }

  private func accountURL(_ path: String) -> URL {
    URL(string: "https://swipebetter.ai\(path)")!
  }
}

struct PremiumProductRow: View {
  let product: Product
  let isPurchasing: Bool
  let isRecommended: Bool
  let action: () -> Void

  var body: some View {
    Button(action: action) {
      HStack(alignment: .center, spacing: 12) {
        VStack(alignment: .leading, spacing: 5) {
          HStack(spacing: 7) {
            Text(displayName)
              .font(.headline)
              .foregroundStyle(SBTheme.ink)

            if isRecommended {
              Text("Most flexible")
                .font(.caption2.weight(.bold))
                .foregroundStyle(SBTheme.teal)
                .padding(.horizontal, 6)
                .padding(.vertical, 3)
                .background(SBTheme.tealSoft)
                .clipShape(RoundedRectangle(cornerRadius: 4, style: .continuous))
            }
          }

          Text(product.description)
            .font(.caption)
            .foregroundStyle(SBTheme.secondaryInk)
            .multilineTextAlignment(.leading)
        }

        Spacer(minLength: 8)

        if isPurchasing {
          ProgressView()
            .tint(SBTheme.accent)
        } else {
          VStack(alignment: .trailing, spacing: 3) {
            Text(product.displayPrice)
              .font(.system(.headline, design: .rounded, weight: .bold))
              .foregroundStyle(SBTheme.accent)
            Image(systemName: "arrow.right")
              .font(.caption.weight(.bold))
              .foregroundStyle(SBTheme.secondaryInk)
          }
        }
      }
      .padding(16)
      .frame(maxWidth: .infinity, alignment: .leading)
      .background(isRecommended ? SBTheme.tealSoft.opacity(0.52) : SBTheme.surface)
      .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
      .overlay {
        RoundedRectangle(cornerRadius: 8, style: .continuous)
          .stroke(isRecommended ? SBTheme.teal.opacity(0.45) : SBTheme.divider, lineWidth: 1)
      }
    }
    .buttonStyle(.plain)
  }

  private var displayName: String {
    switch product.id {
    case SwipeBetterConfig.starterProductId: return "Starter Pack"
    case SwipeBetterConfig.monthlyProductId: return "Unlimited Monthly"
    case SwipeBetterConfig.annualProductId: return "Unlimited Annual"
    default: return product.displayName
    }
  }
}

struct PremiumActionRow: View {
  let title: String
  let detail: String
  let systemImage: String
  var isLoading = false
  let action: () -> Void

  var body: some View {
    Button(action: action) {
      HStack(spacing: 12) {
        Image(systemName: systemImage)
          .font(.system(size: 16, weight: .semibold))
          .foregroundStyle(SBTheme.accent)
          .frame(width: 36, height: 36)
          .background(SBTheme.accentSoft)
          .clipShape(RoundedRectangle(cornerRadius: 7, style: .continuous))

        VStack(alignment: .leading, spacing: 3) {
          Text(title)
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(SBTheme.ink)
          Text(detail)
            .font(.caption)
            .foregroundStyle(SBTheme.secondaryInk)
        }

        Spacer()

        if isLoading {
          ProgressView().tint(SBTheme.accent)
        } else {
          Image(systemName: "chevron.right")
            .font(.caption.weight(.bold))
            .foregroundStyle(SBTheme.secondaryInk)
        }
      }
      .padding(.vertical, 12)
    }
    .buttonStyle(.plain)
  }
}

struct PremiumLinkRow: View {
  let title: String
  let systemImage: String
  let url: URL

  var body: some View {
    Link(destination: url) {
      HStack(spacing: 12) {
        Image(systemName: systemImage)
          .font(.system(size: 15, weight: .semibold))
          .foregroundStyle(SBTheme.secondaryInk)
          .frame(width: 28)
        Text(title)
          .font(.subheadline.weight(.medium))
          .foregroundStyle(SBTheme.ink)
        Spacer()
        Image(systemName: "arrow.up.right")
          .font(.caption.weight(.bold))
          .foregroundStyle(SBTheme.secondaryInk)
      }
      .padding(.vertical, 12)
    }
  }
}

struct PremiumLoadingRows: View {
  var body: some View {
    VStack(spacing: 12) {
      ForEach(0..<3, id: \.self) { index in
        HStack {
          VStack(alignment: .leading, spacing: 7) {
            RoundedRectangle(cornerRadius: 3)
              .fill(SBTheme.surfaceMuted)
              .frame(width: index == 1 ? 150 : 118, height: 14)
            RoundedRectangle(cornerRadius: 3)
              .fill(SBTheme.surfaceMuted)
              .frame(height: 10)
          }
          Spacer()
          RoundedRectangle(cornerRadius: 3)
            .fill(SBTheme.surfaceMuted)
            .frame(width: 52, height: 16)
        }
        .redacted(reason: .placeholder)
      }
    }
  }
}

struct PremiumKeyboardGuide: View {
  @Environment(\.dismiss) private var dismiss

  var body: some View {
    NavigationStack {
      ScrollView {
        VStack(alignment: .leading, spacing: 18) {
          HStack(spacing: 14) {
            SBLogoMark(size: 52)
            VStack(alignment: .leading, spacing: 3) {
              Text("SwipeBetter Keyboard")
                .font(.system(.title2, design: .rounded, weight: .bold))
                .foregroundStyle(SBTheme.ink)
              Text("Fast replies where you already chat")
                .font(.subheadline)
                .foregroundStyle(SBTheme.secondaryInk)
            }
          }

          SBSurface {
            VStack(alignment: .leading, spacing: 14) {
              SBSectionHeader(title: "Set it up")
              setupStep(1, "Open Settings → General → Keyboard → Keyboards")
              setupStep(2, "Tap Add New Keyboard and choose SwipeBetter")
              setupStep(3, "Open SwipeBetter Keyboard and turn on Allow Full Access")
              setupStep(4, "In a chat field, hold the globe and choose SwipeBetter")
            }
          }

          SBSurface {
            VStack(alignment: .leading, spacing: 10) {
              Label("What the keyboard can read", systemImage: "eye")
                .font(.headline)
                .foregroundStyle(SBTheme.ink)
              Text("Apple gives custom keyboards text immediately before and after the cursor in the active text field. SwipeBetter uses that visible context to tailor local quick replies and pass context to AI Coach.")
                .font(.subheadline)
                .foregroundStyle(SBTheme.secondaryInk)

              SBDivider()

              Label("What it cannot read", systemImage: "hand.raised.fill")
                .font(.headline)
                .foregroundStyle(SBTheme.ink)
              Text("iOS does not let any custom keyboard inspect an entire app screen or read secure fields. Use Share to SwipeBetter or upload screenshots when the conversation is not exposed to the active text field.")
                .font(.subheadline)
                .foregroundStyle(SBTheme.secondaryInk)
            }
          }

          Button {
            if let url = URL(string: UIApplication.openSettingsURLString) {
              UIApplication.shared.open(url)
            }
          } label: {
            Label("Open SwipeBetter settings", systemImage: "gear")
          }
          .buttonStyle(SBPrimaryButtonStyle())
        }
        .padding(20)
      }
      .sbPageBackground()
      .toolbar {
        ToolbarItem(placement: .confirmationAction) {
          Button("Done") { dismiss() }
            .foregroundStyle(SBTheme.accent)
        }
      }
    }
  }

  private func setupStep(_ number: Int, _ text: String) -> some View {
    HStack(alignment: .top, spacing: 10) {
      Text("\(number)")
        .font(.caption.weight(.bold))
        .foregroundStyle(.white)
        .frame(width: 24, height: 24)
        .background(SBTheme.accent)
        .clipShape(RoundedRectangle(cornerRadius: 5, style: .continuous))
      Text(text)
        .font(.subheadline)
        .foregroundStyle(SBTheme.ink)
        .fixedSize(horizontal: false, vertical: true)
    }
  }
}

struct PremiumSnapSetupGuide: View {
  @Environment(\.dismiss) private var dismiss
  @Environment(\.openURL) private var openURL

  var body: some View {
    NavigationStack {
      ScrollView {
        VStack(alignment: .leading, spacing: 18) {
          HStack(spacing: 14) {
            SBLogoMark(size: 52)
            VStack(alignment: .leading, spacing: 3) {
              Text("SwipeBetter Snap")
                .font(.system(.title2, design: .rounded, weight: .bold))
                .foregroundStyle(SBTheme.ink)
              Text("One gesture from chat to ready-to-send replies")
                .font(.subheadline)
                .foregroundStyle(SBTheme.secondaryInk)
            }
          }

          SBSurface {
            VStack(alignment: .leading, spacing: 14) {
              SBSectionHeader(title: "Create the shortcut", detail: "You only do this once.")
              snapStep(1, "Tap Create Shortcut below.")
              snapStep(2, "Add the Take Screenshot action.")
              snapStep(3, "Add Create Replies from Screenshot from SwipeBetter directly underneath it.")
              snapStep(4, "Name the shortcut SwipeBetter Snap, then tap Done.")

              Button {
                guard let url = URL(string: "shortcuts://create-shortcut") else { return }
                openURL(url)
              } label: {
                Label("Create Shortcut", systemImage: "plus.square")
              }
              .buttonStyle(SBPrimaryButtonStyle())
              .accessibilityIdentifier("snap.openShortcutEditorButton")
            }
          }

          SBSurface {
            VStack(alignment: .leading, spacing: 14) {
              SBSectionHeader(title: "Connect the gesture")
              snapStep(1, "Open Settings → Accessibility → Touch → Back Tap.")
              snapStep(2, "Choose Double Tap or Triple Tap.")
              snapStep(3, "Select SwipeBetter Snap under Shortcuts.")

              Text("On iPhones with an Action Button, you can assign SwipeBetter Snap there instead.")
                .font(.caption)
                .foregroundStyle(SBTheme.secondaryInk)
                .fixedSize(horizontal: false, vertical: true)
            }
          }

          SBSurface {
            VStack(alignment: .leading, spacing: 10) {
              Label("How it works", systemImage: "hand.raised.fill")
                .font(.headline)
                .foregroundStyle(SBTheme.ink)
              Text("Each time you run SwipeBetter Snap, Apple takes one screenshot and sends that image to SwipeBetter. It is not continuous screen recording. Each successful analysis uses one reply-coaching credit; unlimited plans remain unlimited.")
                .font(.subheadline)
                .foregroundStyle(SBTheme.secondaryInk)
                .fixedSize(horizontal: false, vertical: true)
            }
          }
        }
        .padding(20)
      }
      .sbPageBackground()
      .toolbar {
        ToolbarItem(placement: .confirmationAction) {
          Button("Done") { dismiss() }
            .foregroundStyle(SBTheme.accent)
        }
      }
    }
  }

  private func snapStep(_ number: Int, _ text: String) -> some View {
    HStack(alignment: .top, spacing: 10) {
      Text("\(number)")
        .font(.caption.weight(.bold))
        .foregroundStyle(.white)
        .frame(width: 24, height: 24)
        .background(SBTheme.accent)
        .clipShape(RoundedRectangle(cornerRadius: 5, style: .continuous))
      Text(text)
        .font(.subheadline)
        .foregroundStyle(SBTheme.ink)
        .fixedSize(horizontal: false, vertical: true)
    }
  }
}
