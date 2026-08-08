import PhotosUI
import SwiftUI
import UIKit

struct PremiumProfileAuditView: View {
  @Environment(AppModel.self) private var model
  let isActive: Bool
  @State private var platform = "Tinder"
  @State private var gender = "Man"
  @State private var intent = "Relationship"
  @State private var enm = false
  @State private var pickerItems: [PhotosPickerItem] = []
  @State private var images: [Data] = []
  @State private var result: ProfileStatusResponse?
  @State private var auditDestination: PremiumAuditResultPayload?
  @State private var appliedImportRevision = -1

  private let platforms = ["Tinder", "Hinge", "Bumble", "Grindr", "Coffee Meets Bagel", "Other"]
  private let genders = ["Man", "Woman", "Non-binary"]
  private let intents = ["Relationship", "Casual Dating", "Friendship", "Not Sure"]

  private var accessStatus: String {
    if isUnlimited {
      return "Unlimited"
    }
    let credits = model.credits?.credits ?? model.me?.oneTimeCredits ?? 0
    return "\(credits) \(credits == 1 ? "credit" : "credits")"
  }

  private var isUnlimited: Bool {
    model.credits?.isUnlimited == true
      || model.credits?.planTier?.lowercased() == "unlimited"
      || model.me?.proActive == true
  }

  private var importButton: AnyView {
    AnyView(
      Menu {
        Button("Import shared screenshots", systemImage: "square.and.arrow.down") {
          model.loadSharedImport()
          applyPendingImport()
        }
        Button("Account", systemImage: "person.circle") {
          model.requestedTabIdentifier = "account"
          model.deepLinkRevision += 1
        }
      } label: {
        Image(systemName: "ellipsis.circle")
          .font(.system(size: 18, weight: .semibold))
          .foregroundStyle(SBTheme.ink)
          .frame(width: 44, height: 44)
          .sbGlassControl(shape: Circle())
      }
      .accessibilityLabel("Profile and import options")
    )
  }

  private var screenshotFooter: String {
    images.isEmpty
      ? "Up to 10 screenshots, in the order people see them."
      : "\(images.count) of 10 screenshots added. Keep the order people see first."
  }

