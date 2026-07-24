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

  var body: some View {
    ScrollView {
      LazyVStack(spacing: 16) {
        SBPageHeader(
          eyebrow: "PROFILE COACH",
          title: "Make the first swipe count",
          detail: "Add your current profile, then get a prioritized photo and bio plan.",
          trailing: AnyView(
            SBIconButton(systemImage: "square.and.arrow.down", label: "Import shared screenshots") {
              model.loadSharedImport()
              applyPendingImport()
            }
          )
        )

        SBSurface {
          PremiumUsageStatus(
            title: "Profile audit",
            detail: "One starter credit · unlimited on paid plans",
            systemImage: "person.crop.rectangle.stack"
          )
        }

        VStack(spacing: 10) {
          SBSectionHeader(
            title: "Profile screenshots",
            detail: "Add your full profile in order. Up to 10 images."
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
                PremiumScreenshotStrip(images: images, onRemove: removeImage)

                HStack(spacing: 10) {
                  PhotosPicker(selection: $pickerItems, maxSelectionCount: max(10 - images.count, 1), matching: .images) {
                    Label("Add more", systemImage: "plus")
                  }
                  .buttonStyle(SBSecondaryButtonStyle())
                  .accessibilityIdentifier("audit.addScreenshotsButton")

                  Button(role: .destructive) {
                    pickerItems = []
                    images = []
                    result = nil
                  } label: {
                    Label("Clear", systemImage: "trash")
                  }
                  .buttonStyle(SBSecondaryButtonStyle())
                }
              }

              Text(images.isEmpty ? "No screenshots selected" : "\(images.count) of 10 screenshots selected")
                .font(.caption)
                .foregroundStyle(SBTheme.secondaryInk)
                .frame(maxWidth: .infinity, alignment: .leading)
            }
          }
        }
        .padding(.horizontal, 20)

        VStack(spacing: 10) {
          SBSectionHeader(
            title: "Dating context",
            detail: "This keeps advice specific to the audience and outcome you want."
          )

          SBSurface {
            VStack(spacing: 2) {
              SBSelectRow(title: "Dating app", selection: $platform) {
                ForEach(platforms, id: \.self) { Text($0) }
              }
              SBDivider()
              SBSelectRow(title: "Your profile", selection: $gender) {
                ForEach(genders, id: \.self) { Text($0) }
              }
              SBDivider()
              SBSelectRow(title: "What you want", selection: $intent) {
                ForEach(intents, id: \.self) { Text($0) }
              }
              SBDivider()
              Toggle("ENM / poly profile", isOn: $enm)
                .font(.subheadline.weight(.medium))
                .tint(SBTheme.accent)
                .frame(minHeight: 42)
            }
          }
        }
        .padding(.horizontal, 20)

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
          Label("Run profile audit", systemImage: "sparkles")
        }
        .buttonStyle(SBPrimaryButtonStyle())
        .disabled(model.isBusy || images.isEmpty)
        .opacity(images.isEmpty ? 0.48 : 1)
        .accessibilityIdentifier("audit.runButton")
        .padding(.horizontal, 20)

        if let analysis = result?.analysis {
          PremiumProfileResult(analysis: analysis)
            .padding(.horizontal, 20)
            .transition(.move(edge: .bottom).combined(with: .opacity))
        } else if let result, result.status == "failed" {
          PremiumInlineError(message: result.error ?? "The audit could not be completed. Try again.")
            .padding(.horizontal, 20)
        }
      }
      .padding(.bottom, 28)
    }
    .scrollDismissesKeyboard(.interactively)
    .sbPageBackground()
    .navigationBarHidden(true)
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

  var body: some View {
    ScrollView {
      LazyVStack(spacing: 16) {
        SBPageHeader(
          eyebrow: "REPLY COACH",
          title: "Say what you mean — better",
          detail: "Bring the conversation. Choose the energy. Leave with three replies you can send.",
          trailing: AnyView(
            SBIconButton(systemImage: "square.and.arrow.down", label: "Import shared chat") {
              model.loadSharedImport()
              applyPendingImport()
            }
          )
        )

        SBSurface {
          PremiumUsageStatus(
            title: "Reply coaching",
            detail: "One starter credit · unlimited on paid plans",
            systemImage: "message.badge.waveform"
          )
        }
        .padding(.horizontal, 20)

        VStack(spacing: 10) {
          SBSectionHeader(
            title: "Conversation",
            detail: "Paste the visible chat or attach up to 3 screenshots."
          )

          SBSurface {
            VStack(spacing: 14) {
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

              if images.isEmpty {
                PhotosPicker(selection: $pickerItems, maxSelectionCount: 3, matching: .images) {
                  Label("Add chat screenshots", systemImage: "photo.badge.plus")
                }
                .buttonStyle(SBSecondaryButtonStyle())
                .accessibilityIdentifier("replies.addScreenshotsButton")
              } else {
                PremiumScreenshotStrip(images: images, onRemove: removeImage)

                HStack(spacing: 10) {
                  PhotosPicker(selection: $pickerItems, maxSelectionCount: max(3 - images.count, 1), matching: .images) {
                    Label("Add more", systemImage: "plus")
                  }
                  .buttonStyle(SBSecondaryButtonStyle())
                  .accessibilityIdentifier("replies.addScreenshotsButton")

                  Button(role: .destructive) {
                    pickerItems = []
                    images = []
                  } label: {
                    Label("Clear", systemImage: "trash")
                  }
                  .buttonStyle(SBSecondaryButtonStyle())
                }
              }
            }
          }
        }
        .padding(.horizontal, 20)

        VStack(spacing: 10) {
          SBSectionHeader(
            title: "Direction",
            detail: "Set the tone and the outcome before generating."
          )

          SBSurface {
            VStack(spacing: 2) {
              SBSelectRow(title: "Tone", selection: $tone) {
                ForEach(tones, id: \.self) { Text($0.capitalized) }
              }
              SBDivider()
              SBSelectRow(title: "Goal", selection: $goal) {
                ForEach(goals.sorted(by: { $0.value < $1.value }), id: \.key) { key, label in
                  Text(label).tag(key)
                }
              }
              SBDivider()
              Toggle("ENM / poly context", isOn: $enm)
                .font(.subheadline.weight(.medium))
                .tint(SBTheme.accent)
                .frame(minHeight: 42)
            }
          }
        }
        .padding(.horizontal, 20)

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
          Label("Generate three replies", systemImage: "sparkles")
        }
        .buttonStyle(SBPrimaryButtonStyle())
        .disabled(model.isBusy || !canGenerate)
        .opacity(canGenerate ? 1 : 0.48)
        .accessibilityIdentifier("replies.generateButton")
        .padding(.horizontal, 20)

        if let parsed = response?.parsed {
          PremiumReplyResults(parsed: parsed)
            .padding(.horizontal, 20)
            .transition(.move(edge: .bottom).combined(with: .opacity))
        }
      }
      .padding(.bottom, 28)
    }
    .scrollDismissesKeyboard(.interactively)
    .sbPageBackground()
    .navigationBarHidden(true)
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

  private func applyScreenshotFixturesIfNeeded() {
    guard isActive, SwipeBetterScreenshotFixtures.isEnabled else { return }
    if conversation.isEmpty {
      conversation = "Matched after a hiking prompt. They said they love last-minute tacos but have a busy week."
    }
    if images.isEmpty {
      images = [SwipeBetterScreenshotFixtures.chatScreenshotData]
    }
    if response == nil {
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
    VStack(spacing: 10) {
      Image(systemName: systemImage)
        .font(.system(size: 25, weight: .medium))
        .foregroundStyle(SBTheme.accent)

      Text(title)
        .font(.headline)
        .foregroundStyle(SBTheme.ink)

      Text(detail)
        .font(.caption)
        .foregroundStyle(SBTheme.secondaryInk)
    }
    .frame(maxWidth: .infinity, minHeight: 132)
    .background(SBTheme.accentSoft.opacity(0.42))
    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    .overlay {
      RoundedRectangle(cornerRadius: 8, style: .continuous)
        .stroke(SBTheme.accent.opacity(0.48), style: StrokeStyle(lineWidth: 1, dash: [6, 5]))
    }
  }
}

