;; mining.clar - Liquidity Mining Contract for Stacks AMM DEX

;; traits
(use-trait ft-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-POOL-NOT-FOUND (err u101))
(define-constant ERR-POOL-INACTIVE (err u102))
(define-constant ERR-INSUFFICIENT-AMM-LIQUIDITY (err u103))
(define-constant ERR-INSUFFICIENT-STAKE (err u104))
(define-constant ERR-ZERO-AMOUNT (err u105))
(define-constant ERR-REENTRANCY (err u106))
(define-constant ERR-OVERFLOW (err u107))

;; data vars
(define-data-var contract-owner principal CONTRACT-OWNER)
(define-data-var locked bool false)

;; maps
(define-map mining-pools
  (buff 20)
  {
    reward-token: principal,
    emission-rate: uint,
    last-update-block: uint,
    reward-per-share: uint,
    total-staked: uint,
    active: bool
  }
)

(define-map user-stakes
  {pool-id: (buff 20), user: principal}
  {
    staked-liquidity: uint,
    reward-debt: uint
  }
)

(define-map pool-rewards-claimed (buff 20) uint)
(define-map user-rewards-claimed {pool-id: (buff 20), user: principal} uint)

;; read-only functions
(define-read-only (get-mining-pool-info (pool-id (buff 20)))
  (map-get? mining-pools pool-id)
)

(define-read-only (get-user-mining-info (pool-id (buff 20)) (user principal))
  (map-get? user-stakes {pool-id: pool-id, user: user})
)

(define-read-only (calculate-pending-rewards (pool-id (buff 20)) (user principal))
  (let (
    (pool (unwrap! (map-get? mining-pools pool-id) ERR-POOL-NOT-FOUND))
    (user-stake (default-to {staked-liquidity: u0, reward-debt: u0} (map-get? user-stakes {pool-id: pool-id, user: user})))
    (staked (get staked-liquidity user-stake))
    (debt (get reward-debt user-stake))
    (current-rps (get reward-per-share pool))
    (blocks-elapsed (- block-height (get last-update-block pool)))
    (emission (get emission-rate pool))
    (total-staked (get total-staked pool))
    (additional-rps (if (> total-staked u0) (/ (* blocks-elapsed emission) total-staked) u0))
    (new-rps (+ current-rps additional-rps))
  )
  (ok (- (* staked new-rps) debt))
  )
)

(define-read-only (get-pool-apr (pool-id (buff 20)))
  ;; Returns components for APR calculation
  (let (
    (pool (unwrap! (map-get? mining-pools pool-id) ERR-POOL-NOT-FOUND))
  )
  (ok {emission-rate: (get emission-rate pool), total-staked: (get total-staked pool)})
  )
)

;; private functions
(define-private (update-pool-rewards (pool-id (buff 20)))
  (let (
    (pool (unwrap! (map-get? mining-pools pool-id) ERR-POOL-NOT-FOUND))
    (active (get active pool))
    (last-block (get last-update-block pool))
    (emission (get emission-rate pool))
    (total-staked (get total-staked pool))
    (current-rps (get reward-per-share pool))
    (blocks-elapsed (- block-height last-block))
    (additional-rps (if (> total-staked u0) (/ (* blocks-elapsed emission) total-staked) u0))
    (new-rps (+ current-rps additional-rps))
  )
  (asserts! active ERR-POOL-INACTIVE)
  (map-set mining-pools pool-id (merge pool {
    last-update-block: block-height,
    reward-per-share: new-rps
  }))
  (ok true)
  )
)

;; public functions
(define-public (create-mining-pool (pool-id (buff 20)) (reward-token principal) (emission-rate uint))
  (let (
    (sender tx-sender)
    (owner (var-get contract-owner))
    ;; Check if AMM pool exists
    (amm-pool (unwrap! (contract-call? .amm get-pool-data pool-id) ERR-POOL-NOT-FOUND))
  )
  (asserts! (is-eq sender owner) ERR-NOT-AUTHORIZED)
  (asserts! (is-none (map-get? mining-pools pool-id)) ERR-POOL-NOT-FOUND)
  (map-set mining-pools pool-id {
    reward-token: reward-token,
    emission-rate: emission-rate,
    last-update-block: block-height,
    reward-per-share: u0,
    total-staked: u0,
    active: true
  })
  (ok true)
  )
)

