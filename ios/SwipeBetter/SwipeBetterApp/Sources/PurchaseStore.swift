import Foundation
import Observation
import StoreKit
import UIKit

@MainActor
@Observable
final class PurchaseStore {
  private let productIds = [
    SwipeBetterConfig.starterProductId,
    SwipeBetterConfig.monthlyProductId,
    SwipeBetterConfig.annualProductId,
  ]

  var products: [Product] = []
  var lastPurchaseMessage: String?

  func loadProducts() async {
    do {
      products = try await Product.products(for: productIds)
        .sorted { productRank($0.id) < productRank($1.id) }
    } catch {
      lastPurchaseMessage = "Could not load App Store products yet."
    }
  }

  func purchase(_ product: Product, api: SwipeBetterAPI, userId: String?) async throws {
    let accountToken = userId.flatMap(UUID.init(uuidString:))
    let result = if let accountToken {
      try await product.purchase(options: [.appAccountToken(accountToken)])
    } else {
      try await product.purchase()
    }
    switch result {
    case .success(let verification):
      let transaction = try checkVerified(verification)
      try await sync(transaction: transaction, api: api)
      await transaction.finish()
      lastPurchaseMessage = "Purchase synced."
    case .pending:
      lastPurchaseMessage = "Purchase pending approval."
    case .userCancelled:
      lastPurchaseMessage = nil
    @unknown default:
      lastPurchaseMessage = "Purchase could not be completed."
    }
  }

  func syncCurrentEntitlements(api: SwipeBetterAPI) async {
    for await entitlement in Transaction.currentEntitlements {
      guard case .verified(let transaction) = entitlement else { continue }
      try? await sync(transaction: transaction, api: api)
    }
  }

  func restorePurchases(api: SwipeBetterAPI) async throws {
    try await AppStore.sync()
    await syncCurrentEntitlements(api: api)
    lastPurchaseMessage = "Purchases restored."
  }

  func manageSubscriptions() async throws {
    guard let scene = UIApplication.shared.connectedScenes
      .compactMap({ $0 as? UIWindowScene })
      .first(where: { $0.activationState == .foregroundActive }) else {
      throw SwipeBetterAPIError.server(status: 400, message: "Could not open Apple subscription management.")
    }

    try await AppStore.showManageSubscriptions(in: scene)
  }

  private func sync(transaction: Transaction, api: SwipeBetterAPI) async throws {
    let _: IAPSyncResponse = try await api.post(
      "/api/ios/iap/transactions",
      body: IAPSyncRequest(transactionId: String(transaction.id), productId: transaction.productID)
    )
  }

  private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
    switch result {
    case .verified(let safe):
      return safe
    case .unverified:
      throw SwipeBetterAPIError.server(status: 400, message: "App Store could not verify that purchase.")
    }
  }

  private func productRank(_ id: String) -> Int {
    switch id {
    case SwipeBetterConfig.starterProductId: return 0
    case SwipeBetterConfig.monthlyProductId: return 1
    case SwipeBetterConfig.annualProductId: return 2
    default: return 99
    }
  }
}