  private var auditDatingSection: some View {
    Section {
      Menu {
        ForEach(platforms, id: \.self) { value in
          Button(value) { platform = value }
        }
      } label: {
        HStack(spacing: 12) {
          Text(String(platform.prefix(1)).uppercased())
            .font(.headline.weight(.bold))
            .foregroundStyle(.white)
            .frame(width: 29, height: 29)
            .background(SBTheme.accent, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
          VStack(alignment: .leading, spacing: 2) {
            Text("App")
              .font(.subheadline.weight(.medium))
            Text(platform)
              .font(.caption)
              .foregroundStyle(SBTheme.secondaryInk)
          }
          Spacer()
          Text("Change")
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(SBTheme.accentPressed)
        }
        .frame(minHeight: 44)
      }
      .accessibilityIdentifier("audit.platformMenu")
    } header: {
      Text("DATING APP")
    }
  }

  private var auditProfileSection: some View {
    Section {
      Menu {
        ForEach(genders, id: \.self) { value in
          Button(value) { gender = value }
        }
      } label: {
        PremiumAuditValueRow(title: "Gender", value: gender)
      }
      .accessibilityIdentifier("audit.genderMenu")

      Menu {
        ForEach(intents, id: \.self) { value in
          Button(value) { intent = value }
        }
      } label: {
        PremiumAuditValueRow(title: "Looking for", value: intent)
      }
      .accessibilityIdentifier("audit.intentMenu")

      Toggle("Open to ENM / poly", isOn: $enm)
        .font(.subheadline.weight(.medium))
        .tint(SBTheme.accent)
        .frame(minHeight: 44)

      Text("Partner photos are expected. We review them in the context of your ENM/poly profile.")
        .font(.caption)
        .foregroundStyle(SBTheme.secondaryInk)
        .fixedSize(horizontal: false, vertical: true)
        .padding(.vertical, 4)
    } header: {
      Text("YOUR PROFILE")
    }
  }

  private var auditScreenshotsSection: some View {
    Section {
      if images.isEmpty {
        PhotosPicker(selection: $pickerItems, maxSelectionCount: 10, matching: .images) {
          PremiumImageDropzone(
            title: "Add profile screenshots",
            detail: "Photos, prompts, bio, and interests",
            systemImage: "photo.stack"
          )
          .padding(.vertical, 8)
        }
        .buttonStyle(.plain)
        .accessibilityIdentifier("audit.addScreenshotsButton")
      } else {
        PremiumScreenshotStrip(
          images: images,
          onRemove: removeImage,
          addContent: images.count < 10 ? AnyView(
            PhotosPicker(selection: $pickerItems, maxSelectionCount: max(10 - images.count, 1), matching: .images) {
              Image(systemName: "plus")
                .font(.headline.weight(.semibold))
                .foregroundStyle(SBTheme.accentPressed)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(SBTheme.surfaceMuted)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Add more screenshots")
            .accessibilityIdentifier("audit.addScreenshotsButton")
          ) : nil
        )
        .padding(.vertical, 4)
      }

      Text(screenshotFooter)
        .font(.caption)
        .foregroundStyle(SBTheme.secondaryInk)
        .fixedSize(horizontal: false, vertical: true)
    } header: {
      Text("PROFILE SCREENSHOTS")
    }
  }

  private var auditCreditsSection: some View {
    Section {
      HStack {
        Text("Available credits")
          .font(.subheadline.weight(.medium))
        Spacer()
        Text(accessStatus)
          .font(.subheadline.weight(.bold).monospacedDigit())
          .foregroundStyle(SBTheme.teal)
      }
      .frame(minHeight: 44)

      Button {
        model.requestedTabIdentifier = "account"
        model.deepLinkRevision += 1
      } label: {
        Label("Manage plan in Account", systemImage: "person.crop.circle")
      }
      .frame(minHeight: 44, alignment: .leading)
      .accessibilityIdentifier("audit.accountButton")
    } header: {
      Text("CREDITS")
    }
  }

  @ViewBuilder
  private var auditErrorSections: some View {
    if let error = model.lastError {
      Section {
        PremiumInlineError(message: error, retry: runAudit)
      }
    }
    if let result, result.status == "failed" {
      Section {
        PremiumInlineError(
          message: result.error ?? "The audit could not be completed. Try again.",
          retry: runAudit
        )
      }
    }
  }

  var body: some View {
    List {
      auditDatingSection

      auditProfileSection

      auditScreenshotsSection

      auditCreditsSection

      auditErrorSections
    }
    .scrollDismissesKeyboard(.interactively)
    .sbPageBackground()
    .scrollContentBackground(.hidden)
    .listStyle(.insetGrouped)
    .navigationTitle("Profile Audit")
    .navigationBarTitleDisplayMode(.large)
    .toolbar {
      ToolbarItem(placement: .topBarTrailing) { importButton }
    }
    .navigationDestination(item: $auditDestination) { destination in
      PremiumAuditResultDestination(analysis: destination.analysis, images: images, shareText: auditShareText)
    }
    .safeAreaInset(edge: .bottom, spacing: 0) {
      if auditDestination == nil {
        SBGlassCluster {
          Button {
            runAudit()
          } label: {
            if model.isBusy {
              HStack(spacing: 8) {
                ProgressView().tint(.white)
                Text("Reading profile…")
              }
            } else {
              Text("Run Audit")
            }
          }
          .buttonStyle(SBPrimaryButtonStyle())
          .disabled(model.isBusy || images.isEmpty)
          .opacity(images.isEmpty ? 0.48 : 1)
          .accessibilityIdentifier("audit.runButton")
        }
        .padding(.horizontal, 16)
        .padding(.top, 10)
        .padding(.bottom, 8)
        .background(.ultraThinMaterial)
      }
    }
    .overlay {
      if model.isBusy {
        PremiumAnalysisProgressOverlay(
          title: "Reading your profile",
          detail: "Reading your photos and prompts the way a first-time viewer would.",
          steps: ["Read screenshots", "Score photo order", "Draft bio and prompts", "Check ENM language"]
        )
      }
    }
    .onChange(of: pickerItems) { _, newValue in
      Task { images = await loadImages(from: newValue, limit: 10) }
    }
    .onChange(of: model.importRevision) { _, _ in applyPendingImport() }
    .onChange(of: isActive) { _, active in
      if active {
        applyScreenshotFixturesIfNeeded()
        applyPendingImport()
      }
    }
    .onAppear {
      applyScreenshotFixturesIfNeeded()
      applyPendingImport()
    }
  }

  private var auditShareText: String {
    guard let analysis = result?.analysis else { return "SwipeBetter profile audit" }
    return [
      "SwipeBetter \(analysis.platform ?? "profile") audit",
      analysis.overallScore.map { "Score: \($0)/100" },
      analysis.firstTip,
      analysis.improvements,
    ]
    .compactMap { $0 }
    .joined(separator: "\n\n")
  }

  private func runAudit() {
    guard !model.isBusy, !images.isEmpty else { return }
    Task {
      let next = await model.startProfileAudit(
        platform: platform,
        gender: gender,
        intent: intent,
        enm: enm,
        images: images
      )
      result = next
      auditDestination = next?.analysis.map {
        PremiumAuditResultPayload(id: $0.stableId, analysis: $0)
      }
    }
  }

  private func applyScreenshotFixturesIfNeeded() {
    guard isActive, SwipeBetterScreenshotFixtures.isEnabled else { return }
    if images.isEmpty {
      images = [SwipeBetterScreenshotFixtures.profileScreenshotData]
    }
    if SwipeBetterScreenshotFixtures.tab == "auditResult", result == nil {
      result = SwipeBetterScreenshotFixtures.profileStatus
      auditDestination = result?.analysis.map {
        PremiumAuditResultPayload(id: $0.stableId, analysis: $0)
      }
    }
  }

  private func applyPendingImport() {
    guard isActive, appliedImportRevision != model.importRevision else { return }
    appliedImportRevision = model.importRevision
    guard model.pendingImportText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
          !model.pendingImportImages.isEmpty else { return }
    images = model.pendingImportImages
    model.consumePendingImport()
  }

  private func removeImage(at index: Int) {
    guard images.indices.contains(index) else { return }
    images.remove(at: index)
    pickerItems = []
  }
}

private struct PremiumAuditResultPayload: Identifiable, Hashable {
  let id: String
  let analysis: ProfileAnalysis

  static func == (lhs: PremiumAuditResultPayload, rhs: PremiumAuditResultPayload) -> Bool {
    lhs.id == rhs.id
  }

  func hash(into hasher: inout Hasher) {
    hasher.combine(id)
  }
}

private struct PremiumAuditResultDestination: View {
  let analysis: ProfileAnalysis
  let images: [Data]
  let shareText: String

  var body: some View {
    ScrollView {
      PremiumProfileResult(analysis: analysis, images: images)
        .padding(16)
        .padding(.bottom, 96)
    }
    .scrollDismissesKeyboard(.interactively)
    .sbPageBackground()
    .navigationTitle("\(analysis.platform ?? "Profile") · Today")
    .navigationBarTitleDisplayMode(.inline)
    .toolbar {
      ToolbarItem(placement: .topBarTrailing) {
        ShareLink(item: shareText) { Text("Share") }
      }
    }
  }
}

private struct PremiumReplyResultPayload: Identifiable, Hashable {
  let id: String
  let context: String?
  let replies: [String]
  let metadata: String
}

private struct PremiumReplyResultDestination: View {
  @Environment(AppModel.self) private var model
  let context: String?
  let replies: [String]
  let metadata: String
  let onRedo: () -> Void
  @State private var showingRedoConfirmation = false

  private var isUnlimited: Bool {
    model.credits?.isUnlimited == true
      || model.credits?.planTier?.lowercased() == "unlimited"
      || model.me?.proActive == true
  }

  private var availableCredits: Int {
    model.credits?.credits ?? model.me?.oneTimeCredits ?? 0
  }

  private var redoCreditMessage: String {
    if isUnlimited {
      return "Unlimited access is not charged a finite credit for this request."
    }
    if availableCredits <= 0 {
      return "Reply coaching uses 1 credit. No credits are currently available; the server will confirm access."
    }
    if availableCredits == 1 {
      return "Reply coaching uses 1 credit. This is your last available credit."
    }
    return "Reply coaching uses 1 credit. You have \(availableCredits) credits available."
  }

  private var redoActionTitle: String {
    isUnlimited ? "Redo" : "Redo (1 credit)"
  }

  var body: some View {
    ScrollView {
      PremiumReplyResults(context: context, replies: replies, metadata: metadata)
        .padding(16)
        .padding(.bottom, 96)
    }
    .scrollDismissesKeyboard(.interactively)
    .sbPageBackground()
    .navigationTitle("\(replies.count) replies")
    .navigationBarTitleDisplayMode(.inline)
    .toolbar {
      ToolbarItem(placement: .topBarTrailing) {
        Button("Redo") { showingRedoConfirmation = true }
          .disabled(model.isBusy)
      }
    }
    .confirmationDialog(
      "Generate fresh replies?",
      isPresented: $showingRedoConfirmation,
      titleVisibility: .visible
    ) {
      Button(redoActionTitle) { onRedo() }
      Button("Cancel", role: .cancel) {}
    } message: {
      Text(redoCreditMessage)
    }
  }
}

struct PremiumReplyAssistantView: View {
  @Environment(AppModel.self) private var model
  let isActive: Bool
  @State private var tone = "flirty"
  @State private var goal = "keep_going"
  @State private var enm = false
  @State private var conversation = ""
  @State private var pickerItems: [PhotosPickerItem] = []
  @State private var images: [Data] = []
  @State private var response: ReplyAnalysisResponse?
  @State private var replyDestination: PremiumReplyResultPayload?
  @State private var appliedImportRevision = -1
  @State private var inputMode = "text"

  private let goals = [
    "first_impression": "First message",
    "keep_going": "Keep it going",
    "ask_out": "Ask them out",
    "revive": "Revive chat",
  ]

  private var canGenerate: Bool {
    if inputMode == "text" {
      return !conversation.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
    return !images.isEmpty
  }

  private var toneLabel: String {
    ["flirty": "Warm", "witty": "Playful", "confident": "Direct", "thoughtful": "Sincere"][tone] ?? tone.capitalized
  }

  private var goalLabel: String {
    goals[goal] ?? goal
  }

  private var accessStatus: String {
    if isUnlimited {
      return "Unlimited"
    }
    let credits = model.credits?.credits ?? model.me?.oneTimeCredits ?? 0
    return "\(credits) \(credits == 1 ? "credit" : "credits")"
  }

  private var isUnlimited: Bool {
    model.credits?.isUnlimited == true
      || model.credits?.planTier?.lowercased() == "unlimited"
      || model.me?.proActive == true
  }

  private var importButton: AnyView {
    AnyView(
      Menu {
        Button("Import shared chat", systemImage: "square.and.arrow.down") {
          model.loadSharedImport()
          applyPendingImport()
        }
        Button("Clear input", systemImage: "xmark.circle", role: .destructive) {
          conversation = ""
          images = []
          pickerItems = []
          response = nil
          replyDestination = nil
        }
      } label: {
        Image(systemName: "ellipsis")
          .font(.system(size: 18, weight: .semibold))
          .foregroundStyle(SBTheme.ink)
          .frame(width: 44, height: 44)
          .sbGlassControl(shape: Circle())
      }
      .accessibilityLabel("Reply options")
    )
  }

  private var repliesInputModeSection: some View {
    Section {
      Picker("Input", selection: $inputMode) {
        Text("Paste text").tag("text")
        Text("Screenshots").tag("screenshots")
      }
      .pickerStyle(.segmented)
      .accessibilityIdentifier("replies.inputModePicker")
    } header: {
      Text("INPUT MODE")
    }
  }

  private var repliesConversationSection: some View {
    Section {
      if inputMode == "text" {
        ZStack(alignment: .topLeading) {
          TextEditor(text: $conversation)
            .font(.body)
            .frame(minHeight: 150)
            .scrollContentBackground(.hidden)
            .accessibilityIdentifier("replies.conversationEditor")

          if conversation.isEmpty {
            Text("Paste the conversation here…")
              .font(.body)
              .foregroundStyle(SBTheme.secondaryInk.opacity(0.72))
              .padding(.horizontal, 5)
              .padding(.vertical, 8)
              .allowsHitTesting(false)
          }
        }
      } else if !images.isEmpty {
        PremiumScreenshotStrip(images: images, onRemove: removeImage)
          .padding(.vertical, 4)
      } else {
        Text("Select up to three screenshots from the conversation.")
          .font(.subheadline)
          .foregroundStyle(SBTheme.secondaryInk)
          .frame(maxWidth: .infinity, minHeight: 92, alignment: .center)
      }

      Divider()

      HStack {
        Button {
          if let pasted = UIPasteboard.general.string, !pasted.isEmpty {
            conversation = String(pasted.prefix(5000))
            inputMode = "text"
          }
        } label: {
          Label("Paste", systemImage: "doc.on.clipboard")
        }
        .foregroundStyle(SBTheme.accentPressed)
        .frame(minHeight: 44)
        .disabled(inputMode != "text")

        Spacer()

        PhotosPicker(selection: $pickerItems, maxSelectionCount: 3, matching: .images) {
          Label(images.isEmpty ? "Add screenshot" : "Add more", systemImage: "plus.circle")
        }
        .foregroundStyle(SBTheme.accentPressed)
        .frame(minHeight: 44)
        .accessibilityIdentifier("replies.addScreenshotsButton")
      }
    } header: {
      Text("CONVERSATION")
    }
  }

  private var repliesContextSection: some View {
    Section {
      Picker("Tone", selection: $tone) {
        Text("Warm").tag("flirty")
        Text("Playful").tag("witty")
        Text("Direct").tag("confident")
        Text("Sincere").tag("thoughtful")
      }
      .pickerStyle(.segmented)

      Menu {
        ForEach(goals.sorted(by: { $0.value < $1.value }), id: \.key) { key, label in
          Button(label) { goal = key }
        }
      } label: {
        PremiumAuditValueRow(title: "Goal", value: goalLabel)
      }

      Toggle("ENM / poly context", isOn: $enm)
        .font(.subheadline.weight(.medium))
        .tint(SBTheme.accent)
        .frame(minHeight: 44)

      HStack {
        Text("Credits")
          .font(.subheadline.weight(.medium))
        Spacer()
        Text(isUnlimited ? "Unlimited" : accessStatus)
          .font(.subheadline.weight(.semibold).monospacedDigit())
          .foregroundStyle(SBTheme.teal)
      }
      .frame(minHeight: 44)
    } header: {
      Text("CONTEXT")
    }
  }

  @ViewBuilder
  private var repliesErrorSection: some View {
    if let error = model.lastError {
      Section {
        PremiumInlineError(message: error, retry: generateReplies)
      }
    }
  }

  var body: some View {
    List {
      repliesInputModeSection
      repliesConversationSection
      repliesContextSection

      repliesErrorSection
    }
    .scrollDismissesKeyboard(.interactively)
    .sbPageBackground()
    .scrollContentBackground(.hidden)
    .listStyle(.insetGrouped)
    .navigationTitle("Replies")
    .navigationBarTitleDisplayMode(.large)
    .toolbar { ToolbarItem(placement: .topBarTrailing) { importButton } }
    .navigationDestination(item: $replyDestination) { destination in
      PremiumReplyResultDestination(
        context: destination.context,
        replies: destination.replies,
        metadata: destination.metadata,
        onRedo: redoReplies
      )
    }
    .safeAreaInset(edge: .bottom, spacing: 0) {
      SBGlassCluster {
        Button {
          generateReplies()
        } label: {
          if model.isBusy {
            HStack(spacing: 8) {
              ProgressView().tint(.white)
              Text("Reading the conversation…")
            }
          } else {
            Text("Generate Replies")
          }
        }
        .buttonStyle(SBPrimaryButtonStyle())
        .disabled(model.isBusy || !canGenerate)
        .opacity(canGenerate ? 1 : 0.48)
        .accessibilityIdentifier("replies.generateButton")
      }
      .padding(.horizontal, 16)
      .padding(.top, 10)
      .padding(.bottom, 8)
      .background(.ultraThinMaterial)
    }
    .overlay {
      if model.isBusy {
        PremiumAnalysisProgressOverlay(
          title: "Reading your conversation",
          detail: "Looking for the natural next message without making you sound scripted.",
          steps: ["Read the conversation", "Find the tone", "Draft three replies"]
        )
      }
    }
    .onChange(of: pickerItems) { _, newValue in
      guard !newValue.isEmpty else { return }
      inputMode = "screenshots"
      Task { images = await loadImages(from: newValue, limit: 3) }
    }
    .onChange(of: model.importRevision) { _, _ in applyPendingImport() }
    .onChange(of: isActive) { _, active in
      if active {
        applyScreenshotFixturesIfNeeded()
        applyPendingImport()
      }
    }
    .onAppear {
      applyScreenshotFixturesIfNeeded()
      applyPendingImport()
    }
  }

  private func applyScreenshotFixturesIfNeeded() {
    guard isActive, SwipeBetterScreenshotFixtures.isEnabled else { return }
    if conversation.isEmpty {
      conversation = "Matched after a hiking prompt. They said they love last-minute tacos but have a busy week."
    }
    if images.isEmpty {
      images = [SwipeBetterScreenshotFixtures.chatScreenshotData]
    }
    if SwipeBetterScreenshotFixtures.tab == "replyResult", response == nil {
      setReplyResult(SwipeBetterScreenshotFixtures.replyResponse)
    }
  }

  private func setReplyResult(_ next: ReplyAnalysisResponse?) {
    response = next
    guard let next else {
      replyDestination = nil
      return
    }
    let replies = next.parsed?.suggestedReplies ?? next.analysis?.suggestedReplies ?? []
    guard !replies.isEmpty else {
      replyDestination = nil
      return
    }
    replyDestination = PremiumReplyResultPayload(
      id: "reply-\(UUID().uuidString)",
      context: next.parsed?.conversationContext ?? next.analysis?.conversationContext,
      replies: replies,
      metadata: "\(toneLabel) · \(goalLabel)"
    )
  }

  private func redoReplies() {
    guard !model.isBusy, canGenerate else { return }
    Task {
      let next = await model.generateReplies(
        tone: tone,
        goal: goal,
        enm: enm,
        conversationText: activeConversationText,
        images: activeImages
      )
      guard let next,
            let replies = next.parsed?.suggestedReplies ?? next.analysis?.suggestedReplies,
            !replies.isEmpty else { return }
      setReplyResult(next)
    }
  }

  private func generateReplies() {
    guard !model.isBusy, canGenerate else { return }
    Task {
      let next = await model.generateReplies(
        tone: tone,
        goal: goal,
        enm: enm,
        conversationText: activeConversationText,
        images: activeImages
      )
      setReplyResult(next)
    }
  }

  private var activeConversationText: String {
    inputMode == "text" ? conversation : ""
  }

  private var activeImages: [Data] {
    inputMode == "screenshots" ? images : []
  }

  private func applyPendingImport() {
    guard isActive, appliedImportRevision != model.importRevision else { return }
    appliedImportRevision = model.importRevision
    var applied = false
    if !model.pendingImportText.isEmpty {
      conversation = model.pendingImportText
      inputMode = "text"
      applied = true
    }
    if !model.pendingImportImages.isEmpty {
      images = model.pendingImportImages
      if model.pendingImportText.isEmpty {
        inputMode = "screenshots"
      }
      applied = true
    }
    if applied { model.consumePendingImport() }
  }

  private func removeImage(at index: Int) {
    guard images.indices.contains(index) else { return }
    images.remove(at: index)
    pickerItems = []
  }
}

struct PremiumUsageStatus: View {
  @Environment(AppModel.self) private var model
  let title: String
  let detail: String
  let systemImage: String

  private var isUnlimited: Bool {
    if model.credits?.isUnlimited == true || model.credits?.planTier?.lowercased() == "unlimited" {
      return true
    }
    return model.me?.proActive == true
  }

  private var credits: Int {
    model.credits?.credits ?? model.me?.oneTimeCredits ?? 0
  }

  var body: some View {
    SBStatusBanner(
      title: title,
      detail: detail,
      status: isUnlimited ? "Unlimited" : "\(credits) \(credits == 1 ? "credit" : "credits")",
      systemImage: systemImage,
      positive: isUnlimited || credits > 0
    )
  }
}

private struct PremiumAuditValueRow: View {
  let title: String
  let value: String

  var body: some View {
    HStack {
      Text(title)
        .font(.subheadline.weight(.medium))
      Spacer()
      Text(value)
        .font(.subheadline)
        .foregroundStyle(SBTheme.secondaryInk)
      Image(systemName: "chevron.up.chevron.down")
        .font(.caption.weight(.semibold))
        .foregroundStyle(SBTheme.secondaryInk)
    }
    .frame(minHeight: 44)
  }
}

struct PremiumImageDropzone: View {
  let title: String
  let detail: String
  let systemImage: String

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      HStack(spacing: 8) {
        ForEach(0..<3, id: \.self) { _ in
          RoundedRectangle(cornerRadius: 9, style: .continuous)
            .fill(SBTheme.surfaceMuted)
            .aspectRatio(9.0 / 16.0, contentMode: .fit)
            .overlay {
              Image(systemName: systemImage)
                .font(.caption)
                .foregroundStyle(SBTheme.secondaryInk)
            }
        }

        Image(systemName: "plus")
          .font(.headline)
          .foregroundStyle(SBTheme.accentPressed)
          .frame(maxWidth: .infinity)
          .aspectRatio(9.0 / 16.0, contentMode: .fit)
      }

      Text(title)
        .font(.subheadline.weight(.semibold))
        .foregroundStyle(SBTheme.ink)

      Text(detail)
        .font(.caption)
        .foregroundStyle(SBTheme.secondaryInk)
    }
    .frame(maxWidth: .infinity)
  }
}

struct PremiumScreenshotStrip: View {
  let images: [Data]
  let onRemove: (Int) -> Void
  let addContent: AnyView?