(define-public (stake (pool-id (buff 20)) (amount uint))
  (let (
    (sender tx-sender)
    (locked-val (var-get locked))
  )
  (asserts! (not locked-val) ERR-REENTRANCY)
  (var-set locked true)
  (try! (update-pool-rewards pool-id))
  (let (
    (pool (unwrap! (map-get? mining-pools pool-id) ERR-POOL-NOT-FOUND))
    (amm-liquidity (unwrap! (contract-call? .amm get-position-liquidity pool-id sender) ERR-INSUFFICIENT-AMM-LIQUIDITY))
    (user-stake (default-to {staked-liquidity: u0, reward-debt: u0} (map-get? user-stakes {pool-id: pool-id, user: sender})))
    (current-staked (get staked-liquidity user-stake))
    (current-debt (get reward-debt user-stake))
    (rps (get reward-per-share pool))
    (new-staked (+ current-staked amount))
    (new-debt (+ current-debt (* amount rps)))
    (new-total-staked (+ (get total-staked pool) amount))
  )
  (asserts! (> amount u0) ERR-ZERO-AMOUNT)
  (asserts! (>= amm-liquidity amount) ERR-INSUFFICIENT-AMM-LIQUIDITY)
  (map-set user-stakes {pool-id: pool-id, user: sender} {
    staked-liquidity: new-staked,
    reward-debt: new-debt
  })
  (map-set mining-pools pool-id (merge pool {
    total-staked: new-total-staked
  }))
  (var-set locked false)
  (ok true)
  )
  )
)

(define-public (unstake (pool-id (buff 20)) (amount uint))
  (let (
    (sender tx-sender)
    (locked-val (var-get locked))
  )
  (asserts! (not locked-val) ERR-REENTRANCY)
  (var-set locked true)
  (try! (update-pool-rewards pool-id))
  (let (
    (pool (unwrap! (map-get? mining-pools pool-id) ERR-POOL-NOT-FOUND))
    (user-stake (unwrap! (map-get? user-stakes {pool-id: pool-id, user: sender}) ERR-INSUFFICIENT-STAKE))
    (staked (get staked-liquidity user-stake))
    (debt (get reward-debt user-stake))
    (rps (get reward-per-share pool))
    (pending (- (* staked rps) debt))
    (reward-token (get reward-token pool))
    (new-staked (- staked amount))
    (new-debt (- debt (* amount rps)))
    (new-total-staked (- (get total-staked pool) amount))
    (claimed (default-to u0 (map-get? pool-rewards-claimed pool-id)))
    (user-claimed (default-to u0 (map-get? user-rewards-claimed {pool-id: pool-id, user: sender})))
  )
  (asserts! (> amount u0) ERR-ZERO-AMOUNT)
  (asserts! (>= staked amount) ERR-INSUFFICIENT-STAKE)
  (if (> pending u0)
    (try! (as-contract (contract-call? reward-token transfer pending tx-sender sender none)))
    true
  )
  (map-set pool-rewards-claimed pool-id (+ claimed pending))
  (map-set user-rewards-claimed {pool-id: pool-id, user: sender} (+ user-claimed pending))
  (map-set user-stakes {pool-id: pool-id, user: sender} {
    staked-liquidity: new-staked,
    reward-debt: new-debt
  })
  (map-set mining-pools pool-id (merge pool {
    total-staked: new-total-staked
  }))
  (var-set locked false)
  (ok pending)
  )
  )
)

