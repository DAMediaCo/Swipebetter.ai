import AppIntents
import StoreKit
import Photos
import SwiftUI
import UIKit

struct PremiumHistoryView: View {
  @Environment(AppModel.self) private var model
  @State private var filter = "all"
  @State private var searchText = ""
  @State private var showingSearch = false
  @State private var selectedItem: PremiumHistoryItem?

  private var searchButton: AnyView {
    AnyView(
      Button {
        showingSearch.toggle()
      } label: {
        Image(systemName: "magnifyingglass")
          .frame(width: 44, height: 44)
          .foregroundStyle(SBTheme.ink)
          .sbGlassControl(shape: Circle())
      }
      .accessibilityLabel("Search history")
    )
  }

  var body: some View {
    ScrollView {
      LazyVStack(spacing: 24) {
        SBWorkspaceHeader(
          eyebrow: "Your playbook",
          title: "History",
          detail: "Revisit profile edits and conversation choices.",
          systemImage: "clock.arrow.circlepath",
          status: "\(model.profileHistory.count + model.replyHistory.count) saved",
          trailing: searchButton
        )

        if showingSearch {
          TextField("Search history", text: $searchText)
            .textFieldStyle(.roundedBorder)
            .padding(.horizontal, 16)
        }

        Picker("History filter", selection: $filter) {
          Text("All").tag("all")
          Text("Audits").tag("audits")
          Text("Replies").tag("replies")
        }
        .pickerStyle(.segmented)
        .padding(.horizontal, 16)

        let items = historyItems
        if items.isEmpty {
          VStack(spacing: 12) {
            Image(systemName: "clock.arrow.circlepath")
              .font(.system(size: 25, weight: .medium))
              .foregroundStyle(SBTheme.accent)
              .frame(width: 64, height: 64)
              .background(SBTheme.surfaceMuted, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
            Text("Your playbook is empty")
              .font(.title3.weight(.semibold))
              .foregroundStyle(SBTheme.ink)
            Text("Run an audit or generate replies to save your first result.")
              .font(.subheadline)
              .foregroundStyle(SBTheme.secondaryInk)
              .multilineTextAlignment(.center)
            Button("Run your first audit") {
              model.requestedTabIdentifier = "audit"
              model.deepLinkRevision += 1
            }
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(.white)
            .padding(.horizontal, 16)
            .frame(minHeight: 48)
            .background(SBTheme.primaryActionFill, in: Capsule())
            .accessibilityIdentifier("history.runFirstAuditButton")
          }
          .padding(.horizontal, 32)
          .padding(.top, 84)
          .frame(maxWidth: .infinity)
        } else {
          ForEach(historyGroups) { historyGroup in
            VStack(alignment: .leading, spacing: 10) {
              SBSectionHeader(title: historyGroup.date, detail: nil)
              SBSurface {
                VStack(spacing: 0) {
                  ForEach(historyGroup.items) { item in
                    Button { selectedItem = item } label: {
                      PremiumHistoryRow(eyebrow: item.eyebrow, title: item.title, trailing: item.trailing, systemImage: item.systemImage)
                    }
                    .buttonStyle(.plain)
                    .accessibilityIdentifier("history.row.\(item.id)")
                    .accessibilityLabel("Open \(item.eyebrow) history")
                  }
                }
              }
            }
            .padding(.horizontal, 16)
          }
        }
      }
      .padding(.bottom, 36)
    }
    .refreshable { await model.refreshHistory() }
    .task {
      guard !SwipeBetterScreenshotFixtures.isEnabled else { return }
      await model.refreshHistory()
    }
    .sbPageBackground()
    .navigationBarHidden(true)
    .accessibilityIdentifier("history.list")
    .sheet(item: $selectedItem) { item in
      PremiumHistoryDetail(item: item)
    }
  }

  private var historyItems: [PremiumHistoryItem] {
    var items: [PremiumHistoryItem] = []
    if filter != "replies" {
      items += model.profileHistory
        .filter { searchText.isEmpty || ($0.firstTip ?? $0.improvements ?? "").localizedCaseInsensitiveContains(searchText) }
        .map {
          PremiumHistoryItem(
            id: "audit-\($0.stableId)", category: "audit", eyebrow: $0.platform ?? "Profile",
            title: $0.firstTip ?? $0.improvements ?? "Profile audit saved", trailing: $0.overallScore.map(String.init),
            systemImage: "person.crop.rectangle.stack", dateKey: $0.createdAt ?? "", date: premiumDate($0.createdAt), bucketID: historyBucket($0.createdAt), timestamp: parsedHistoryDate($0.createdAt)
          )
        }
    }
    if filter != "audits" {
      items += model.replyHistory
        .filter { searchText.isEmpty || ($0.conversationContext ?? $0.suggestedReplies?.first ?? "").localizedCaseInsensitiveContains(searchText) }
        .map {
          PremiumHistoryItem(
            id: "reply-\($0.stableId)", category: "reply", eyebrow: $0.tone?.capitalized ?? "Reply coaching",
            title: $0.conversationContext ?? $0.suggestedReplies?.first ?? "Reply session saved", trailing: nil,
            systemImage: "message.badge.waveform", dateKey: $0.createdAt ?? "", date: premiumDate($0.createdAt), bucketID: historyBucket($0.createdAt), timestamp: parsedHistoryDate($0.createdAt)
          )
        }
    }
    return items.sorted { ($0.timestamp ?? .distantPast) > ($1.timestamp ?? .distantPast) }
  }

  private var historyGroups: [PremiumHistoryGroup] {
    Dictionary(grouping: historyItems, by: \.bucketID)
      .map { key, values in
        PremiumHistoryGroup(
          id: key,
          date: values.first?.date ?? "SAVED",
          items: values.sorted { ($0.timestamp ?? .distantPast) > ($1.timestamp ?? .distantPast) },
          timestamp: values.compactMap(\.timestamp).max() ?? .distantPast
        )
      }
      .sorted { $0.timestamp > $1.timestamp }
  }

  private func premiumDate(_ value: String?) -> String {
    guard let value, !value.isEmpty else { return "Saved" }
    let fractionalParser = ISO8601DateFormatter()
    fractionalParser.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    let standardParser = ISO8601DateFormatter()
    guard let date = fractionalParser.date(from: value) ?? standardParser.date(from: value) else { return "SAVED" }
    let calendar = Calendar.current
    if calendar.isDateInToday(date) { return "TODAY" }
    if let startOfWeek = calendar.dateInterval(of: .weekOfYear, for: Date())?.start,
       date >= startOfWeek {
      return "EARLIER THIS WEEK"
    }
    let formatter = DateFormatter()
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.dateFormat = "MMM d"
    return formatter.string(from: date).uppercased()
  }

  private func parsedHistoryDate(_ value: String?) -> Date? {
    guard let value else { return nil }
    let fractionalParser = ISO8601DateFormatter()
    fractionalParser.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    let standardParser = ISO8601DateFormatter()
    return fractionalParser.date(from: value) ?? standardParser.date(from: value)
  }

  private func historyBucket(_ value: String?) -> String {
    guard let date = parsedHistoryDate(value) else { return "unknown" }
    let formatter = DateFormatter()
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.calendar = Calendar(identifier: .gregorian)
    formatter.dateFormat = "yyyy-MM-dd"
    return formatter.string(from: date)
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
    .padding(.horizontal, 16)
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
          .font(.title3.weight(.bold).monospacedDigit())
          .foregroundStyle(SBTheme.teal)
      }

    }
    .padding(.vertical, 12)
    .overlay(alignment: .bottom) {
      SBDivider()
    }
  }
}