  init(images: [Data], onRemove: @escaping (Int) -> Void, addContent: AnyView? = nil) {
    self.images = images
    self.onRemove = onRemove
    self.addContent = addContent
  }

  var body: some View {
    LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 4), spacing: 8) {
        ForEach(Array(images.enumerated()), id: \.offset) { index, data in
          ZStack(alignment: .topTrailing) {
            if let image = UIImage(data: data) {
              Image(uiImage: image)
                .resizable()
                .scaledToFill()
                .frame(maxWidth: .infinity)
                .aspectRatio(9.0 / 16.0, contentMode: .fit)
                .clipShape(RoundedRectangle(cornerRadius: 9, style: .continuous))
            }

            Button {
              onRemove(index)
            } label: {
              Image(systemName: "xmark")
                .font(.caption.weight(.bold))
                .foregroundStyle(.white)
                .frame(width: 26, height: 26)
                .background(Color.black.opacity(0.72))
                .clipShape(Circle())
                .frame(width: 44, height: 44)
            }
            .offset(x: 6, y: -6)
            .accessibilityLabel("Remove screenshot \(index + 1)")
          }
        }

        if let addContent {
          addContent
            .aspectRatio(9.0 / 16.0, contentMode: .fit)
            .clipShape(RoundedRectangle(cornerRadius: 9, style: .continuous))
        }
    }
  }
}

