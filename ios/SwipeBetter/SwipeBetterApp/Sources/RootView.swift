import AuthenticationServices
import PhotosUI
import SwiftUI
import UIKit

enum AppTab: Hashable, CaseIterable {
  case audit
  case replies
  case history
  case account

  @ViewBuilder
  var label: some View {
    switch self {
    case .audit:
      Label("Audit", systemImage: "person.crop.rectangle.stack")
    case .replies:
      Label("Replies", systemImage: "message.badge.waveform")
    case .history:
      Label("History", systemImage: "clock.arrow.circlepath")
    case .account:
      Label("Account", systemImage: "person.circle")
    }
  }
}

struct RootView: View {
  @Environment(AppModel.self) private var model
  @State private var selectedTab: AppTab = .audit

  var body: some View {
    Group {
      if model.isSignedIn {
        TabView(selection: $selectedTab) {
          NavigationStack { ProfileAuditView() }
            .tabItem { AppTab.audit.label }
            .tag(AppTab.audit)

          NavigationStack { ReplyAssistantView() }
            .tabItem { AppTab.replies.label }
            .tag(AppTab.replies)

          NavigationStack { HistoryView() }
            .tabItem { AppTab.history.label }
            .tag(AppTab.history)

          NavigationStack { AccountView() }
            .tabItem { AppTab.account.label }
            .tag(AppTab.account)
        }
      } else {
        AuthView()
      }
    }
    .overlay(alignment: .bottom) {
      if let error = model.lastError {
        Text(error)
          .font(.footnote.weight(.semibold))
          .foregroundStyle(.white)
          .padding(.horizontal, 14)
          .padding(.vertical, 10)
          .background(.red.gradient, in: Capsule())
          .padding()
          .transition(.move(edge: .bottom).combined(with: .opacity))
      }
    }
    .overlay {
      if model.isBusy {
        ZStack {
          Color.black.opacity(0.14).ignoresSafeArea()
          ProgressView()
            .controlSize(.large)
            .padding(22)
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 10))
        }
      }
    }
    .onChange(of: model.importRevision) { _, _ in
      selectedTab = model.pendingImportText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? .audit : .replies
    }
  }
}

struct AuthView: View {
  @Environment(AppModel.self) private var model
  @State private var isSignup = false
  @State private var email = ""
  @State private var password = ""
  @State private var firstName = ""
  @State private var lastName = ""
  @State private var promoCode = ""
  @State private var showingPasswordReset = false

  var body: some View {
    NavigationStack {
      ScrollView {
        VStack(alignment: .leading, spacing: 22) {
          VStack(alignment: .leading, spacing: 8) {
            Text("SwipeBetter")
              .font(.system(size: 38, weight: .bold))
            Text("Profile audits and reply coaching for dating apps.")
              .font(.title3)
              .foregroundStyle(.secondary)
          }
          .padding(.top, 34)

          Picker("Mode", selection: $isSignup) {
            Text("Log in").tag(false)
            Text("Create account").tag(true)
          }
          .pickerStyle(.segmented)

          VStack(spacing: 12) {
            if isSignup {
              HStack(spacing: 10) {
                TextField("First name", text: $firstName)
                  .textContentType(.givenName)
                TextField("Last name", text: $lastName)
                  .textContentType(.familyName)
              }
            }

            TextField("Email", text: $email)
              .textContentType(.emailAddress)
              .keyboardType(.emailAddress)
              .textInputAutocapitalization(.never)
              .autocorrectionDisabled()

            SecureField("Password", text: $password)
              .textContentType(isSignup ? .newPassword : .password)

            if isSignup {
              TextField("Promo code", text: $promoCode)
                .textInputAutocapitalization(.characters)
                .autocorrectionDisabled()
            }
          }
          .textFieldStyle(.roundedBorder)

          Button {
            Task {
              if isSignup {
                await model.signup(email: email, password: password, firstName: firstName, lastName: lastName, promoCode: promoCode)
              } else {
                await model.login(email: email, password: password)
              }
            }
          } label: {
            Label(isSignup ? "Create Account" : "Log In", systemImage: "arrow.right.circle.fill")
              .frame(maxWidth: .infinity)
          }
          .buttonStyle(.borderedProminent)
          .controlSize(.large)
          .disabled(email.isEmpty || password.count < 8)

          if !isSignup {
            Button("Forgot password?") {
              showingPasswordReset = true
            }
            .font(.subheadline.weight(.semibold))
            .frame(maxWidth: .infinity, alignment: .center)
          }

          SignInWithAppleButton(.continue) { request in
            request.requestedScopes = [.fullName, .email]
          } onCompletion: { result in
            if case .success(let authorization) = result,
               let credential = authorization.credential as? ASAuthorizationAppleIDCredential {
              Task { await model.signInWithApple(credential: credential) }
            } else if case .failure(let error) = result {
              model.lastError = error.localizedDescription
            }
          }
          .signInWithAppleButtonStyle(.black)
          .frame(height: 50)
          .clipShape(RoundedRectangle(cornerRadius: 8))

          VStack(alignment: .leading, spacing: 8) {
            Label("iOS pricing includes Apple purchase fees.", systemImage: "info.circle")
            Text("Starter $3.99, Unlimited $16.99/month, Annual $104.99/year.")
          }
          .font(.footnote)
          .foregroundStyle(.secondary)

          HStack(spacing: 16) {
            Link("Terms", destination: authURL("/terms"))
            Link("Privacy", destination: authURL("/privacy"))
            Link("Support", destination: authURL("/contact"))
          }
          .font(.footnote.weight(.semibold))
        }
        .padding(22)
      }
      .background(Color(.systemGroupedBackground))
    }
    .sheet(isPresented: $showingPasswordReset) {
      PasswordResetSheet(initialEmail: email)
        .environment(model)
    }
  }