private struct PremiumHistoryItem: Identifiable {
  let id: String
  let category: String
  let eyebrow: String
  let title: String
  let trailing: String?
  let systemImage: String
  let dateKey: String
  let date: String
  let bucketID: String
  let timestamp: Date?
}

private struct PremiumHistoryGroup: Identifiable {
  let id: String
  let date: String
  let items: [PremiumHistoryItem]
  let timestamp: Date
}

struct PremiumAccountView: View {
  @Environment(AppModel.self) private var model
  @State private var showingDeleteConfirmation = false
  @State private var setupGuide: SetupGuide?

  private enum SetupGuide: String, Identifiable {
    case keyboard
    case snap

    var id: String { rawValue }
  }

  var body: some View {
    ScrollView {
      LazyVStack(spacing: 24) {
        SBWorkspaceHeader(
          eyebrow: "Control room",
          title: "Account",
          detail: "Manage access, billing, keyboard tools, and your data.",
          systemImage: "person.crop.circle",
          status: accountPlan
        )

        VStack(spacing: 24) {
          accountSummary
          plansSection
          keyboardSection
          privacySection
          helpSection
          destructiveSection
        }
        .padding(.horizontal, 16)
      }
      .padding(.bottom, 112)
    }
    .refreshable {
      await model.refreshAccount()
      await model.purchases.loadProducts()
    }
    .sbPageBackground()
    .navigationBarHidden(true)
    .sheet(item: $setupGuide) { guide in
      Group {
        switch guide {
        case .keyboard:
          PremiumKeyboardGuide()
        case .snap:
          PremiumSnapSetupGuide()
        }
      }
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
      Text("This immediately removes saved audits, reply history, credits, and profile data. This cannot be undone. Apple subscriptions must be managed through Apple billing.")
    }
  }