private struct PremiumAnalysisProgressOverlay: View {
  let title: String
  let detail: String
  let steps: [String]
  @Environment(\.accessibilityReduceMotion) private var reduceMotion
  @State private var ringRotation = 0.0
  @State private var ringScale = 1.0

  var body: some View {
    ZStack {
      Color(uiColor: .systemGroupedBackground)
        .ignoresSafeArea()

      VStack(spacing: 24) {
        ZStack {
          Circle()
            .fill(.regularMaterial)
            .overlay(Circle().stroke(Color.white.opacity(0.78), lineWidth: 1))
            .shadow(color: .black.opacity(0.14), radius: 24, y: 12)

          Circle()
            .trim(from: 0.04, to: 0.82)
            .stroke(SBTheme.accent, style: StrokeStyle(lineWidth: 7, lineCap: .round))
            .rotationEffect(.degrees(ringRotation))
            .padding(10)

          Circle()
            .trim(from: 0.52, to: 0.94)
            .stroke(SBTheme.teal, style: StrokeStyle(lineWidth: 3, lineCap: .round))
            .rotationEffect(.degrees(-ringRotation * 0.7))
            .padding(25)

          Image(systemName: "sparkles")
            .font(.system(size: 34, weight: .semibold))
            .foregroundStyle(SBTheme.accent)
        }
        .frame(width: 216, height: 216)
        .scaleEffect(ringScale)

        VStack(spacing: 8) {
          Text(title)
            .font(.title3.weight(.bold))
            .foregroundStyle(SBTheme.ink)
          Text(detail)
            .font(.body)
            .foregroundStyle(SBTheme.secondaryInk)
            .multilineTextAlignment(.center)
            .fixedSize(horizontal: false, vertical: true)
            .frame(maxWidth: 300)
        }

        VStack(spacing: 0) {
          ForEach(Array(steps.enumerated()), id: \.offset) { index, step in
            HStack(spacing: 12) {
              if index == 0 {
                ProgressView()
                  .tint(SBTheme.accent)
                  .frame(width: 20, height: 20)
              } else {
                Circle()
                  .stroke(SBTheme.secondaryInk.opacity(0.28), lineWidth: 2)
                  .frame(width: 20, height: 20)
              }
              Text(step)
                .font(.body)
                .foregroundStyle(index == 0 ? SBTheme.ink : SBTheme.secondaryInk)
              Spacer(minLength: 0)
            }
            .frame(minHeight: 48)
            if index < steps.count - 1 {
              Divider().padding(.leading, 32)
            }
          }
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 8)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        .overlay {
          RoundedRectangle(cornerRadius: 24, style: .continuous)
            .stroke(Color.white.opacity(0.72), lineWidth: 1)
        }
        .padding(.horizontal, 16)
      }
      .padding(.top, 44)
      .padding(.bottom, 96)
    }
    .accessibilityElement(children: .contain)
    .accessibilityLabel(title)
    .onAppear {
      guard !reduceMotion else { return }
      withAnimation(.linear(duration: 1.15).repeatForever(autoreverses: false)) {
        ringRotation = 360
      }
      withAnimation(.easeInOut(duration: 2.25).repeatForever(autoreverses: true)) {
        ringScale = 1.045
      }
    }
  }
}

