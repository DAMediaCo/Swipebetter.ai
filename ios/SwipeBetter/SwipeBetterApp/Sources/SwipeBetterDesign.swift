import SwiftUI
import UIKit

enum SBTheme {
  private static func adaptive(light: UIColor, dark: UIColor) -> Color {
    Color(uiColor: UIColor { traits in
      traits.userInterfaceStyle == .dark ? dark : light
    })
  }

  static let canvas = adaptive(
    light: UIColor(red: 0.949, green: 0.949, blue: 0.969, alpha: 1),
    dark: UIColor.black
  )
  static let surface = adaptive(
    light: UIColor.white,
    dark: UIColor(red: 0.110, green: 0.110, blue: 0.118, alpha: 1)
  )
  static let surfaceMuted = adaptive(
    light: UIColor(red: 0.91, green: 0.91, blue: 0.93, alpha: 1),
    dark: UIColor(red: 0.17, green: 0.17, blue: 0.18, alpha: 1)
  )
  static let ink = Color(uiColor: .label)
  static let secondaryInk = Color(uiColor: .secondaryLabel)
  static let strongFill = adaptive(
    light: UIColor(red: 0.055, green: 0.061, blue: 0.078, alpha: 1),
    dark: UIColor(red: 0.93, green: 0.94, blue: 0.97, alpha: 1)
  )
  static let accent = adaptive(
    light: UIColor(red: 0.941, green: 0.259, blue: 0.306, alpha: 1),
    dark: UIColor(red: 1.0, green: 0.416, blue: 0.447, alpha: 1)
  )
  static let accentPressed = adaptive(
    light: UIColor(red: 0.847, green: 0.196, blue: 0.243, alpha: 1),
    dark: UIColor(red: 0.847, green: 0.196, blue: 0.243, alpha: 1)
  )
  // Separate action fill keeps white button labels above WCAG AA contrast in light mode.
  static let primaryActionFill = adaptive(
    light: UIColor(red: 0.941, green: 0.259, blue: 0.306, alpha: 1),
    dark: UIColor(red: 1.0, green: 0.416, blue: 0.447, alpha: 1)
  )
  static let accentSoft = accent.opacity(0.12)
  static let teal = adaptive(
    light: UIColor(red: 0.055, green: 0.624, blue: 0.561, alpha: 1),
    dark: UIColor(red: 0.055, green: 0.624, blue: 0.561, alpha: 1)
  )
  static let tealSoft = teal.opacity(0.13)
  static let warning = Color(uiColor: .systemOrange)
  static let warningSoft = warning.opacity(0.12)
  static let divider = Color(uiColor: .separator).opacity(0.45)
}

struct SBLogoMark: View {
  var size: CGFloat = 52

