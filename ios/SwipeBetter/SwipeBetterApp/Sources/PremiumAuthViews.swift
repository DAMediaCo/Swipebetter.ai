import AuthenticationServices
import SwiftUI

struct PremiumAuthView: View {
  @Environment(AppModel.self) private var model
  @Environment(\.colorScheme) private var colorScheme
  @State private var isSignup = false
  @State private var email = ""
  @State private var password = ""
  @State private var firstName = ""
  @State private var lastName = ""
  @State private var promoCode = ""
  @State private var showingPasswordReset = false
  @State private var showingEmailForm = false

  private var canSubmit: Bool {
    !email.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && password.count >= 8
  }

  var body: some View {
    NavigationStack {
      Group {
        if showingEmailForm {
          ScrollView {
            VStack(alignment: .leading, spacing: 0) {
              brandHeader

              VStack(alignment: .leading, spacing: 22) {
                authForm
                appleSignIn
                pricingNote
                legalLinks
              }
              .padding(.horizontal, 20)
              .padding(.top, 24)
              .padding(.bottom, 32)
            }
          }
          .scrollDismissesKeyboard(.interactively)
          .sbPageBackground()
        } else {
          choiceScreen
        }
      }
    }
    .sheet(isPresented: $showingPasswordReset) {
      PremiumPasswordResetSheet(initialEmail: email)
        .environment(model)
        .presentationDetents([.medium])
        .presentationDragIndicator(.visible)
    }
  }