struct PremiumProfileResult: View {
  let analysis: ProfileAnalysis
  let images: [Data]

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      SBSurface {
        HStack(spacing: 14) {
          ZStack {
            Circle()
              .stroke(SBTheme.surfaceMuted, lineWidth: 8)
            Circle()
              .trim(from: 0, to: CGFloat(min(max(analysis.overallScore ?? 0, 0), 100)) / 100)
              .stroke(SBTheme.accent, style: StrokeStyle(lineWidth: 8, lineCap: .round))
              .rotationEffect(.degrees(-90))
            Text("\(analysis.overallScore ?? 0)")
              .font(.title2.weight(.bold).monospacedDigit())
              .foregroundStyle(SBTheme.ink)
          }
          .frame(width: 86, height: 86)

          VStack(alignment: .leading, spacing: 4) {
            Text("Overall score")
              .font(.headline)
              .foregroundStyle(SBTheme.ink)
            Text(scoreSummary(analysis.overallScore ?? 0))
              .font(.subheadline)
              .foregroundStyle(SBTheme.secondaryInk)
          }
          Spacer()
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Overall score")
        .accessibilityValue("\(analysis.overallScore ?? 0) out of 100. \(scoreSummary(analysis.overallScore ?? 0))")
      }

      PremiumAuditPlanCard(number: 1, title: "First fix", text: analysis.firstTip)
      PremiumAuditFixesCard(text: analysis.improvements)
      PremiumAuditPlanCard(number: 2, title: "New bio", text: analysis.bioSuggestions)
      PremiumAuditPlanCard(number: 3, title: "Photo feedback", text: analysis.photoFeedback)
      if !images.isEmpty {
        PremiumReviewedPhotoStrip(images: images)
      }

      Text("Saved to History")
        .font(.caption)
        .foregroundStyle(SBTheme.secondaryInk)
        .frame(maxWidth: .infinity, alignment: .center)
    }
  }

  private func scoreSummary(_ score: Int) -> String {
    switch score {
    case 85...: return "Strong profile. Tighten the details."
    case 70..<85: return "Good foundation with clear wins available."
    default: return "Focus on the first two changes for the biggest lift."
    }
  }

}

