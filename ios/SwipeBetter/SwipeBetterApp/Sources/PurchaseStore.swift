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
  var isLoadingProducts = false
  var purchasingProductId: String?
  var isRestoringPurchases = false

  func loadProducts() async {
    isLoadingProducts = true
    defer { isLoadingProducts = false }

    do {
      products = try await Product.products(for: productIds)
        .sorted { productRank($0.id) < productRank($1.id) }
      let loadedProductIds = Set(products.map(\.id))
      let missingProductIds = productIds.filter { !loadedProductIds.contains($0) }
      lastPurchaseMessage = missingProductIds.isEmpty ? nil : "Some App Store products are unavailable. Try again shortly."
    } catch {
      products = []
      lastPurchaseMessage = "Could not load App Store products yet."
    }
  }

  func purchase(_ product: Product, api: SwipeBetterAPI, userId: String?) async throws {
    guard purchasingProductId == nil else { return }
    purchasingProductId = product.id
    lastPurchaseMessage = nil
    defer { purchasingProductId = nil }

    let accountToken = userId.flatMap(UUID.init(uuidString:))
    let result = if let accountToken {
      try await product.purchase(options: [.appAccountToken(accountToken)])
    } else {
      try await product.purchase()
    }
    switch result {
    case .success(let verification):
      try await sync(verification: verification, api: api)
    case .pending:
      lastPurchaseMessage = "Purchase pending approval."
    case .userCancelled:
      lastPurchaseMessage = nil
    @unknown default:
      lastPurchaseMessage = "Purchase could not be completed."
    }
  }

  @discardableResult
  func syncCurrentEntitlements(api: SwipeBetterAPI, reportingFailures: Bool = false) async throws -> Int {
    var syncedCount = 0
    var firstSyncError: Error?

    for await entitlement in Transaction.currentEntitlements {
      guard case .verified(let transaction) = entitlement else { continue }
      do {
        try await sync(transaction: transaction, api: api)
        syncedCount += 1
      } catch {
        firstSyncError = firstSyncError ?? error
      }
    }

    if reportingFailures, let firstSyncError {
      throw firstSyncError
    }

    return syncedCount
  }

  func restorePurchases(api: SwipeBetterAPI) async throws {
    isRestoringPurchases = true
    defer { isRestoringPurchases = false }

    try await AppStore.sync()
    let syncedCount = try await syncCurrentEntitlements(api: api, reportingFailures: true)
    lastPurchaseMessage = syncedCount == 0 ? "No active App Store purchases found." : "Purchases restored."
  }

  func sync(verification: VerificationResult<Transaction>, api: SwipeBetterAPI) async throws {
    let transaction = try checkVerified(verification)
    try await sync(transaction: transaction, api: api)
    await transaction.finish()
    lastPurchaseMessage = "Purchase synced."
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
