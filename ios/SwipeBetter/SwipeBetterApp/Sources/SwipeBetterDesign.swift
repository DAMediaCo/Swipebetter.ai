import SwiftUI
import UIKit

enum SBTheme {
  static let canvas = Color(uiColor: .systemGroupedBackground)
  static let surface = Color(uiColor: .secondarySystemGroupedBackground)
  static let surfaceMuted = Color(uiColor: .tertiarySystemGroupedBackground)
  static let ink = Color(uiColor: .label)
  static let secondaryInk = Color(uiColor: .secondaryLabel)
  static let strongFill = Color(uiColor: .label)
  static let accent = Color(uiColor: .systemPink)
  static let accentPressed = Color(uiColor: .systemRed)
  static let accentSoft = Color(uiColor: .systemPink).opacity(0.11)
  static let teal = Color(uiColor: .systemTeal)
  static let tealSoft = Color(uiColor: .systemTeal).opacity(0.12)
  static let warning = Color(uiColor: .systemOrange)
  static let warningSoft = Color(uiColor: .systemOrange).opacity(0.12)
  static let divider = Color(uiColor: .separator).opacity(0.45)
}

struct SBLogoMark: View {
  var size: CGFloat = 52

  var body: some View {
    ZStack {
      RoundedRectangle(cornerRadius: size * 0.22, style: .continuous)
        .fill(SBTheme.accent.gradient)

      Image(systemName: "bubble.left.and.text.bubble.right.fill")
        .font(.system(size: size * 0.33, weight: .semibold))
        .foregroundStyle(.white)
    }
    .frame(width: size, height: size)
    .accessibilityHidden(true)
  }
}

struct SBPageHeader: View {
  let eyebrow: String
  let title: String
  let detail: String
  var trailing: AnyView?

  init(eyebrow: String, title: String, detail: String, trailing: AnyView? = nil) {
    self.eyebrow = eyebrow
    self.title = title
    self.detail = detail
    self.trailing = trailing
  }

  var body: some View {
    HStack(alignment: .top, spacing: 16) {
      VStack(alignment: .leading, spacing: 7) {
        Text(eyebrow)
          .font(.subheadline.weight(.semibold))
          .foregroundStyle(SBTheme.secondaryInk)

        Text(title)
          .font(.largeTitle.weight(.bold))
          .foregroundStyle(SBTheme.ink)

        Text(detail)
          .font(.subheadline)
          .foregroundStyle(SBTheme.secondaryInk)
          .fixedSize(horizontal: false, vertical: true)
      }

      Spacer(minLength: 8)

      if let trailing {
        trailing
      }
    }
    .padding(.horizontal, 20)
    .padding(.top, 12)
    .padding(.bottom, 6)
  }
}

struct SBSectionHeader: View {
  let title: String
  var detail: String?