private struct PremiumAuditFixesCard: View {
  let text: String?
  @State private var copiedIndex: Int?

  var body: some View {
    let items = PremiumResultText.items(from: text)
    if !items.isEmpty {
      SBSurface {
        VStack(alignment: .leading, spacing: 10) {
          Text("FIX THESE FIRST")
            .font(.caption.weight(.bold))
            .tracking(0.6)
            .foregroundStyle(SBTheme.secondaryInk)
          ForEach(Array(items.enumerated()), id: \.offset) { index, item in
            VStack(alignment: .leading, spacing: 8) {
              HStack(alignment: .top, spacing: 10) {
              Text("\(index + 1)")
                .font(.caption.weight(.bold))
                .foregroundStyle(.white)
                .frame(width: 24, height: 24)
                .background(SBTheme.primaryActionFill, in: Circle())
              Text(item)
                .font(.subheadline)
                .foregroundStyle(SBTheme.ink)
                .fixedSize(horizontal: false, vertical: true)
              Spacer(minLength: 0)
              }
              Button {
                UIPasteboard.general.string = item
                copiedIndex = index
                UIAccessibility.post(notification: .announcement, argument: "Fix copied")
              } label: {
                Text(copiedIndex == index ? "Copied" : "Copy")
                  .font(.caption.weight(.semibold))
                  .foregroundStyle(SBTheme.accentPressed)
                  .padding(.horizontal, 14)
                  .frame(minHeight: 44)
                  .background(SBTheme.accentSoft, in: Capsule())
              }
              .buttonStyle(.plain)
              .accessibilityIdentifier("audit.copyButton.fixes.\(index)")
            }
          }
        }
      }
    }
  }
}