  private func authURL(_ path: String) -> URL {
    URL(string: "https://swipebetter.ai\(path)")!
  }
}

struct PasswordResetSheet: View {
  @Environment(AppModel.self) private var model
  @Environment(\.dismiss) private var dismiss
  @State private var email: String
  @State private var message: String?

  init(initialEmail: String) {
    _email = State(initialValue: initialEmail)
  }

  var body: some View {
    NavigationStack {
      Form {
        Section {
          TextField("Email", text: $email)
            .textContentType(.emailAddress)
            .keyboardType(.emailAddress)
            .textInputAutocapitalization(.never)
            .autocorrectionDisabled()
        }

        Section {
          Button {
            Task {
              message = await model.requestPasswordReset(email: email)
            }
          } label: {
            Label("Send Reset Link", systemImage: "envelope")
          }
          .disabled(email.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
        }

        if let message {
          Section {
            Text(message)
              .foregroundStyle(.secondary)
          }
        }
      }
      .navigationTitle("Reset Password")
      .toolbar {
        ToolbarItem(placement: .cancellationAction) {
          Button("Done") {
            dismiss()
          }
        }
      }
    }
  }
}

struct ProfileAuditView: View {
  @Environment(AppModel.self) private var model
  @State private var platform = "Tinder"
  @State private var gender = "Man"
  @State private var intent = "Relationship"
  @State private var enm = false
  @State private var pickerItems: [PhotosPickerItem] = []
  @State private var images: [Data] = []
  @State private var result: ProfileStatusResponse?
  @State private var appliedImportRevision = -1

  private let platforms = ["Tinder", "Hinge", "Bumble", "Grindr", "Coffee Meets Bagel", "Other"]
  private let genders = ["Man", "Woman", "Non-binary"]
  private let intents = ["Relationship", "Casual Dating", "Friendship", "Not Sure"]

  var body: some View {
    Form {
      Section {
        UsageStatusRow(
          title: "Profile audits use one credit",
          detail: "Unlimited members can run audits without spending starter credits.",
          systemImage: "person.crop.rectangle.stack"
        )
      }

      Section("Screenshots") {
        PhotosPicker(selection: $pickerItems, maxSelectionCount: 10, matching: .images) {
          Label(images.isEmpty ? "Add profile screenshots" : "\(images.count) screenshots selected", systemImage: "photo.on.rectangle.angled")
        }
        ScreenshotStrip(images: images, onRemove: removeImage)
        if !images.isEmpty {
          Button(role: .destructive) {
            pickerItems = []
            images = []
          } label: {
            Label("Clear screenshots", systemImage: "xmark.circle")
          }
        }
      }

      Section("Profile") {
        Picker("App", selection: $platform) {
          ForEach(platforms, id: \.self) { Text($0) }
        }
        Picker("Gender", selection: $gender) {
          ForEach(genders, id: \.self) { Text($0) }
        }
        Picker("Intent", selection: $intent) {
          ForEach(intents, id: \.self) { Text($0) }
        }
        Toggle("ENM / poly profile", isOn: $enm)
      }

      Section {
        Button {
          Task {
            result = await model.startProfileAudit(platform: platform, gender: gender, intent: intent, enm: enm, images: images)
          }
        } label: {
          Label("Run Profile Audit", systemImage: "wand.and.stars")
        }
        .disabled(model.isBusy || images.isEmpty)
      }

      if let analysis = result?.analysis {
        Section("Result") {
          ScoreRow(score: analysis.overallScore)
          ResultBlock(title: "First Fix", text: analysis.firstTip)
          ResultBlock(title: "Bio", text: analysis.bioSuggestions)
          ResultBlock(title: "Photos", text: analysis.photoFeedback)
          ResultBlock(title: "Improvements", text: analysis.improvements)
        }
      } else if let result, result.status == "failed" {
        Section("Result") {
          Text(result.error ?? "Analysis failed.")
            .foregroundStyle(.red)
        }
      }
    }
    .navigationTitle("Profile Audit")
    .toolbar {
      Button {
        model.loadSharedImport()
        applyPendingImport()
      } label: {
        Image(systemName: "square.and.arrow.down")
      }
      .accessibilityLabel("Import shared screenshots")
    }
    .onChange(of: pickerItems) { _, newValue in
      Task { images = await loadImages(from: newValue, limit: 10) }
    }
    .onChange(of: model.importRevision) { _, _ in
      applyPendingImport()
    }
    .onAppear {
      applyPendingImport()
    }
  }