  var body: some View {
    VStack(alignment: .leading, spacing: 3) {
      Text(title)
        .font(.headline)
        .foregroundStyle(SBTheme.ink)

      if let detail {
        Text(detail)
          .font(.subheadline)
          .foregroundStyle(SBTheme.secondaryInk)
          .lineSpacing(2)
          .fixedSize(horizontal: false, vertical: true)
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }
}

struct SBSurface<Content: View>: View {
  private let content: Content

  init(@ViewBuilder content: () -> Content) {
    self.content = content()
  }

  var body: some View {
    content
      .padding(16)
      .frame(maxWidth: .infinity, alignment: .leading)
      .background(SBTheme.surface)
      .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
  }
}

struct SBStatusBanner: View {
  let title: String
  let detail: String
  let status: String
  let systemImage: String
  var positive = true

  var body: some View {
    HStack(spacing: 12) {
      Image(systemName: systemImage)
        .font(.system(size: 17, weight: .semibold))
        .foregroundStyle(positive ? SBTheme.teal : SBTheme.warning)
        .frame(width: 38, height: 38)
        .background(positive ? SBTheme.tealSoft : SBTheme.warningSoft, in: Circle())

      VStack(alignment: .leading, spacing: 3) {
        Text(title)
          .font(.subheadline.weight(.semibold))
          .foregroundStyle(SBTheme.ink)

        Text(detail)
          .font(.caption)
          .foregroundStyle(SBTheme.secondaryInk)
          .fixedSize(horizontal: false, vertical: true)
      }

      Spacer(minLength: 8)

      Text(status)
        .font(.caption.weight(.bold))
        .foregroundStyle(positive ? SBTheme.teal : SBTheme.warning)
        .padding(.horizontal, 8)
        .padding(.vertical, 5)
        .background(positive ? SBTheme.tealSoft : SBTheme.warningSoft, in: Capsule())
    }
    .accessibilityElement(children: .combine)
  }
}

struct SBSelectRow<SelectionValue: Hashable, Content: View>: View {
  let title: String
  @Binding var selection: SelectionValue
  let content: Content

  init(title: String, selection: Binding<SelectionValue>, @ViewBuilder content: () -> Content) {
    self.title = title
    _selection = selection
    self.content = content()
  }

  var body: some View {
    HStack {
      Text(title)
        .font(.subheadline.weight(.medium))
        .foregroundStyle(SBTheme.ink)

      Spacer()

      Picker(title, selection: $selection) {
        content
      }
      .labelsHidden()
      .pickerStyle(.menu)
      .tint(SBTheme.accent)
    }
    .frame(minHeight: 36)
  }
}

struct SBDivider: View {
  var body: some View {
    SBTheme.divider
      .frame(height: 1)
      .accessibilityHidden(true)
  }
}

struct SBEmptyState: View {
  let title: String
  let detail: String
  let systemImage: String

  var body: some View {
    VStack(spacing: 10) {
      Image(systemName: systemImage)
        .font(.system(size: 25, weight: .medium))
        .foregroundStyle(SBTheme.accent)
        .frame(width: 52, height: 52)
        .background(SBTheme.accentSoft, in: Circle())

      Text(title)
        .font(.headline)
        .foregroundStyle(SBTheme.ink)

      Text(detail)
        .font(.caption)
        .foregroundStyle(SBTheme.secondaryInk)
        .multilineTextAlignment(.center)
    }
    .padding(.vertical, 22)
    .frame(maxWidth: .infinity)
  }
}

struct SBPrimaryButtonStyle: ButtonStyle {
  @ViewBuilder
  func makeBody(configuration: Configuration) -> some View {
    if #available(iOS 26.0, *) {
      configuration.label
        .font(.headline)
        .foregroundStyle(.white)
        .frame(maxWidth: .infinity, minHeight: 52)
        .contentShape(Rectangle())
        .glassEffect(
          .regular.tint(configuration.isPressed ? SBTheme.accentPressed : SBTheme.accent).interactive(),
          in: .rect(cornerRadius: 18)
        )
        .scaleEffect(configuration.isPressed ? 0.98 : 1)
        .animation(.snappy(duration: 0.18), value: configuration.isPressed)
    } else {
      configuration.label
        .font(.headline)
        .foregroundStyle(.white)
        .frame(maxWidth: .infinity, minHeight: 52)
        .background(configuration.isPressed ? SBTheme.accentPressed : SBTheme.accent)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
  }
}

struct SBSecondaryButtonStyle: ButtonStyle {
  @ViewBuilder
  func makeBody(configuration: Configuration) -> some View {
    if #available(iOS 26.0, *) {
      configuration.label
        .font(.subheadline.weight(.semibold))
        .foregroundStyle(SBTheme.ink)
        .frame(maxWidth: .infinity, minHeight: 46)
        .contentShape(Rectangle())
        .glassEffect(.regular.interactive(), in: .rect(cornerRadius: 16))
        .scaleEffect(configuration.isPressed ? 0.98 : 1)
    } else {
      configuration.label
        .font(.subheadline.weight(.semibold))
        .foregroundStyle(SBTheme.ink)
        .frame(maxWidth: .infinity, minHeight: 46)
        .background(configuration.isPressed ? SBTheme.surfaceMuted : SBTheme.surface)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
  }
}

struct SBIconButton: View {
  let systemImage: String
  let label: String
  let action: () -> Void

  var body: some View {
    Button(action: action) {
      Image(systemName: systemImage)
        .font(.system(size: 16, weight: .semibold))
        .foregroundStyle(SBTheme.ink)
        .frame(width: 44, height: 44)
        .sbGlassControl(shape: Circle())
    }
    .accessibilityLabel(label)
  }
}

extension View {
  func sbPageBackground() -> some View {
    background(SBTheme.canvas.ignoresSafeArea())
  }

  @ViewBuilder
  func sbGlassControl<S: Shape>(shape: S) -> some View {
    if #available(iOS 26.0, *) {
      glassEffect(.regular.interactive(), in: shape)
    } else {
      background(.regularMaterial, in: shape)
    }
  }
}

enum SBAppearance {
  static func configure() {
    guard #unavailable(iOS 26.0) else { return }
    let appearance = UITabBarAppearance()
    appearance.configureWithDefaultBackground()
    UITabBar.appearance().standardAppearance = appearance
    UITabBar.appearance().scrollEdgeAppearance = appearance
  }
}