private struct PremiumReviewedPhotoStrip: View {
  let images: [Data]

  var body: some View {
    SBSurface {
      VStack(alignment: .leading, spacing: 8) {
        Text("REVIEWED PHOTOS")
          .font(.caption.weight(.bold))
          .tracking(0.6)
          .foregroundStyle(SBTheme.secondaryInk)
        ScrollView(.horizontal, showsIndicators: false) {
          HStack(spacing: 8) {
            ForEach(Array(images.enumerated()), id: \.offset) { _, data in
              if let image = UIImage(data: data) {
                Image(uiImage: image)
                  .resizable()
                  .scaledToFill()
                  .frame(width: 58, height: 88)
                  .clipShape(RoundedRectangle(cornerRadius: 9, style: .continuous))
              }
            }
          }
        }
        .frame(height: 88)
      }
    }
  }
}

private struct PremiumAuditPlanCard: View {
  let number: Int
  let title: String
  let text: String?
  @State private var copiedItem: Int?

  var body: some View {
    let items = PremiumResultText.items(from: text)
    if !items.isEmpty {
      SBSurface {
        VStack(alignment: .leading, spacing: 8) {
          HStack(spacing: 10) {
            Text("\(number)")
              .font(.caption.weight(.bold))
              .foregroundStyle(SBTheme.accentPressed)
              .frame(width: 28, height: 28)
              .background(SBTheme.accentSoft, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
            Text(title)
              .font(.subheadline.weight(.bold))
              .foregroundStyle(SBTheme.ink)
          }
          ForEach(Array(items.enumerated()), id: \.offset) { itemIndex, item in
            VStack(alignment: .leading, spacing: 8) {
              Text(item)
                .font(.subheadline)
                .foregroundStyle(SBTheme.secondaryInk)
                .fixedSize(horizontal: false, vertical: true)
                .textSelection(.enabled)

              Button {
                copy(item, at: itemIndex)
              } label: {
                Label(copiedItem == itemIndex ? "Copied" : "Copy", systemImage: copiedItem == itemIndex ? "checkmark" : "doc.on.doc")
                  .font(.caption.weight(.semibold))
                  .foregroundStyle(SBTheme.accentPressed)
                  .padding(.horizontal, 14)
                  .frame(minHeight: 44)
                  .background(SBTheme.accentSoft, in: Capsule())
              }
              .buttonStyle(.plain)
              .accessibilityLabel(copiedItem == itemIndex ? "\(title) copied" : "Copy \(title.lowercased())")
              .accessibilityIdentifier("audit.copyButton.\(number).\(itemIndex)")
            }
          }
        }
      }
    }
  }

  private func copy(_ value: String, at itemIndex: Int) {
    UIPasteboard.general.string = value
    copiedItem = itemIndex
    UIAccessibility.post(notification: .announcement, argument: "\(title) copied")
    Task {
      try? await Task.sleep(for: .seconds(2))
      if copiedItem == itemIndex { copiedItem = nil }
    }
  }
}

struct PremiumResultBlock: View {
  let index: Int
  let title: String
  let text: String?
  @State private var copiedItem: Int?

  private var items: [String] {
    PremiumResultText.items(from: text)
  }

  var body: some View {
    if !items.isEmpty {
      VStack(alignment: .leading, spacing: 8) {
        SBDivider()
          .padding(.vertical, 12)

        HStack(alignment: .top, spacing: 10) {
          Text("\(index)")
            .font(.caption.weight(.bold))
            .foregroundStyle(SBTheme.accent)
            .frame(width: 26, height: 26)
            .background(SBTheme.accentSoft)
            .clipShape(RoundedRectangle(cornerRadius: 5, style: .continuous))

          VStack(alignment: .leading, spacing: 5) {
            Text(title)
              .font(.subheadline.weight(.bold))
              .foregroundStyle(SBTheme.ink)

            ForEach(Array(items.enumerated()), id: \.offset) { itemIndex, item in
              VStack(alignment: .leading, spacing: 8) {
                if items.count > 1 {
                  Text("Option \(itemIndex + 1)")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(SBTheme.accent)
                }

                Text(item)
                  .font(.subheadline)
                  .foregroundStyle(SBTheme.secondaryInk)
                  .fixedSize(horizontal: false, vertical: true)
                  .textSelection(.enabled)

                Button {
                  copy(item, at: itemIndex)
                } label: {
                  Label(
                    copiedItem == itemIndex ? "Copied" : (items.count > 1 ? "Copy option" : "Copy"),
                    systemImage: copiedItem == itemIndex ? "checkmark" : "doc.on.doc"
                  )
                }
                .buttonStyle(SBSecondaryButtonStyle())
                .accessibilityLabel(copiedItem == itemIndex ? "\(title) copied" : "Copy \(title.lowercased())")
              }
              .padding(.top, itemIndex == 0 ? 2 : 10)
            }
          }
        }
      }
    }
  }