  private var accountPlan: String {
    model.credits?.planTier?.capitalized
      ?? model.me?.planType?.capitalized
      ?? "Free"
  }

  private var accountStatus: String {
    if model.credits?.isUnlimited == true || model.me?.proActive == true { return "Active" }
    if model.credits?.hasAccess == true { return "Active" }
    if model.credits?.hasAccess == false { return "Inactive" }
    return "Free"
  }

  private var accountSummary: some View {
    SBSurface {
      VStack(spacing: 14) {
        HStack(alignment: .center, spacing: 12) {
          SBLogoMark(size: 46)

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

        HStack(spacing: 0) {
          accountStat(label: "Plan", value: accountPlan, tint: SBTheme.teal)

          SBTheme.divider
            .frame(width: 1, height: 34)
            .accessibilityHidden(true)

          accountStat(
            label: "Credits",
            value: "\(model.credits?.credits ?? model.me?.oneTimeCredits ?? 0)",
            tint: SBTheme.accent
          )

          SBTheme.divider
            .frame(width: 1, height: 34)
            .accessibilityHidden(true)

          accountStat(
            label: "Status",
            value: accountStatus,
            tint: SBTheme.teal
          )
        }
      }
    }
  }

  private func accountStat(label: String, value: String, tint: Color) -> some View {
    VStack(alignment: .leading, spacing: 3) {
      Text(label.uppercased())
        .font(.caption2.weight(.bold))
        .foregroundStyle(SBTheme.secondaryInk)
      Text(value)
        .font(.subheadline.weight(.bold).monospacedDigit())
        .foregroundStyle(tint)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(.horizontal, 4)
  }

  private var plansSection: some View {
    VStack(spacing: 10) {
      SBSectionHeader(
        title: "Subscription",
        detail: "App Store pricing and renewal are managed by Apple."
      )

      SBSurface {
        VStack(spacing: 0) {
          if model.purchases.products.isEmpty {
            if model.purchases.isLoadingProducts {
              PremiumLoadingRows()
            } else {
              PremiumActionRow(title: "Plans unavailable", detail: "Reload App Store products", systemImage: "wifi.exclamationmark") {
                Task { await model.purchases.loadProducts() }
              }
            }
          } else {
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
              if product.id != model.purchases.products.last?.id { SBDivider() }
            }
          }

          SBDivider()
          PremiumActionRow(title: "Manage subscription", detail: "Open Apple subscription settings", systemImage: "creditcard") {
            Task { await model.manageSubscriptions() }
          }
          .accessibilityIdentifier("account.manageSubscriptionButton")
          SBDivider()
          PremiumActionRow(title: "Restore purchases", detail: "Sync active App Store access", systemImage: "arrow.clockwise.circle", isLoading: model.purchases.isRestoringPurchases) {
            Task { await model.restorePurchases() }
          }
          .disabled(model.isBusy || model.purchases.isRestoringPurchases)
          .accessibilityIdentifier("account.restorePurchasesButton")
        }
      }

      if let message = model.purchases.lastPurchaseMessage {
        Label(message, systemImage: "checkmark.circle.fill")
          .font(.caption.weight(.medium))
          .foregroundStyle(SBTheme.teal)
          .frame(maxWidth: .infinity, alignment: .leading)
      }

      Text("Subscriptions renew automatically unless canceled at least 24 hours before the current period ends. Apple charges your account and manages renewal.")
        .font(.caption)
        .foregroundStyle(SBTheme.secondaryInk)
        .frame(maxWidth: .infinity, alignment: .leading)

      HStack(spacing: 16) {
        Link("Terms", destination: accountURL("/terms"))
        Link("Privacy", destination: accountURL("/privacy"))
      }
      .font(.caption.weight(.semibold))
      .frame(maxWidth: .infinity, alignment: .leading)
    }
  }

  private var keyboardSection: some View {
    VStack(spacing: 10) {
      SBSectionHeader(
        title: "Extensions",
        detail: nil
      )

      SBSurface {
        VStack(spacing: 0) {
          PremiumActionRow(title: "SwipeBetter Keyboard", detail: "Context-aware quick replies", systemImage: "keyboard") {
            setupGuide = .keyboard
          }
          .accessibilityIdentifier("account.keyboardSetupButton")
          SBDivider()
          PremiumActionRow(title: "Snap Back", detail: "Siri or the keyboard", systemImage: "camera.viewfinder") {
            setupGuide = .snap
          }
          .accessibilityIdentifier("account.setupSnapButton")
        }
      }
    }
  }

  private var helpSection: some View {
    VStack(spacing: 10) {
      SBSectionHeader(title: "Support")

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

  private var privacySection: some View {
    VStack(spacing: 10) {
      SBSectionHeader(
        title: "Privacy",
        detail: "What SwipeBetter processes and what remains in your account."
      )

      SBSurface {
        VStack(spacing: 0) {
          privacyRow(
            title: "Screenshots",
            detail: "Sent for the analysis you request, then excluded from your saved history.",
            systemImage: "photo.badge.checkmark"
          )
          SBDivider()
          privacyRow(
            title: "Saved history",
            detail: "Generated advice, scores, suggested replies, and a short conversation summary.",
            systemImage: "clock.arrow.circlepath"
          )
          SBDivider()
          privacyRow(
            title: "Keyboard",
            detail: "Reads only text available near the cursor. It cannot inspect the full screen or secure fields.",
            systemImage: "keyboard"
          )
        }
      }
    }
  }

  private func privacyRow(title: String, detail: String, systemImage: String) -> some View {
    HStack(alignment: .top, spacing: 12) {
      Image(systemName: systemImage)
        .font(.system(size: 16, weight: .semibold))
        .foregroundStyle(SBTheme.teal)
        .frame(width: 32, height: 32)
        .background(SBTheme.tealSoft, in: Circle())

      VStack(alignment: .leading, spacing: 3) {
        Text(title)
          .font(.subheadline.weight(.semibold))
          .foregroundStyle(SBTheme.ink)
        Text(detail)
          .font(.caption)
          .foregroundStyle(SBTheme.secondaryInk)
          .fixedSize(horizontal: false, vertical: true)
      }
      Spacer(minLength: 0)
    }
    .padding(.vertical, 11)
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

      Text("SwipeBetter \(appVersion)")
        .font(.caption2)
        .foregroundStyle(SBTheme.secondaryInk)
        .frame(maxWidth: .infinity)
        .padding(.top, 8)
    }
  }

  private var initials: String {
    let first = model.user?.firstName?.first.map(String.init) ?? "S"
    let last = model.user?.lastName?.first.map(String.init) ?? "B"
    return first + last
  }

  private var appVersion: String {
    Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "—"
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
              .font(.headline.weight(.bold).monospacedDigit())
              .foregroundStyle(SBTheme.accent)
            Image(systemName: "arrow.right")
              .font(.caption.weight(.bold))
              .foregroundStyle(SBTheme.secondaryInk)
          }
        }
      }
      .padding(16)
      .frame(maxWidth: .infinity, alignment: .leading)
      .background(isRecommended ? SBTheme.tealSoft.opacity(0.52) : .clear)
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

private struct PremiumHistoryDetail: View {
  let item: PremiumHistoryItem
  @Environment(\.dismiss) private var dismiss