  private func applyPendingImport() {
    guard appliedImportRevision != model.importRevision else { return }
    appliedImportRevision = model.importRevision
    if !model.pendingImportImages.isEmpty {
      images = model.pendingImportImages
    }
  }

  private func removeImage(at index: Int) {
    guard images.indices.contains(index) else { return }
    images.remove(at: index)
    pickerItems = []
  }
}

struct ReplyAssistantView: View {
  @Environment(AppModel.self) private var model
  @State private var tone = "flirty"
  @State private var goal = "keep_going"
  @State private var enm = false
  @State private var conversation = ""
  @State private var pickerItems: [PhotosPickerItem] = []
  @State private var images: [Data] = []
  @State private var response: ReplyAnalysisResponse?
  @State private var appliedImportRevision = -1

  private let tones = ["flirty", "witty", "confident", "thoughtful"]
  private let goals = [
    "first_impression": "First message",
    "keep_going": "Keep it going",
    "ask_out": "Ask them out",
    "revive": "Revive chat",
  ]

  var body: some View {
    Form {
      Section {
        UsageStatusRow(
          title: "Reply coaching uses one credit",
          detail: "Paste text, share a screenshot, or use the keyboard extension to bring chat context here.",
          systemImage: "message.badge.waveform"
        )
      }

      Section("Conversation") {
        TextEditor(text: $conversation)
          .frame(minHeight: 160)
          .overlay(alignment: .topLeading) {
            if conversation.isEmpty {
              Text("Paste the chat here.")
                .foregroundStyle(.tertiary)
                .padding(.top, 8)
                .padding(.leading, 5)
            }
          }

        PhotosPicker(selection: $pickerItems, maxSelectionCount: 3, matching: .images) {
          Label(images.isEmpty ? "Add chat screenshots" : "\(images.count) screenshots selected", systemImage: "photo.badge.plus")
        }
        ScreenshotStrip(images: images, onRemove: removeImage)
        if !images.isEmpty {
          Button(role: .destructive) {
            pickerItems = []
            images = []
          } label: {
            Label("Clear screenshots", systemImage: "xmark.circle")
          }
        }
      }

      Section("Style") {
        Picker("Tone", selection: $tone) {
          ForEach(tones, id: \.self) { Text($0.capitalized) }
        }
        Picker("Goal", selection: $goal) {
          ForEach(goals.sorted(by: { $0.value < $1.value }), id: \.key) { key, label in
            Text(label).tag(key)
          }
        }
        Toggle("ENM / poly context", isOn: $enm)
      }

      Section {
        Button {
          Task {
            response = await model.generateReplies(tone: tone, goal: goal, enm: enm, conversationText: conversation, images: images)
          }
        } label: {
          Label("Generate Replies", systemImage: "sparkles")
        }
        .disabled(model.isBusy || (conversation.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && images.isEmpty))
      }

      if let parsed = response?.parsed {
        Section("Best Replies") {
          ResultBlock(title: "Context", text: parsed.conversationContext)
          ForEach(Array((parsed.suggestedReplies ?? []).enumerated()), id: \.offset) { index, reply in
            VStack(alignment: .leading, spacing: 10) {
              Text(reply)
              Button {
                UIPasteboard.general.string = reply
              } label: {
                Label("Copy reply \(index + 1)", systemImage: "doc.on.doc")
              }
              .buttonStyle(.bordered)
            }
          }
        }
      }
    }
    .navigationTitle("Reply Coach")
    .toolbar {
      Button {
        model.loadSharedImport()
        applyPendingImport()
      } label: {
        Image(systemName: "square.and.arrow.down")
      }
      .accessibilityLabel("Import shared chat")
    }
    .onChange(of: pickerItems) { _, newValue in
      Task { images = await loadImages(from: newValue, limit: 3) }
    }
    .onChange(of: model.importRevision) { _, _ in
      applyPendingImport()
    }
    .onAppear {
      applyPendingImport()
    }
  }