  private func copy(_ value: String, at itemIndex: Int) {
    UIPasteboard.general.string = value
    copiedItem = itemIndex
    UIAccessibility.post(notification: .announcement, argument: "\(title) copied")
    Task {
      try? await Task.sleep(for: .seconds(2))
      if copiedItem == itemIndex {
        copiedItem = nil
      }
    }
  }
}

private struct PremiumReplyEditTarget: Identifiable {
  let id: Int
}

struct PremiumReplyResults: View {
  let context: String?
  let replies: [String]
  let metadata: String
  @State private var draftReplies: [String]
  @State private var copiedIndex: Int?
  @State private var copyTask: Task<Void, Never>?
  @State private var editingTarget: PremiumReplyEditTarget?
  @State private var editText = ""
  @State private var hasLocalEdits = false

  init(context: String?, replies: [String], metadata: String) {
    self.context = context
    self.replies = replies
    self.metadata = metadata
    _draftReplies = State(initialValue: replies)
  }

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      VStack(alignment: .leading, spacing: 6) {
        Text("CONVERSATION INSIGHT")
          .font(.caption.weight(.bold))
          .tracking(0.6)
          .foregroundStyle(SBTheme.teal)
        Text(context ?? "A clear next move is ready.")
          .font(.subheadline)
          .foregroundStyle(SBTheme.ink)
          .fixedSize(horizontal: false, vertical: true)
      }
      .padding(14)
      .frame(maxWidth: .infinity, alignment: .leading)
      .background(SBTheme.tealSoft, in: RoundedRectangle(cornerRadius: 14, style: .continuous))

      ForEach(Array(draftReplies.enumerated()), id: \.offset) { index, reply in
        SBSurface {
          VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 8) {
              Text("Option \(index + 1)")
                .font(.caption.weight(.bold))
                .foregroundStyle(SBTheme.accentPressed)
              Text(metadata)
                .font(.caption)
                .foregroundStyle(SBTheme.secondaryInk)
            }

            Text(reply)
              .font(.body.weight(.medium))
              .foregroundStyle(SBTheme.ink)
              .fixedSize(horizontal: false, vertical: true)
              .textSelection(.enabled)
              .contextMenu {
                Button("Edit reply", systemImage: "pencil") {
                  editText = reply
                  editingTarget = PremiumReplyEditTarget(id: index)
                }
              }

            Button {
              copy(reply, at: index)
            } label: {
              HStack(spacing: 8) {
                Text("Copy reply")
                if copiedIndex == index {
                  Text("Copied")
                    .foregroundStyle(SBTheme.teal)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(SBTheme.tealSoft, in: Capsule())
                }
              }
              .font(.subheadline.weight(.semibold))
              .foregroundStyle(SBTheme.accentPressed)
              .padding(.horizontal, 16)
              .frame(minHeight: 44)
              .background(SBTheme.accentSoft, in: Capsule())
            }
            .accessibilityLabel(copiedIndex == index ? "Reply \(index + 1) copied" : "Copy reply \(index + 1)")
            .accessibilityIdentifier("replies.copyButton.\(index + 1)")
          }
        }
      }

      Text(hasLocalEdits ? "Edits are local and not saved to History" : "Saved to History")
        .font(.caption)
        .foregroundStyle(SBTheme.secondaryInk)
        .frame(maxWidth: .infinity, alignment: .center)
        .padding(.top, 4)
    }
    .sheet(item: $editingTarget) { target in
      NavigationStack {
        TextEditor(text: $editText)
          .padding(16)
          .navigationTitle("Edit reply")
          .navigationBarTitleDisplayMode(.inline)
          .toolbar {
            ToolbarItem(placement: .cancellationAction) {
              Button("Cancel") { editingTarget = nil }
            }
            ToolbarItem(placement: .confirmationAction) {
              Button("Save") {
                guard draftReplies.indices.contains(target.id) else {
                  editingTarget = nil
                  return
                }
                draftReplies[target.id] = editText
                hasLocalEdits = true
                editingTarget = nil
              }
              .fontWeight(.semibold)
            }
          }
      }
      .presentationDetents([.medium, .large])
    }
  }

  private func copy(_ reply: String, at index: Int) {
    UIPasteboard.general.string = reply
    copiedIndex = index
    copyTask?.cancel()
    UIAccessibility.post(notification: .announcement, argument: "Reply \(index + 1) copied")
    copyTask = Task {
      try? await Task.sleep(for: .seconds(2))
      if !Task.isCancelled, copiedIndex == index {
        copiedIndex = nil
      }
    }
  }
}

struct PremiumInlineError: View {
  let message: String
  var retry: (() -> Void)? = nil

  var body: some View {
    VStack(alignment: .leading, spacing: 10) {
      Label {
        Text(message)
          .font(.subheadline.weight(.medium))
      } icon: {
        Image(systemName: "exclamationmark.triangle.fill")
      }
      .foregroundStyle(SBTheme.accentPressed)

      if let retry {
        Button("Try again", action: retry)
          .font(.subheadline.weight(.semibold))
          .foregroundStyle(SBTheme.accentPressed)
          .frame(minHeight: 44)
          .accessibilityIdentifier("inlineError.retryButton")
      }
    }
    .padding(14)
    .frame(maxWidth: .infinity, alignment: .leading)
    .background(SBTheme.accentSoft)
    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
  }
}