(define-public (claim-rewards (pool-id (buff 20)))
  (let (
    (sender tx-sender)
    (locked-val (var-get locked))
  )
  (asserts! (not locked-val) ERR-REENTRANCY)
  (var-set locked true)
  (try! (update-pool-rewards pool-id))
  (let (
    (pool (unwrap! (map-get? mining-pools pool-id) ERR-POOL-NOT-FOUND))
    (user-stake (unwrap! (map-get? user-stakes {pool-id: pool-id, user: sender}) ERR-INSUFFICIENT-STAKE))
    (staked (get staked-liquidity user-stake))
    (debt (get reward-debt user-stake))
    (rps (get reward-per-share pool))
    (pending (- (* staked rps) debt))
    (reward-token (get reward-token pool))
    (new-debt (+ debt pending))
    (claimed (default-to u0 (map-get? pool-rewards-claimed pool-id)))
    (user-claimed (default-to u0 (map-get? user-rewards-claimed {pool-id: pool-id, user: sender})))
  )
  (if (> pending u0)
    (try! (as-contract (contract-call? reward-token transfer pending tx-sender sender none)))
    true
  )
  (map-set pool-rewards-claimed pool-id (+ claimed pending))
  (map-set user-rewards-claimed {pool-id: pool-id, user: sender} (+ user-claimed pending))
  (map-set user-stakes {pool-id: pool-id, user: sender} (merge user-stake {
    reward-debt: new-debt
  }))
  (var-set locked false)
  (ok pending)
  )
  )
)

(define-public (emergency-unstake (pool-id (buff 20)) (amount uint))
  (let (
    (sender tx-sender)
    (locked-val (var-get locked))
  )
  (asserts! (not locked-val) ERR-REENTRANCY)
  (var-set locked true)
  (let (
    (pool (unwrap! (map-get? mining-pools pool-id) ERR-POOL-NOT-FOUND))
    (user-stake (unwrap! (map-get? user-stakes {pool-id: pool-id, user: sender}) ERR-INSUFFICIENT-STAKE))
    (staked (get staked-liquidity user-stake))
    (debt (get reward-debt user-stake))
    (rps (get reward-per-share pool))
    (new-staked (- staked amount))
    (new-debt (- debt (* amount rps)))
    (new-total-staked (- (get total-staked pool) amount))
  )
  (asserts! (> amount u0) ERR-ZERO-AMOUNT)
  (asserts! (>= staked amount) ERR-INSUFFICIENT-STAKE)
  (map-set user-stakes {pool-id: pool-id, user: sender} {
    staked-liquidity: new-staked,
    reward-debt: new-debt
  })
  (map-set mining-pools pool-id (merge pool {
    total-staked: new-total-staked
  }))
  (var-set locked false)
  (ok true)
  )
  )
)

;; admin functions
(define-public (update-emission-rate (pool-id (buff 20)) (new-rate uint))
  (let (
    (sender tx-sender)
    (owner (var-get contract-owner))
  )
  (asserts! (is-eq sender owner) ERR-NOT-AUTHORIZED)
  (try! (update-pool-rewards pool-id))
  (let (
    (pool (unwrap! (map-get? mining-pools pool-id) ERR-POOL-NOT-FOUND))
  )
  (map-set mining-pools pool-id (merge pool {
    emission-rate: new-rate
  }))
  (ok true)
  )
  )
)

(define-public (pause-pool-mining (pool-id (buff 20)))
  (let (
    (sender tx-sender)
    (owner (var-get contract-owner))
    (pool (unwrap! (map-get? mining-pools pool-id) ERR-POOL-NOT-FOUND))
  )
  (asserts! (is-eq sender owner) ERR-NOT-AUTHORIZED)
  (map-set mining-pools pool-id (merge pool {
    active: false
  }))
  (ok true)
  )
)

(define-public (resume-pool-mining (pool-id (buff 20)))
  (let (
    (sender tx-sender)
    (owner (var-get contract-owner))
    (pool (unwrap! (map-get? mining-pools pool-id) ERR-POOL-NOT-FOUND))
  )
  (asserts! (is-eq sender owner) ERR-NOT-AUTHORIZED)
  (map-set mining-pools pool-id (merge pool {
    active: true
  }))
  (ok true)
  )
)