  var body: some View {
    NavigationStack {
      ScrollView {
        VStack(alignment: .leading, spacing: 16) {
          SBSectionHeader(title: item.eyebrow, detail: item.date)
          SBSurface {
            Text(item.title)
              .font(.body)
              .foregroundStyle(SBTheme.ink)
              .textSelection(.enabled)
          }
        }
        .padding(16)
      }
      .sbPageBackground()
      .toolbar {
        ToolbarItem(placement: .confirmationAction) { Button("Done") { dismiss() } }
      }
    }
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
                .font(.title2.weight(.bold))
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
              Text("Apple gives custom keyboards text immediately before and after the cursor in the active text field. SwipeBetter uses that visible context to create quick replies on your device.")
                .font(.subheadline)
                .foregroundStyle(SBTheme.secondaryInk)

              SBDivider()

              Label("What Full Access enables", systemImage: "lock.open")
                .font(.headline)
                .foregroundStyle(SBTheme.ink)
              Text("Full Access lets you paste clipboard text and lets the keyboard read a reply result created by SwipeBetter Snap. The keyboard does not send keystrokes to our servers. Snap results expire after 30 minutes and are removed after you insert one.")
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
  @State private var currentStep = 0
  @State private var photoAccess = PHPhotoLibrary.authorizationStatus(for: .readWrite)

  private let totalSteps = 3

  var body: some View {
    NavigationStack {
      VStack(spacing: 0) {
        ScrollView {
          VStack(alignment: .leading, spacing: 18) {
            HStack(spacing: 14) {
              SBLogoMark(size: 52)
              VStack(alignment: .leading, spacing: 3) {
                Text("SwipeBetter Snap")
                  .font(.title2.weight(.bold))
                  .foregroundStyle(SBTheme.ink)
                Text("No Apple Shortcuts setup required")
                  .font(.subheadline)
                  .foregroundStyle(SBTheme.secondaryInk)
              }
            }

            VStack(alignment: .leading, spacing: 8) {
              HStack {
                Text("Step \(currentStep + 1) of \(totalSteps)")
                  .font(.caption.weight(.bold))
                  .foregroundStyle(SBTheme.accent)
                Spacer()
                Text("\(Int(Double(currentStep + 1) / Double(totalSteps) * 100))%")
                  .font(.caption.monospacedDigit())
                  .foregroundStyle(SBTheme.secondaryInk)
              }

              ProgressView(value: Double(currentStep + 1), total: Double(totalSteps))
                .tint(SBTheme.accent)
            }

            SBSurface {
              VStack(alignment: .leading, spacing: 16) {
                Image(systemName: stepIcon)
                  .font(.system(size: 22, weight: .semibold))
                  .foregroundStyle(SBTheme.accent)
                  .frame(width: 44, height: 44)
                  .background(SBTheme.accentSoft)
                  .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))

                Text(stepTitle)
                  .font(.title3.weight(.bold))
                  .foregroundStyle(SBTheme.ink)

                Text(stepInstructions)
                  .font(.body)
                  .foregroundStyle(SBTheme.ink)
                  .fixedSize(horizontal: false, vertical: true)

                if currentStep == 0 {
                  photoAccessControl
                }

                if currentStep == 1 {
                  Label(
                    "Only the newest screenshot is read, and only after you ask Siri or tap Snap Back.",
                    systemImage: "hand.raised.fill"
                  )
                  .font(.subheadline.weight(.semibold))
                  .foregroundStyle(SBTheme.teal)
                  .fixedSize(horizontal: false, vertical: true)
                }

                if currentStep == 2 {
                  VStack(alignment: .leading, spacing: 14) {
                    Label("Voice", systemImage: "waveform")
                      .font(.subheadline.weight(.bold))
                      .foregroundStyle(SBTheme.ink)

                    SiriTipView(intent: CreateRepliesFromLatestScreenshotIntent())
                      .siriTipViewStyle(.automatic)
                      .accessibilityIdentifier("snap.siriTip")

                    SBDivider()

                    Label("Quiet", systemImage: "keyboard")
                      .font(.subheadline.weight(.bold))
                      .foregroundStyle(SBTheme.ink)

                    Text("Open the SwipeBetter keyboard and tap Snap Back.")
                      .font(.subheadline)
                      .foregroundStyle(SBTheme.secondaryInk)
                      .fixedSize(horizontal: false, vertical: true)
                  }
                }

              }
            }

            Text("SwipeBetter does not record your screen. Snap Back reads only the newest recent screenshot after you ask Siri or tap the keyboard button.")
              .font(.caption)
              .foregroundStyle(SBTheme.secondaryInk)
              .fixedSize(horizontal: false, vertical: true)
              .accessibilityIdentifier("snap.privacyNote")
          }
          .padding(20)
        }

        SBDivider()

        HStack(spacing: 12) {
          if currentStep > 0 {
            Button {
              currentStep -= 1
            } label: {
              Label("Back", systemImage: "chevron.left")
            }
            .buttonStyle(SBSecondaryButtonStyle())
            .accessibilityIdentifier("snap.previousStepButton")
          }

          Button {
            if currentStep < totalSteps - 1 {
              currentStep += 1
            } else {
              currentStep = 0
              dismiss()
            }
          } label: {
            Label(
              currentStep < totalSteps - 1 ? "Next step" : "Finish setup",
              systemImage: currentStep < totalSteps - 1 ? "chevron.right" : "checkmark"
            )
          }
          .buttonStyle(SBPrimaryButtonStyle())
          .accessibilityIdentifier("snap.nextStepButton")
        }
        .padding(20)
        .background(SBTheme.surface)
      }
      .sbPageBackground()
      .toolbar {
        ToolbarItem(placement: .confirmationAction) {
          Button("Close") { dismiss() }
            .foregroundStyle(SBTheme.accent)
        }
      }
      .onAppear {
        currentStep = 0
      }
    }
  }