  private var choiceScreen: some View {
    VStack(alignment: .leading, spacing: 0) {
      SBLogoMark(size: 62)

      Text("SwipeBetter")
        .font(.largeTitle.weight(.bold))
        .foregroundStyle(.white)
        .padding(.top, 18)

      Text("Audit your dating profile and get replies that still sound like you.")
        .font(.body)
        .foregroundStyle(.white.opacity(0.72))
        .fixedSize(horizontal: false, vertical: true)
        .padding(.top, 8)

      Spacer(minLength: 30)

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
      .signInWithAppleButtonStyle(.white)
      .frame(height: 52)
      .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
      .accessibilityIdentifier("auth.appleSignInButton")

      Button("Continue with email") {
        isSignup = false
        showingEmailForm = true
      }
      .font(.headline)
      .foregroundStyle(.white)
      .frame(maxWidth: .infinity, minHeight: 52)
      .background(Color.white.opacity(0.12), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
      .padding(.top, 12)
      .accessibilityIdentifier("auth.continueWithEmailButton")

      Button("Create account") {
        isSignup = true
        showingEmailForm = true
      }
      .font(.subheadline.weight(.semibold))
      .foregroundStyle(SBTheme.accent)
      .frame(maxWidth: .infinity, minHeight: 44)
      .padding(.top, 4)
      .accessibilityIdentifier("auth.createAccountChoiceButton")

      Text("Screenshots are sent only for requested analysis and are excluded from your saved history.")
        .font(.caption)
        .foregroundStyle(.white.opacity(0.58))
        .multilineTextAlignment(.center)
        .frame(maxWidth: .infinity)
        .fixedSize(horizontal: false, vertical: true)
        .padding(.top, 6)

      Spacer(minLength: 54)
    }
    .padding(.horizontal, 24)
    .padding(.top, 120)
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    .background(Color.black.ignoresSafeArea())
    .preferredColorScheme(.dark)
  }

  private var brandHeader: some View {
    VStack(alignment: .leading, spacing: 16) {
      HStack(alignment: .center, spacing: 14) {
        SBLogoMark(size: 58)

        VStack(alignment: .leading, spacing: 2) {
          Text("SwipeBetter")
            .font(.title2.weight(.bold))
            .foregroundStyle(SBTheme.ink)

          Text("Dating decisions, made clearer.")
            .font(.subheadline.weight(.medium))
            .foregroundStyle(SBTheme.secondaryInk)
        }
      }

      Text("A clearer next move.")
        .font(.largeTitle.weight(.bold))
        .foregroundStyle(SBTheme.ink)
        .fixedSize(horizontal: false, vertical: true)

      Text("Bring a profile or conversation and leave with advice that still sounds like you.")
        .font(.subheadline)
        .foregroundStyle(SBTheme.secondaryInk)
        .lineSpacing(2)
        .fixedSize(horizontal: false, vertical: true)
    }
    .padding(.horizontal, 20)
    .padding(.top, 24)
    .padding(.bottom, 4)
    .frame(maxWidth: .infinity, alignment: .leading)
  }

  private var authForm: some View {
    SBSurface {
      VStack(spacing: 14) {
        Picker("Mode", selection: $isSignup) {
          Text("Log in").tag(false)
          Text("Create account").tag(true)
        }
        .pickerStyle(.segmented)

        VStack(spacing: 0) {
          if isSignup {
            HStack(spacing: 12) {
              premiumField("First name", text: $firstName, contentType: .givenName)
              premiumField("Last name", text: $lastName, contentType: .familyName)
            }
            SBDivider()
          }

          premiumField("Email", text: $email, contentType: .emailAddress)
            .keyboardType(.emailAddress)
            .textInputAutocapitalization(.never)
            .autocorrectionDisabled()
            .accessibilityIdentifier("auth.emailField")

          SBDivider()

          SecureField("Password", text: $password)
            .textContentType(isSignup ? .newPassword : .password)
            .frame(minHeight: 48)
            .accessibilityIdentifier("auth.passwordField")

          if isSignup {
            SBDivider()
            premiumField("Promo code (optional)", text: $promoCode, contentType: nil)
              .textInputAutocapitalization(.characters)
              .autocorrectionDisabled()
              .accessibilityIdentifier("auth.promoCodeField")
          }
        }

        Button {
          Task {
            if isSignup {
              await model.signup(
                email: email,
                password: password,
                firstName: firstName,
                lastName: lastName,
                promoCode: promoCode
              )
            } else {
              await model.login(email: email, password: password)
            }
          }
        } label: {
          Label(isSignup ? "Create account" : "Log in", systemImage: "arrow.right")
        }
        .buttonStyle(SBPrimaryButtonStyle())
        .disabled(!canSubmit)
        .opacity(canSubmit ? 1 : 0.48)
        .accessibilityIdentifier(isSignup ? "auth.createAccountButton" : "auth.loginButton")

        if isSignup {
          Text("By creating an account, you confirm you’re 18 or older and agree to the Terms and Privacy Policy.")
            .font(.caption)
            .foregroundStyle(SBTheme.secondaryInk)
            .multilineTextAlignment(.center)
            .fixedSize(horizontal: false, vertical: true)
        }

        if !isSignup {
          Button("Forgot password?") {
            showingPasswordReset = true
          }
          .font(.subheadline.weight(.semibold))
          .foregroundStyle(SBTheme.accent)
        }
      }
    }
  }

  private var appleSignIn: some View {
    VStack(spacing: 10) {
      HStack(spacing: 10) {
        SBDivider()
        Text("or")
          .font(.caption)
          .foregroundStyle(SBTheme.secondaryInk)
        SBDivider()
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
      .signInWithAppleButtonStyle(colorScheme == .dark ? .white : .black)
      .frame(height: 52)
      .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
      .accessibilityIdentifier("auth.appleSignInButton")
    }
  }

  private var pricingNote: some View {
    HStack(alignment: .top, spacing: 10) {
      Image(systemName: "checkmark.seal.fill")
        .foregroundStyle(SBTheme.teal)

      VStack(alignment: .leading, spacing: 3) {
        Text("Clear App Store pricing")
          .font(.caption.weight(.bold))
          .foregroundStyle(SBTheme.ink)

        Text("Starter credit pack, monthly, and annual options are available in Account.")
          .font(.caption)
          .foregroundStyle(SBTheme.secondaryInk)

        Text("iOS pricing includes Apple purchase fees.")
          .font(.caption2)
          .foregroundStyle(SBTheme.secondaryInk)
      }
    }
    .padding(14)
    .frame(maxWidth: .infinity, alignment: .leading)
    .background(SBTheme.tealSoft)
    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
  }

  private var legalLinks: some View {
    HStack(spacing: 20) {
      Link("Terms", destination: authURL("/terms"))
      Link("Privacy", destination: authURL("/privacy"))
      Link("Support", destination: authURL("/contact"))
    }
    .font(.caption.weight(.semibold))
    .foregroundStyle(SBTheme.secondaryInk)
    .frame(maxWidth: .infinity)
  }

  private func premiumField(
    _ title: String,
    text: Binding<String>,
    contentType: UITextContentType?
  ) -> some View {
    TextField(title, text: text)
      .textContentType(contentType)
      .frame(minHeight: 48)
      .textFieldStyle(.plain)
  }

  private func authURL(_ path: String) -> URL {
    URL(string: "https://swipebetter.ai\(path)")!
  }
}

struct PremiumPasswordResetSheet: View {
  @Environment(AppModel.self) private var model
  @Environment(\.dismiss) private var dismiss
  @State private var email: String
  @State private var message: String?

  init(initialEmail: String) {
    _email = State(initialValue: initialEmail)
  }

  var body: some View {
    NavigationStack {
      VStack(alignment: .leading, spacing: 18) {
        VStack(alignment: .leading, spacing: 6) {
          Text("Reset your password")
            .font(.title2.weight(.bold))
            .foregroundStyle(SBTheme.ink)

          Text("We’ll send a secure reset link to your account email.")
            .font(.subheadline)
            .foregroundStyle(SBTheme.secondaryInk)
        }

        TextField("Email", text: $email)
          .textContentType(.emailAddress)
          .keyboardType(.emailAddress)
          .textInputAutocapitalization(.never)
          .autocorrectionDisabled()
          .padding(.horizontal, 13)
          .frame(minHeight: 48)
          .background(SBTheme.surface)
          .clipShape(RoundedRectangle(cornerRadius: 7, style: .continuous))
          .overlay {
            RoundedRectangle(cornerRadius: 7, style: .continuous)
              .stroke(SBTheme.divider, lineWidth: 1)
          }

        Button {
          Task {
            message = await model.requestPasswordReset(email: email)
          }
        } label: {
          Label("Send reset link", systemImage: "envelope")
        }
        .buttonStyle(SBPrimaryButtonStyle())
        .disabled(email.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)

        if let message {
          Label(message, systemImage: "checkmark.circle.fill")
            .font(.subheadline)
            .foregroundStyle(SBTheme.teal)
            .padding(12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(SBTheme.tealSoft)
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        }

        Spacer()
      }
      .padding(20)
      .sbPageBackground()
      .toolbar {
        ToolbarItem(placement: .confirmationAction) {
          Button("Done") { dismiss() }
            .foregroundStyle(SBTheme.accent)
        }
      }
    }
  }
}