  var body: some View {
    ZStack {
      RoundedRectangle(cornerRadius: size * 0.22, style: .continuous)
        .fill(SBTheme.primaryActionFill)

      Text("S")
        .font(.system(size: size * 0.42, weight: .bold, design: .rounded))
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

struct SBWorkspaceHeader: View {
  let eyebrow: String
  let title: String
  let detail: String
  let systemImage: String
  var status: String?
  var trailing: AnyView?

  init(
    eyebrow: String,
    title: String,
    detail: String,
    systemImage: String,
    status: String? = nil,
    trailing: AnyView? = nil
  ) {
    self.eyebrow = eyebrow
    self.title = title
    self.detail = detail
    self.systemImage = systemImage
    self.status = status
    self.trailing = trailing
  }

  var body: some View {
    HStack(alignment: .top, spacing: 14) {
      VStack(alignment: .leading, spacing: 6) {
        Text(title)
          .font(.largeTitle.weight(.bold))
          .foregroundStyle(SBTheme.ink)
          .fixedSize(horizontal: false, vertical: true)
      }
      .frame(maxWidth: .infinity, alignment: .leading)

      if let trailing {
        Spacer(minLength: 8)
        trailing
          .fixedSize(horizontal: true, vertical: false)
          .frame(width: 44, height: 44)
          .layoutPriority(1)
      }
    }
    .padding(.horizontal, 20)
    .padding(.top, 12)
    .padding(.bottom, 2)
    .frame(maxWidth: .infinity, alignment: .leading)
  }
}

struct SBSectionHeader: View {
  let title: String
  var detail: String?

  var body: some View {
    VStack(alignment: .leading, spacing: 3) {
      Text(title)
        .font(.caption.weight(.medium))
        .foregroundStyle(SBTheme.secondaryInk)
        .textCase(.uppercase)
        .tracking(0.5)

      if let detail {
        Text(detail)
          .font(.caption)
          .foregroundStyle(SBTheme.secondaryInk)
          .lineSpacing(1)
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
    let shape = RoundedRectangle(cornerRadius: 16, style: .continuous)
    content
      .padding(16)
      .frame(maxWidth: .infinity, alignment: .leading)
      .background(SBTheme.surface, in: shape)
  }
}

struct SBGlassCluster<Content: View>: View {
  private let spacing: CGFloat
  private let content: Content

  init(spacing: CGFloat = 12, @ViewBuilder content: () -> Content) {
    self.spacing = spacing
    self.content = content()
  }

  @ViewBuilder
  var body: some View {
    #if compiler(>=6.2)
    if #available(iOS 26.0, *) {
      GlassEffectContainer(spacing: spacing) {
        content
      }
    } else {
      content
    }
    #else
    content
    #endif
  }
}

struct SBMetricChip: View {
  let label: String
  let value: String
  var tint = SBTheme.teal

  var body: some View {
    VStack(alignment: .leading, spacing: 2) {
      Text(label.uppercased())
        .font(.caption2.weight(.bold))
        .foregroundStyle(SBTheme.secondaryInk)
      Text(value)
        .font(.subheadline.weight(.bold).monospacedDigit())
        .foregroundStyle(tint)
    }
    .padding(.horizontal, 12)
    .padding(.vertical, 9)
    .frame(maxWidth: .infinity, alignment: .leading)
    .background(tint.opacity(0.10), in: RoundedRectangle(cornerRadius: 8, style: .continuous))
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
    .frame(minHeight: 44)
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
  @Environment(\.accessibilityReduceMotion) private var reduceMotion

  @ViewBuilder
  func makeBody(configuration: Configuration) -> some View {
    #if compiler(>=6.2)
    if #available(iOS 26.0, *) {
      configuration.label
        .font(.headline)
        .foregroundStyle(.white)
        .frame(maxWidth: .infinity, minHeight: 52)
        .contentShape(Rectangle())
        .background(configuration.isPressed ? SBTheme.accentPressed : SBTheme.primaryActionFill, in: Capsule())
        .scaleEffect(configuration.isPressed && !reduceMotion ? 0.98 : 1)
        .animation(reduceMotion ? nil : .snappy(duration: 0.18), value: configuration.isPressed)
    } else {
      configuration.label
        .font(.headline)
        .foregroundStyle(.white)
        .frame(maxWidth: .infinity, minHeight: 52)
        .background(configuration.isPressed ? SBTheme.accentPressed : SBTheme.primaryActionFill)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
    #else
    configuration.label
      .font(.headline)
      .foregroundStyle(.white)
      .frame(maxWidth: .infinity, minHeight: 52)
      .background(configuration.isPressed ? SBTheme.accentPressed : SBTheme.primaryActionFill)
      .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    #endif
  }
}

struct SBSecondaryButtonStyle: ButtonStyle {
  @ViewBuilder
  func makeBody(configuration: Configuration) -> some View {
    #if compiler(>=6.2)
    if #available(iOS 26.0, *) {
      configuration.label
        .font(.subheadline.weight(.semibold))
        .foregroundStyle(SBTheme.ink)
        .frame(maxWidth: .infinity, minHeight: 46)
        .contentShape(Rectangle())
        .glassEffect(.regular.interactive(), in: .capsule)
        .scaleEffect(configuration.isPressed ? 0.98 : 1)
    } else {
      configuration.label
        .font(.subheadline.weight(.semibold))
        .foregroundStyle(SBTheme.ink)
        .frame(maxWidth: .infinity, minHeight: 46)
        .background(configuration.isPressed ? SBTheme.surfaceMuted : SBTheme.surface)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
    #else
    configuration.label
      .font(.subheadline.weight(.semibold))
      .foregroundStyle(SBTheme.ink)
      .frame(maxWidth: .infinity, minHeight: 46)
      .background(configuration.isPressed ? SBTheme.surfaceMuted : SBTheme.surface)
      .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    #endif
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
    #if compiler(>=6.2)
    if #available(iOS 26.0, *) {
      glassEffect(.regular.interactive(), in: shape)
    } else {
      background(.regularMaterial, in: shape)
    }
    #else
    background(.regularMaterial, in: shape)
    #endif
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