struct PremiumScreenshotStrip: View {
  let images: [Data]
  let onRemove: (Int) -> Void

  var body: some View {
    ScrollView(.horizontal, showsIndicators: false) {
      HStack(spacing: 10) {
        ForEach(Array(images.enumerated()), id: \.offset) { index, data in
          ZStack(alignment: .topTrailing) {
            if let image = UIImage(data: data) {
              Image(uiImage: image)
                .resizable()
                .scaledToFill()
                .frame(width: 94, height: 126)
                .clipShape(RoundedRectangle(cornerRadius: 7, style: .continuous))
                .overlay {
                  RoundedRectangle(cornerRadius: 7, style: .continuous)
                    .stroke(SBTheme.divider, lineWidth: 1)
                }
            }

            Button {
              onRemove(index)
            } label: {
              Image(systemName: "xmark")
                .font(.caption.weight(.bold))
                .foregroundStyle(.white)
                .frame(width: 26, height: 26)
                .background(SBTheme.strongFill.opacity(0.86))
                .clipShape(Circle())
            }
            .offset(x: 6, y: -6)
            .accessibilityLabel("Remove screenshot \(index + 1)")
          }
          .padding(.top, 7)
          .padding(.trailing, 5)
        }
      }
      .padding(.horizontal, 2)
    }
    .frame(height: 140)
  }
}

