import SwiftUI
import UIKit

enum SBTheme {
  private static func adaptive(light: UIColor, dark: UIColor) -> Color {
    Color(uiColor: UIColor { traits in
      traits.userInterfaceStyle == .dark ? dark : light
    })
  }

  static let canvas = adaptive(
    light: UIColor(red: 0.965, green: 0.969, blue: 0.976, alpha: 1),
    dark: UIColor(red: 0.045, green: 0.047, blue: 0.055, alpha: 1)
  )
  static let surface = Color(uiColor: .secondarySystemBackground)
  static let surfaceMuted = Color(uiColor: .tertiarySystemBackground)
  static let ink = Color(uiColor: .label)
  static let secondaryInk = Color(uiColor: .secondaryLabel)
  static let strongFill = adaptive(
    light: UIColor(red: 0.055, green: 0.061, blue: 0.078, alpha: 1),
    dark: UIColor(red: 0.93, green: 0.94, blue: 0.97, alpha: 1)
  )
  static let header = adaptive(
    light: UIColor(red: 0.045, green: 0.049, blue: 0.064, alpha: 1),
    dark: UIColor(red: 0.075, green: 0.079, blue: 0.096, alpha: 1)
  )
  static let headerInk = Color.white
  static let headerSecondaryInk = Color.white.opacity(0.66)
  static let accent = adaptive(
    light: UIColor(red: 0.94, green: 0.20, blue: 0.31, alpha: 1),
    dark: UIColor(red: 1.0, green: 0.35, blue: 0.41, alpha: 1)
  )
  static let accentPressed = adaptive(
    light: UIColor(red: 0.77, green: 0.10, blue: 0.21, alpha: 1),
    dark: UIColor(red: 0.88, green: 0.22, blue: 0.30, alpha: 1)
  )
  static let accentSoft = accent.opacity(0.12)
  static let teal = adaptive(
    light: UIColor(red: 0.00, green: 0.50, blue: 0.52, alpha: 1),
    dark: UIColor(red: 0.25, green: 0.82, blue: 0.79, alpha: 1)
  )
  static let tealSoft = teal.opacity(0.13)
  static let sky = adaptive(
    light: UIColor(red: 0.12, green: 0.38, blue: 0.78, alpha: 1),
    dark: UIColor(red: 0.34, green: 0.62, blue: 1.0, alpha: 1)
  )
  static let skySoft = sky.opacity(0.12)
  static let warning = Color(uiColor: .systemOrange)
  static let warningSoft = warning.opacity(0.12)
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
    VStack(alignment: .leading, spacing: 18) {
      HStack(spacing: 10) {
        Image(systemName: systemImage)
          .font(.system(size: 17, weight: .semibold))
          .foregroundStyle(SBTheme.headerInk)
          .frame(width: 38, height: 38)
          .background(Color.white.opacity(0.11), in: Circle())

        Text(eyebrow.uppercased())
          .font(.caption.weight(.bold))
          .foregroundStyle(SBTheme.headerSecondaryInk)

        Spacer(minLength: 10)

        if let status {
          Text(status)
            .font(.caption.weight(.bold))
            .foregroundStyle(SBTheme.headerInk)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(Color.white.opacity(0.11), in: Capsule())
        }

        if let trailing {
          trailing
        }
      }

      VStack(alignment: .leading, spacing: 8) {
        Text(title)
          .font(.system(size: 34, weight: .bold))
          .foregroundStyle(SBTheme.headerInk)
          .fixedSize(horizontal: false, vertical: true)

        Text(detail)
          .font(.subheadline)
          .foregroundStyle(SBTheme.headerSecondaryInk)
          .lineSpacing(2)
          .fixedSize(horizontal: false, vertical: true)
      }
    }
    .padding(.horizontal, 20)
    .padding(.top, 58)
    .padding(.bottom, 24)
    .frame(maxWidth: .infinity, alignment: .leading)
    .background {
      ZStack(alignment: .bottomLeading) {
        SBTheme.header
        HStack(spacing: 0) {
          SBTheme.accent.frame(maxWidth: .infinity)
          SBTheme.teal.frame(width: 86)
          SBTheme.sky.frame(width: 52)
        }
        .frame(height: 4)
      }
      .ignoresSafeArea(edges: .top)
    }
  }
}

struct SBSectionHeader: View {
  let title: String
  var detail: String?

  var body: some View {
    VStack(alignment: .leading, spacing: 3) {
      Text(title)
        .font(.title3.weight(.bold))
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
    let shape = RoundedRectangle(cornerRadius: 8, style: .continuous)
    content
      .padding(16)
      .frame(maxWidth: .infinity, alignment: .leading)
      .background(.thinMaterial, in: shape)
      .overlay {
        shape.stroke(Color.white.opacity(0.16), lineWidth: 1)
      }
      .shadow(color: Color.black.opacity(0.035), radius: 14, y: 7)
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
    #if compiler(>=6.2)
    if #available(iOS 26.0, *) {
      configuration.label
        .font(.headline)
        .foregroundStyle(.white)
        .frame(maxWidth: .infinity, minHeight: 52)
        .contentShape(Rectangle())
        .glassEffect(.regular.tint(
          configuration.isPressed ? SBTheme.accentPressed : SBTheme.accent
        ).interactive(), in: .capsule)
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
    #else
    configuration.label
      .font(.headline)
      .foregroundStyle(.white)
      .frame(maxWidth: .infinity, minHeight: 52)
      .background(configuration.isPressed ? SBTheme.accentPressed : SBTheme.accent)
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
