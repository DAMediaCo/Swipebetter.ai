import SwiftUI
import UIKit

enum SBTheme {
  private static func adaptive(light: UIColor, dark: UIColor) -> Color {
    Color(uiColor: UIColor { traits in
      traits.userInterfaceStyle == .dark ? dark : light
    })
  }

  static let canvas = adaptive(
    light: UIColor(red: 0.957, green: 0.965, blue: 0.973, alpha: 1),
    dark: UIColor(red: 0.055, green: 0.059, blue: 0.067, alpha: 1)
  )
  static let surface = adaptive(light: .white, dark: UIColor(red: 0.11, green: 0.115, blue: 0.13, alpha: 1))
  static let surfaceMuted = adaptive(
    light: UIColor(red: 0.925, green: 0.938, blue: 0.949, alpha: 1),
    dark: UIColor(red: 0.16, green: 0.17, blue: 0.19, alpha: 1)
  )
  static let ink = adaptive(
    light: UIColor(red: 0.075, green: 0.094, blue: 0.122, alpha: 1),
    dark: UIColor(red: 0.95, green: 0.96, blue: 0.98, alpha: 1)
  )
  static let secondaryInk = adaptive(
    light: UIColor(red: 0.34, green: 0.38, blue: 0.44, alpha: 1),
    dark: UIColor(red: 0.66, green: 0.68, blue: 0.73, alpha: 1)
  )
  static let strongFill = Color(red: 0.075, green: 0.094, blue: 0.122)
  static let accent = adaptive(
    light: UIColor(red: 0.88, green: 0.27, blue: 0.23, alpha: 1),
    dark: UIColor(red: 1.0, green: 0.39, blue: 0.34, alpha: 1)
  )
  static let accentPressed = adaptive(
    light: UIColor(red: 0.72, green: 0.18, blue: 0.15, alpha: 1),
    dark: UIColor(red: 0.87, green: 0.25, blue: 0.22, alpha: 1)
  )
  static let accentSoft = adaptive(
    light: UIColor(red: 1.0, green: 0.91, blue: 0.89, alpha: 1),
    dark: UIColor(red: 0.26, green: 0.11, blue: 0.10, alpha: 1)
  )
  static let teal = adaptive(
    light: UIColor(red: 0.08, green: 0.43, blue: 0.40, alpha: 1),
    dark: UIColor(red: 0.31, green: 0.77, blue: 0.70, alpha: 1)
  )
  static let tealSoft = adaptive(
    light: UIColor(red: 0.87, green: 0.95, blue: 0.93, alpha: 1),
    dark: UIColor(red: 0.08, green: 0.23, blue: 0.21, alpha: 1)
  )
  static let warning = adaptive(light: UIColor(red: 0.68, green: 0.38, blue: 0.02, alpha: 1), dark: .systemOrange)
  static let warningSoft = adaptive(
    light: UIColor(red: 1.0, green: 0.95, blue: 0.84, alpha: 1),
    dark: UIColor(red: 0.25, green: 0.17, blue: 0.06, alpha: 1)
  )
  static let divider = adaptive(
    light: UIColor(red: 0.84, green: 0.86, blue: 0.89, alpha: 1),
    dark: UIColor(red: 0.24, green: 0.25, blue: 0.28, alpha: 1)
  )
}

struct SBLogoMark: View {
  var size: CGFloat = 52

  var body: some View {
    ZStack {
      RoundedRectangle(cornerRadius: size * 0.17)
        .fill(SBTheme.strongFill)
        .frame(width: size * 0.74, height: size * 0.86)
        .rotationEffect(.degrees(-7))
        .offset(x: -size * 0.08)

      RoundedRectangle(cornerRadius: size * 0.17)
        .fill(SBTheme.accent)
        .frame(width: size * 0.74, height: size * 0.86)
        .rotationEffect(.degrees(7))
        .offset(x: size * 0.08)

      Image(systemName: "sparkles")
        .font(.system(size: size * 0.3, weight: .bold))
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
          .font(.caption.weight(.semibold))
          .foregroundStyle(SBTheme.accent)

        Text(title)
          .font(.system(.largeTitle, design: .rounded, weight: .bold))
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
    .padding(.top, 14)
    .padding(.bottom, 10)
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
      .overlay {
        RoundedRectangle(cornerRadius: 8, style: .continuous)
          .stroke(SBTheme.divider.opacity(0.8), lineWidth: 1)
      }
      .shadow(color: SBTheme.ink.opacity(0.055), radius: 12, x: 0, y: 5)
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
        .background(positive ? SBTheme.tealSoft : SBTheme.warningSoft)
        .clipShape(RoundedRectangle(cornerRadius: 7, style: .continuous))

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
        .background(positive ? SBTheme.tealSoft : SBTheme.warningSoft)
        .clipShape(RoundedRectangle(cornerRadius: 5, style: .continuous))
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
        .background(SBTheme.accentSoft)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))

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
  func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .font(.headline)
      .foregroundStyle(.white)
      .frame(maxWidth: .infinity, minHeight: 50)
      .background(configuration.isPressed ? SBTheme.accentPressed : SBTheme.accent)
      .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
      .scaleEffect(configuration.isPressed ? 0.985 : 1)
      .animation(.easeOut(duration: 0.14), value: configuration.isPressed)
  }
}

struct SBSecondaryButtonStyle: ButtonStyle {
  func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .font(.subheadline.weight(.semibold))
      .foregroundStyle(SBTheme.ink)
      .frame(maxWidth: .infinity, minHeight: 44)
      .background(configuration.isPressed ? SBTheme.surfaceMuted : SBTheme.surface)
      .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
      .overlay {
        RoundedRectangle(cornerRadius: 8, style: .continuous)
          .stroke(SBTheme.divider, lineWidth: 1)
      }
      .scaleEffect(configuration.isPressed ? 0.985 : 1)
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
        .frame(width: 42, height: 42)
        .background(SBTheme.surface)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay {
          RoundedRectangle(cornerRadius: 8, style: .continuous)
            .stroke(SBTheme.divider, lineWidth: 1)
        }
    }
    .accessibilityLabel(label)
  }
}

extension View {
  func sbPageBackground() -> some View {
    background(SBTheme.canvas.ignoresSafeArea())
  }
}

enum SBAppearance {
  static func configure() {
    let tabAppearance = UITabBarAppearance()
    tabAppearance.configureWithOpaqueBackground()
    tabAppearance.backgroundColor = UIColor(SBTheme.surface)
    tabAppearance.shadowColor = UIColor(SBTheme.divider)
    tabAppearance.stackedLayoutAppearance.normal.iconColor = UIColor(SBTheme.secondaryInk)
    tabAppearance.stackedLayoutAppearance.normal.titleTextAttributes = [
      .foregroundColor: UIColor(SBTheme.secondaryInk),
    ]
    tabAppearance.stackedLayoutAppearance.selected.iconColor = UIColor(SBTheme.accent)
    tabAppearance.stackedLayoutAppearance.selected.titleTextAttributes = [
      .foregroundColor: UIColor(SBTheme.accent),
    ]
    UITabBar.appearance().standardAppearance = tabAppearance
    UITabBar.appearance().scrollEdgeAppearance = tabAppearance
  }
}