struct PremiumProfileResult: View {
  let analysis: ProfileAnalysis

  var body: some View {
    VStack(spacing: 10) {
      SBSectionHeader(
        title: "Your profile plan",
        detail: "Start with the first fix, then work down the list."
      )

      SBSurface {
        VStack(spacing: 0) {
          HStack(spacing: 14) {
            ZStack {
              Circle()
                .stroke(SBTheme.surfaceMuted, lineWidth: 7)
              Circle()
                .trim(from: 0, to: CGFloat(min(max(analysis.overallScore ?? 0, 0), 100)) / 100)
                .stroke(SBTheme.teal, style: StrokeStyle(lineWidth: 7, lineCap: .round))
                .rotationEffect(.degrees(-90))

              Text("\(analysis.overallScore ?? 0)")
                .font(.system(.title2, design: .rounded, weight: .bold))
                .foregroundStyle(SBTheme.ink)
            }
            .frame(width: 72, height: 72)

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

          PremiumResultBlock(index: 1, title: "First fix", text: analysis.firstTip)
          PremiumResultBlock(index: 2, title: "Bio", text: analysis.bioSuggestions)
          PremiumResultBlock(index: 3, title: "Photos", text: analysis.photoFeedback)
          PremiumResultBlock(index: 4, title: "Next improvements", text: analysis.improvements)
        }
      }
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
  let parsed: ReplyParsed
  @State private var copiedIndex: Int?

  var body: some View {
    VStack(spacing: 10) {
      SBSectionHeader(
        title: "Three ways forward",
        detail: parsed.conversationContext
      )

      ForEach(Array((parsed.suggestedReplies ?? []).enumerated()), id: \.offset) { index, reply in
        SBSurface {
          VStack(alignment: .leading, spacing: 14) {
            HStack {
              Text("Option \(index + 1)")
                .font(.caption.weight(.bold))
                .foregroundStyle(SBTheme.accent)

              Spacer()

              Image(systemName: index == 0 ? "star.fill" : "sparkle")
                .foregroundStyle(index == 0 ? SBTheme.warning : SBTheme.secondaryInk)
            }

            Text(reply)
              .font(.body.weight(.medium))
              .foregroundStyle(SBTheme.ink)
              .fixedSize(horizontal: false, vertical: true)
              .textSelection(.enabled)

            Button {
              copy(reply, at: index)
            } label: {
              Label(
                copiedIndex == index ? "Copied" : "Copy reply",
                systemImage: copiedIndex == index ? "checkmark" : "doc.on.doc"
              )
            }
            .buttonStyle(SBSecondaryButtonStyle())
            .accessibilityLabel(copiedIndex == index ? "Reply \(index + 1) copied" : "Copy reply \(index + 1)")
            .accessibilityIdentifier("replies.copyButton.\(index + 1)")
          }
        }
      }
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
