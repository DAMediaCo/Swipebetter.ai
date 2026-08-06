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
      } label: {
        Image(systemName: "person.crop.circle")
          .font(.system(size: 18, weight: .semibold))
          .foregroundStyle(SBTheme.ink)
          .frame(width: 44, height: 44)
          .sbGlassControl(shape: Circle())
      }
      .accessibilityLabel("Profile and import options")
    )
  }

  private var datingContextSection: some View {
    VStack(spacing: 10) {
      SBSectionHeader(
        title: "Dating App",
        detail: nil
      )

      SBSurface {
        SBSelectRow(title: "App", selection: $platform) {
          ForEach(platforms, id: \.self) { Text($0) }
        }
      }

      SBSectionHeader(title: "Your Profile", detail: nil)

      SBSurface {
        VStack(spacing: 2) {
          SBSelectRow(title: "Gender", selection: $gender) {
            ForEach(genders, id: \.self) { Text($0) }
          }
          SBDivider()
          SBSelectRow(title: "Looking for", selection: $intent) {
            ForEach(intents, id: \.self) { Text($0) }
          }
          SBDivider()
          Toggle("Open to ENM / poly", isOn: $enm)
            .font(.subheadline.weight(.medium))
            .tint(SBTheme.accent)
            .frame(minHeight: 44)
          Text("Partner photos are expected. We review them in the context of your ENM/poly profile.")
            .font(.caption)
            .foregroundStyle(SBTheme.secondaryInk)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.bottom, 8)
        }
      }
    }
    .padding(.horizontal, 16)
  }

  var body: some View {
    ScrollView {
      LazyVStack(spacing: 24) {
        if result?.analysis == nil {
          SBWorkspaceHeader(
            eyebrow: "Profile lab",
            title: "Profile Audit",
            detail: "Add your profile screenshots and get a focused edit plan.",
            systemImage: "person.crop.rectangle.stack",
            status: accessStatus,
            trailing: importButton
          )
        } else {
          auditResultNavigation
        }

        if result?.analysis == nil && result?.status != "failed" {
          datingContextSection

        VStack(spacing: 10) {
          SBSectionHeader(
            title: "Profile Screenshots",
            detail: "Up to 10 screenshots, in the order people see them."
          )

          SBSurface {
            VStack(spacing: 14) {
              if images.isEmpty {
                PhotosPicker(selection: $pickerItems, maxSelectionCount: 10, matching: .images) {
                  PremiumImageDropzone(
                    title: "Add profile screenshots",
                    detail: "Photos, prompts, bio, and interests",
                    systemImage: "photo.stack"
                  )
                }
                .buttonStyle(.plain)
                .accessibilityIdentifier("audit.addScreenshotsButton")
              } else {
                PremiumScreenshotStrip(
                  images: images,
                  onRemove: removeImage,
                  addContent: AnyView(
                    PhotosPicker(selection: $pickerItems, maxSelectionCount: max(10 - images.count, 1), matching: .images) {
                      Image(systemName: "plus")
                        .font(.headline.weight(.semibold))
                        .foregroundStyle(SBTheme.accentPressed)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(SBTheme.surfaceMuted, in: RoundedRectangle(cornerRadius: 9, style: .continuous))
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("Add more screenshots")
                    .accessibilityIdentifier("audit.addScreenshotsButton")
                  )
                )

              }
            }
          }
        }
        .padding(.horizontal, 16)

          SBSurface {
            HStack {
              Text("Credits")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(SBTheme.ink)
              Spacer()
              Text(accessStatus)
                .font(.subheadline.weight(.bold).monospacedDigit())
                .foregroundStyle(SBTheme.teal)
            }
          }
          .padding(.horizontal, 16)
        }

        if let analysis = result?.analysis {
          PremiumProfileResult(analysis: analysis, images: images)
            .padding(.horizontal, 16)
            .transition(.move(edge: .bottom).combined(with: .opacity))
        } else if let result, result.status == "failed" {
          PremiumInlineError(message: result.error ?? "The audit could not be completed. Try again.")
            .padding(.horizontal, 16)
        }
      }
      .padding(.bottom, 112)
    }
    .scrollDismissesKeyboard(.interactively)
    .sbPageBackground()
    .navigationBarHidden(true)
    .safeAreaInset(edge: .bottom, spacing: 0) {
      if result?.analysis == nil {
        SBGlassCluster {
          Button {
            Task {
              result = await model.startProfileAudit(
                platform: platform,
                gender: gender,
                intent: intent,
                enm: enm,
                images: images
              )
            }
          } label: {
            Text("Run Audit")
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

  private var auditResultNavigation: some View {
    HStack(spacing: 12) {
      Button {
        result = nil
      } label: {
        Label("Audit", systemImage: "chevron.left")
          .font(.subheadline.weight(.semibold))
          .frame(minWidth: 64, minHeight: 44, alignment: .leading)
      }
      .foregroundStyle(SBTheme.accentPressed)
      .accessibilityLabel("Back to audit inputs")

      Spacer()
      Text("\(result?.analysis?.platform ?? "Profile") · Today")
        .font(.subheadline.weight(.semibold))
        .foregroundStyle(SBTheme.ink)
      Spacer()

      ShareLink(item: auditShareText) {
        Text("Share")
      }
        .font(.subheadline.weight(.semibold))
        .foregroundStyle(SBTheme.accentPressed)
        .frame(minWidth: 44, minHeight: 44)
    }
    .padding(.horizontal, 16)
    .frame(height: 64)
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

  private func applyScreenshotFixturesIfNeeded() {
    guard isActive, SwipeBetterScreenshotFixtures.isEnabled else { return }
    if images.isEmpty {
      images = [SwipeBetterScreenshotFixtures.profileScreenshotData]
    }
    if SwipeBetterScreenshotFixtures.tab == "auditResult", result == nil {
      result = SwipeBetterScreenshotFixtures.profileStatus
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
  @State private var appliedImportRevision = -1
  @State private var inputMode = "text"

  private let tones = ["flirty", "witty", "confident", "thoughtful"]
  private let goals = [
    "first_impression": "First message",
    "keep_going": "Keep it going",
    "ask_out": "Ask them out",
    "revive": "Revive chat",
  ]

  private var canGenerate: Bool {
    !conversation.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || !images.isEmpty
  }

  private var replyResultAvailable: Bool {
    guard let response else { return false }
    return response.parsed != nil || response.analysis != nil
  }

  private var replyResultReplies: [String] {
    response?.parsed?.suggestedReplies ?? response?.analysis?.suggestedReplies ?? []
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
      } label: {
        Image(systemName: "person.crop.circle")
          .font(.system(size: 18, weight: .semibold))
          .foregroundStyle(SBTheme.ink)
          .frame(width: 44, height: 44)
          .sbGlassControl(shape: Circle())
      }
      .accessibilityLabel("Profile and import options")
    )
  }

  var body: some View {
    ScrollView {
      LazyVStack(spacing: 24) {
        if !replyResultAvailable {
          SBWorkspaceHeader(
            eyebrow: "Reply studio",
            title: "Replies",
            detail: "Bring the thread, choose a direction, and get three replies.",
            systemImage: "message.badge.waveform",
            status: accessStatus,
            trailing: importButton
          )
        } else {
          replyResultNavigation
        }

        if !replyResultAvailable {
          Picker("Input", selection: $inputMode) {
          Text("Paste text").tag("text")
          Text("Screenshots").tag("screenshots")
          }
          .pickerStyle(.segmented)
          .accessibilityIdentifier("replies.inputModePicker")
          .padding(.horizontal, 16)

        VStack(spacing: 10) {
          SBSectionHeader(
            title: "Conversation",
            detail: nil
          )

          SBSurface {
            VStack(spacing: 14) {
              if inputMode == "text" {
                ZStack(alignment: .topLeading) {
                  TextEditor(text: $conversation)
                    .font(.body)
                    .frame(minHeight: 150)
                    .scrollContentBackground(.hidden)
                    .padding(4)
                    .background(SBTheme.canvas)
                    .clipShape(RoundedRectangle(cornerRadius: 7, style: .continuous))
                    .overlay {
                      RoundedRectangle(cornerRadius: 7, style: .continuous)
                        .stroke(SBTheme.divider, lineWidth: 1)
                    }
                    .accessibilityIdentifier("replies.conversationEditor")

                  if conversation.isEmpty {
                    Text("Paste the conversation here…")
                      .font(.body)
                      .foregroundStyle(SBTheme.secondaryInk.opacity(0.72))
                      .padding(.horizontal, 10)
                      .padding(.vertical, 12)
                      .allowsHitTesting(false)
                  }
                }

                Button {
                  if let pasted = UIPasteboard.general.string, !pasted.isEmpty {
                    conversation = String(pasted.prefix(5000))
                  }
                } label: {
                  Label("Paste", systemImage: "doc.on.clipboard")
                }
                .foregroundStyle(SBTheme.accentPressed)
                .frame(minHeight: 44)
              } else {
                if !images.isEmpty {
                  PremiumScreenshotStrip(images: images, onRemove: removeImage)
                } else {
                  Text("Select up to three screenshots from the conversation.")
                    .font(.subheadline)
                    .foregroundStyle(SBTheme.secondaryInk)
                    .frame(maxWidth: .infinity, minHeight: 92, alignment: .center)
                }

                PhotosPicker(selection: $pickerItems, maxSelectionCount: 3, matching: .images) {
                  Label(images.isEmpty ? "Add screenshot" : "Add more", systemImage: "plus.circle")
                }
                .foregroundStyle(SBTheme.accentPressed)
                .frame(minHeight: 44)
                .accessibilityIdentifier("replies.addScreenshotsButton")
              }
            }
          }
        }
        .padding(.horizontal, 16)

        VStack(spacing: 10) {
          SBSectionHeader(
            title: "Tone",
            detail: nil
          )

          Picker("Tone", selection: $tone) {
            Text("Warm").tag("flirty")
            Text("Playful").tag("witty")
            Text("Direct").tag("confident")
            Text("Sincere").tag("thoughtful")
          }
          .pickerStyle(.segmented)

          SBSurface {
            VStack(spacing: 2) {
              SBSelectRow(title: "Goal", selection: $goal) {
                ForEach(goals.sorted(by: { $0.value < $1.value }), id: \.key) { key, label in
                  Text(label).tag(key)
                }
              }
              SBDivider()
              Toggle("ENM / poly context", isOn: $enm)
                .font(.subheadline.weight(.medium))
                .tint(SBTheme.accent)
                .frame(minHeight: 44)
              SBDivider()
              HStack {
                Text("Credits")
                  .font(.subheadline.weight(.medium))
                Spacer()
                Text(isUnlimited ? "Unlimited" : accessStatus)
                  .font(.subheadline.weight(.semibold).monospacedDigit())
                  .foregroundStyle(SBTheme.teal)
              }
              .frame(minHeight: 44)
            }
          }
        }
        .padding(.horizontal, 16)

        }

        if replyResultAvailable {
          PremiumReplyResults(
            context: response?.parsed?.conversationContext ?? response?.analysis?.conversationContext,
            replies: replyResultReplies,
            metadata: "\(toneLabel) · \(goalLabel)"
          )
            .padding(.horizontal, 16)
            .transition(.move(edge: .bottom).combined(with: .opacity))
        }
      }
      .padding(.bottom, 112)
    }
    .scrollDismissesKeyboard(.interactively)
    .sbPageBackground()
    .navigationBarHidden(true)
    .safeAreaInset(edge: .bottom, spacing: 0) {
      if !replyResultAvailable {
        SBGlassCluster {
          Button {
            Task {
              response = await model.generateReplies(
                tone: tone,
                goal: goal,
                enm: enm,
                conversationText: conversation,
                images: images
              )
            }
          } label: {
            Text("Generate Replies")
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
    }
    .onChange(of: pickerItems) { _, newValue in
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

  private var replyResultNavigation: some View {
    HStack(spacing: 12) {
      Button {
        response = nil
      } label: {
        Label("Replies", systemImage: "chevron.left")
          .font(.subheadline.weight(.semibold))
          .frame(minWidth: 64, minHeight: 44, alignment: .leading)
      }
      .foregroundStyle(SBTheme.accentPressed)
      .accessibilityLabel("Back to reply inputs")

      Spacer()

      Text("\(replyResultReplies.count) replies")
        .font(.subheadline.weight(.semibold))
        .foregroundStyle(SBTheme.ink)

      Spacer()

      Button("Redo") {
        response = nil
      }
      .font(.subheadline.weight(.semibold))
      .foregroundStyle(SBTheme.accentPressed)
      .frame(minWidth: 44, minHeight: 44)
    }
    .padding(.horizontal, 16)
    .frame(height: 64)
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
      response = SwipeBetterScreenshotFixtures.replyResponse
    }
  }

  private func applyPendingImport() {
    guard isActive, appliedImportRevision != model.importRevision else { return }
    appliedImportRevision = model.importRevision
    var applied = false
    if !model.pendingImportText.isEmpty {
      conversation = model.pendingImportText
      applied = true
    }
    if !model.pendingImportImages.isEmpty {
      images = model.pendingImportImages
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
                  .frame(minHeight: 40)
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

struct PremiumReplyResults: View {
  let context: String?
  let replies: [String]
  let metadata: String
  @State private var copiedIndex: Int?

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

      ForEach(Array(replies.enumerated()), id: \.offset) { index, reply in
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

            Button {
              copy(reply, at: index)
            } label: {
              Text(copiedIndex == index ? "Copied" : "Copy reply")
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

      Text("Saved to History")
        .font(.caption)
        .foregroundStyle(SBTheme.secondaryInk)
        .frame(maxWidth: .infinity, alignment: .center)
        .padding(.top, 4)
    }
  }

  private func copy(_ reply: String, at index: Int) {
    UIPasteboard.general.string = reply
    copiedIndex = index
    UIAccessibility.post(notification: .announcement, argument: "Reply \(index + 1) copied")
    Task {
      try? await Task.sleep(for: .seconds(2))
      if copiedIndex == index {
        copiedIndex = nil
      }
    }
  }
}

struct PremiumInlineError: View {
  let message: String

  var body: some View {
    Label {
      Text(message)
        .font(.subheadline.weight(.medium))
    } icon: {
      Image(systemName: "exclamationmark.triangle.fill")
    }
    .foregroundStyle(SBTheme.accentPressed)
    .padding(14)
    .frame(maxWidth: .infinity, alignment: .leading)
    .background(SBTheme.accentSoft)
    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
  }
}