  private func applyPendingImport() {
    guard appliedImportRevision != model.importRevision else { return }
    appliedImportRevision = model.importRevision
    if !model.pendingImportText.isEmpty {
      conversation = model.pendingImportText
    }
    images = model.pendingImportImages
  }

  private func removeImage(at index: Int) {
    guard images.indices.contains(index) else { return }
    images.remove(at: index)
    pickerItems = []
  }
}

struct HistoryView: View {
  @Environment(AppModel.self) private var model

  var body: some View {
    List {
      Section("Profile Audits") {
        if model.profileHistory.isEmpty {
          ContentUnavailableView("No profile audits yet", systemImage: "person.crop.rectangle")
        } else {
          ForEach(model.profileHistory, id: \.stableId) { item in
            VStack(alignment: .leading, spacing: 6) {
              HStack {
                Text(item.platform ?? "Profile")
                  .font(.headline)
                Spacer()
                if let score = item.overallScore {
                  Text("\(score)")
                    .font(.headline.monospacedDigit())
                }
              }
              Text(item.firstTip ?? item.improvements ?? "Audit saved.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .lineLimit(3)
            }
            .padding(.vertical, 4)
          }
        }
      }

      Section("Reply Sessions") {
        if model.replyHistory.isEmpty {
          ContentUnavailableView("No reply sessions yet", systemImage: "message")
        } else {
          ForEach(model.replyHistory, id: \.stableId) { item in
            VStack(alignment: .leading, spacing: 6) {
              Text(item.tone?.capitalized ?? "Reply")
                .font(.headline)
              Text(item.conversationContext ?? item.suggestedReplies?.first ?? "Replies saved.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .lineLimit(3)
            }
            .padding(.vertical, 4)
          }
        }
      }
    }
    .navigationTitle("History")
    .refreshable {
      await model.refreshHistory()
    }
    .task {
      await model.refreshHistory()
    }
  }
}

struct AccountView: View {
  @Environment(AppModel.self) private var model
  @State private var showingDeleteConfirmation = false

  var body: some View {
    List {
      Section("Account") {
        LabeledContent("Signed in as", value: model.user?.email ?? model.user?.displayName ?? "Unknown")
        LabeledContent("Plan", value: model.credits?.planTier?.capitalized ?? model.me?.planType?.capitalized ?? "Free")
        LabeledContent("Credits", value: "\(model.credits?.credits ?? model.me?.oneTimeCredits ?? 0)")
      }

      Section("iOS Plans") {
        if model.purchases.products.isEmpty {
          VStack(alignment: .leading, spacing: 8) {
            ProgressView()
            Text("Loading App Store products.")
              .foregroundStyle(.secondary)
          }
        } else {
          ForEach(model.purchases.products, id: \.id) { product in
            Button {
              Task { await model.purchase(product) }
            } label: {
              HStack {
                VStack(alignment: .leading, spacing: 4) {
                  Text(displayName(for: product.id, fallback: product.displayName))
                    .font(.headline)
                  Text(product.description)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                }
                Spacer()
                Text(product.displayPrice)
                  .font(.headline)
              }
            }
          }
        }

        Text("iOS purchases are billed by Apple. Web Stripe checkout is intentionally not shown inside the app.")
          .font(.footnote)
          .foregroundStyle(.secondary)
      }

      Section("Apple Billing") {
        Button {
          Task { await model.restorePurchases() }
        } label: {
          Label("Restore Purchases", systemImage: "arrow.clockwise.circle")
        }

        Button {
          Task { await model.manageSubscriptions() }
        } label: {
          Label("Manage Subscription", systemImage: "creditcard")
        }
      }

      if let message = model.purchases.lastPurchaseMessage {
        Section {
          Text(message)
        }
      }

      Section("Help") {
        Link(destination: accountURL("/contact")) {
          Label("Contact Support", systemImage: "questionmark.circle")
        }
        Link(destination: accountURL("/terms")) {
          Label("Terms of Service", systemImage: "doc.text")
        }
        Link(destination: accountURL("/privacy")) {
          Label("Privacy Policy", systemImage: "hand.raised")
        }
        Link(destination: accountURL("/refund-policy")) {
          Label("Refund Policy", systemImage: "arrow.uturn.backward.circle")
        }
      }

      Section("Delete Account") {
        Text("This permanently removes your SwipeBetter account, saved audits, reply history, credits, and profile data. If you have an Apple subscription, manage or cancel it with Apple first.")
          .font(.footnote)
          .foregroundStyle(.secondary)

        Button(role: .destructive) {
          showingDeleteConfirmation = true
        } label: {
          Label("Delete Account", systemImage: "trash")
        }
      }

      Section {
        Button(role: .destructive) {
          Task { await model.logout() }
        } label: {
          Label("Log Out", systemImage: "rectangle.portrait.and.arrow.right")
        }
      }
    }
    .navigationTitle("Account")
    .refreshable {
      await model.refreshAccount()
      await model.purchases.loadProducts()
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

  private func displayName(for id: String, fallback: String) -> String {
    switch id {
    case SwipeBetterConfig.starterProductId:
      return "Starter Pack"
    case SwipeBetterConfig.monthlyProductId:
      return "Unlimited Monthly"
    case SwipeBetterConfig.annualProductId:
      return "Unlimited Annual"
    default:
      return fallback
    }
  }

  private func accountURL(_ path: String) -> URL {
    URL(string: "https://swipebetter.ai\(path)")!
  }
}

struct UsageStatusRow: View {
  @Environment(AppModel.self) private var model

  let title: String
  let detail: String
  let systemImage: String

  var body: some View {
    Label {
      VStack(alignment: .leading, spacing: 4) {
        HStack {
          Text(title)
            .font(.headline)
          Spacer(minLength: 12)
          Text(statusText)
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(statusColor)
        }
        Text(detail)
          .font(.footnote)
          .foregroundStyle(.secondary)
      }
    } icon: {
      Image(systemName: systemImage)
        .foregroundStyle(statusColor)
    }
    .accessibilityElement(children: .combine)
  }

  private var statusText: String {
    if isUnlimited {
      return "Unlimited"
    }

    let credits = model.credits?.credits ?? model.me?.oneTimeCredits ?? 0
    return credits == 1 ? "1 credit" : "\(credits) credits"
  }

  private var isUnlimited: Bool {
    if model.credits?.planTier?.lowercased() == "unlimited" {
      return true
    }
    return model.me?.planType?.lowercased() == "unlimited"
  }

  private var statusColor: Color {
    isUnlimited || (model.credits?.credits ?? model.me?.oneTimeCredits ?? 0) > 0 ? .green : .orange
  }
}

struct ScreenshotStrip: View {
  let images: [Data]
  var onRemove: ((Int) -> Void)?

  var body: some View {
    if !images.isEmpty {
      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 10) {
          ForEach(Array(images.enumerated()), id: \.offset) { index, data in
            if let image = UIImage(data: data) {
              Image(uiImage: image)
                .resizable()
                .scaledToFill()
                .frame(width: 78, height: 112)
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .overlay(alignment: .topTrailing) {
                  if let onRemove {
                    Button {
                      onRemove(index)
                    } label: {
                      Image(systemName: "xmark.circle.fill")
                        .font(.title3)
                        .symbolRenderingMode(.palette)
                        .foregroundStyle(.white, .black.opacity(0.55))
                    }
                    .buttonStyle(.plain)
                    .padding(5)
                    .accessibilityLabel("Remove screenshot \(index + 1)")
                  }
                }
                .accessibilityLabel("Selected screenshot \(index + 1)")
            }
          }
        }
        .padding(.vertical, 4)
      }
    }
  }
}

struct ScoreRow: View {
  let score: Int?

  var body: some View {
    HStack {
      Text("Overall Score")
      Spacer()
      Text(score.map(String.init) ?? "-")
        .font(.title2.weight(.bold).monospacedDigit())
    }
  }
}

struct ResultBlock: View {
  let title: String
  let text: String?

  var body: some View {
    if let text, !text.isEmpty {
      VStack(alignment: .leading, spacing: 6) {
        Text(title)
          .font(.headline)
        Text(clean(text))
          .font(.body)
          .textSelection(.enabled)
      }
      .padding(.vertical, 4)
    }
  }

  private func clean(_ value: String) -> String {
    if let data = value.data(using: .utf8),
       let json = try? JSONSerialization.jsonObject(with: data) as? [String] {
      return json.joined(separator: "\n")
    }
    return value
  }
}

func loadImages(from items: [PhotosPickerItem], limit: Int) async -> [Data] {
  var output: [Data] = []
  for item in items.prefix(limit) {
    if let data = try? await item.loadTransferable(type: Data.self) {
      output.append(data)
    }
  }
  return output
}