  private var stepTitle: String {
    switch currentStep {
    case 0:
      return "Allow screenshot access"
    case 1:
      return "Take a screenshot"
    default:
      return "Choose voice or keyboard"
    }
  }

  private var stepInstructions: String {
    switch currentStep {
    case 0:
      return "Allow Full Photo Access once. SwipeBetter needs this only to find the newest screenshot after you tap Snap Back."
    case 1:
      return "In Bumble, Tinder, or another dating app, take one screenshot that clearly shows the recent conversation."
    default:
      return "Say “Siri, Snap Back with SwipeBetter,” or open the SwipeBetter keyboard and tap Snap Back. Your three replies will appear on the keyboard."
    }
  }

  private var stepIcon: String {
    switch currentStep {
    case 0:
      return "photo.badge.checkmark"
    case 1:
      return "camera.viewfinder"
    default:
      return "waveform.and.mic"
    }
  }

  @ViewBuilder
  private var photoAccessControl: some View {
    switch photoAccess {
    case .authorized:
      Label("Full Photo Access allowed", systemImage: "checkmark.circle.fill")
        .font(.subheadline.weight(.semibold))
        .foregroundStyle(SBTheme.teal)
        .accessibilityIdentifier("snap.photoAccessGranted")
    case .denied, .restricted, .limited:
      Button {
        openURL(URL(string: UIApplication.openSettingsURLString)!)
      } label: {
        Label("Open Settings for Full Access", systemImage: "gear")
      }
      .buttonStyle(SBSecondaryButtonStyle())
      .accessibilityIdentifier("snap.photoAccessButton")
    case .notDetermined:
      Button {
        Task {
          photoAccess = await PHPhotoLibrary.requestAuthorization(for: .readWrite)
        }
      } label: {
        Label("Allow Full Photo Access", systemImage: "photo.badge.checkmark")
      }
      .buttonStyle(SBSecondaryButtonStyle())
      .accessibilityIdentifier("snap.photoAccessButton")
    @unknown default:
      EmptyView()
    }
  }
}
