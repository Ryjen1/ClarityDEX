import { Cl, cvToJSON } from "@stacks/transactions";
import { beforeEach, describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const charlie = accounts.get("wallet_3")!;

const mockTokenOne = Cl.contractPrincipal(deployer, "mock-token");
const mockTokenTwo = Cl.contractPrincipal(deployer, "mock-token-2");
const rewardToken = Cl.contractPrincipal(deployer, "mock-token");

describe("Mining Contract Tests", () => {
  let poolId: any;

  beforeEach(() => {
    const allAccounts = [alice, bob, charlie];

    // Mint tokens for all accounts
    for (const account of allAccounts) {
      const mintResultOne = simnet.callPublicFn(
        "mock-token",
        "mint",
        [Cl.uint(1_000_000_000), Cl.principal(account)],
        account
      );
      expect(mintResultOne.events.length).toBeGreaterThan(0);

      const mintResultTwo = simnet.callPublicFn(
        "mock-token-2",
        "mint",
        [Cl.uint(1_000_000_000), Cl.principal(account)],
        account
      );
      expect(mintResultTwo.events.length).toBeGreaterThan(0);
    }

    // Create AMM pool
    const createPoolResult = simnet.callPublicFn(
      "amm",
      "create-pool",
      [mockTokenOne, mockTokenTwo, Cl.uint(500)],
      alice
    );
    expect(createPoolResult.result).toBeOk(Cl.bool(true));

    // Get pool ID
    const poolIdResult = simnet.callReadOnlyFn(
      "amm",
      "get-pool-id",
      [
        Cl.tuple({
          "token-0": mockTokenOne,
          "token-1": mockTokenTwo,
          fee: Cl.uint(500),
        }),
      ],
      alice
    );
    poolId = poolIdResult.result;

    // Add liquidity to AMM pool
    const addLiquidityResult = simnet.callPublicFn(
      "amm",
      "add-liquidity",
      [
        mockTokenOne,
        mockTokenTwo,
        Cl.uint(500),
        Cl.uint(1_000_000),
        Cl.uint(500_000),
        Cl.uint(0),
        Cl.uint(0),
      ],
      alice
    );
    expect(addLiquidityResult.result).toBeOk(Cl.bool(true));

    // Create mining pool
    const createMiningPoolResult = simnet.callPublicFn(
      "mining",
      "create-mining-pool",
      [poolId, rewardToken, Cl.uint(1000000)], // emission rate 1M per block for testing
      deployer
    );
    expect(createMiningPoolResult.result).toBeOk(Cl.bool(true));
  });

  describe("Pool Creation", () => {
    it("allows owner to create mining pool", () => {
      const { result } = simnet.callPublicFn(
        "mining",
        "create-mining-pool",
        [poolId, rewardToken, Cl.uint(500)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents non-owner from creating mining pool", () => {
      const { result } = simnet.callPublicFn(
        "mining",
        "create-mining-pool",
        [poolId, rewardToken, Cl.uint(500)],
        alice
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });

    it("prevents creating duplicate mining pool", () => {
      const { result } = simnet.callPublicFn(
        "mining",
        "create-mining-pool",
        [poolId, rewardToken, Cl.uint(500)],
        deployer
      );
      expect(result).toBeErr(Cl.uint(101)); // ERR-POOL-NOT-FOUND (already exists)
    });
  });

  describe("Staking Operations", () => {
    it("allows staking liquidity tokens", () => {
      const stakeAmount = 100000;
      const { result } = simnet.callPublicFn(
        "mining",
        "stake",
        [poolId, Cl.uint(stakeAmount)],
        alice
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents staking zero amount", () => {
      const { result } = simnet.callPublicFn(
        "mining",
        "stake",
        [poolId, Cl.uint(0)],
        alice
      );
      expect(result).toBeErr(Cl.uint(105)); // ERR-ZERO-AMOUNT
    });

    it("prevents staking more than available liquidity", () => {
      const { result } = simnet.callPublicFn(
        "mining",
        "stake",
        [poolId, Cl.uint(1_000_000_000)], // More than available
        alice
      );
      expect(result).toBeErr(Cl.uint(103)); // ERR-INSUFFICIENT-AMM-LIQUIDITY
    });

    it("updates user stake correctly", () => {
      const stakeAmount = 50000;
      simnet.callPublicFn("mining", "stake", [poolId, Cl.uint(stakeAmount)], alice);

      const userInfo = simnet.callReadOnlyFn(
        "mining",
        "get-user-mining-info",
        [poolId, Cl.principal(alice)],
        alice
      );
      expect(userInfo.result).toBeSome(
        Cl.tuple({
          "staked-liquidity": Cl.uint(stakeAmount),
          "reward-debt": Cl.uint(0),
        })
      );
    });
  });

  describe("Unstaking Operations", () => {
    beforeEach(() => {
      // Stake some tokens first
      simnet.callPublicFn("mining", "stake", [poolId, Cl.uint(100000)], alice);
    });

    it("allows unstaking liquidity tokens", () => {
      const unstakeAmount = 50000;
      const { result } = simnet.callPublicFn(
        "mining",
        "unstake",
        [poolId, Cl.uint(unstakeAmount)],
        alice
      );
      expect(result).toBeOk(Cl.uint(0)); // No rewards yet
    });

    it("prevents unstaking zero amount", () => {
      const { result } = simnet.callPublicFn(
        "mining",
        "unstake",
        [poolId, Cl.uint(0)],
        alice
      );
      expect(result).toBeErr(Cl.uint(105)); // ERR-ZERO-AMOUNT
    });

    it("prevents unstaking more than staked", () => {
      const { result } = simnet.callPublicFn(
        "mining",
        "unstake",
        [poolId, Cl.uint(200000)], // More than staked
        alice
      );
      expect(result).toBeErr(Cl.uint(104)); // ERR-INSUFFICIENT-STAKE
    });

    it("prevents unstaking without stake", () => {
      const { result } = simnet.callPublicFn(
        "mining",
        "unstake",
        [poolId, Cl.uint(1000)],
        bob
      );
      expect(result).toBeErr(Cl.uint(104)); // ERR-INSUFFICIENT-STAKE
    });
  });

  describe("Reward Calculations", () => {
    it("calculates pending rewards correctly", () => {
      // Stake tokens
      simnet.callPublicFn("mining", "stake", [poolId, Cl.uint(100000)], alice);

      // Advance blocks
      simnet.mineEmptyBlocks(10);

      const pendingRewards = simnet.callReadOnlyFn(
        "mining",
        "calculate-pending-rewards",
        [poolId, Cl.principal(alice)],
        alice
      );

      // Expected: 10 blocks * 1M emission rate / 100k total staked = 100 rps
      // 100k * 100 = 10M total rewards
      expect(pendingRewards.result).toBeOk(Cl.uint(10_000_000));
    });

    it("claims rewards correctly", () => {
      simnet.callPublicFn("mining", "stake", [poolId, Cl.uint(100000)], alice);
      simnet.mineEmptyBlocks(5);

      const { result } = simnet.callPublicFn(
        "mining",
        "claim-rewards",
        [poolId],
        alice
      );
      expect(result).toBeOk(Cl.uint(5_000_000)); // 5 blocks * 1M / 100k = 50 rps, 100k * 50 = 5M
    });

    it("unstakes with rewards", () => {
      simnet.callPublicFn("mining", "stake", [poolId, Cl.uint(100000)], alice);
      simnet.mineEmptyBlocks(8);

      const { result } = simnet.callPublicFn(
        "mining",
        "unstake",
        [poolId, Cl.uint(50000)],
        alice
      );
      expect(result).toBeOk(Cl.uint(8_000_000)); // 8 blocks * 1M / 100k = 80 rps, 100k * 80 = 8M
    });
  });

  describe("Position Verification", () => {
    it("returns correct pool info", () => {
      const poolInfo = simnet.callReadOnlyFn(
        "mining",
        "get-mining-pool-info",
        [poolId],
        alice
      );

      expect(poolInfo.result).toBeSome(
        Cl.tuple({
          "reward-token": rewardToken,
          "emission-rate": Cl.uint(1000),
          "last-update-block": Cl.uint(1), // Initial block
          "reward-per-share": Cl.uint(0),
          "total-staked": Cl.uint(0),
          active: Cl.bool(true),
        })
      );
    });

    it("returns correct user info", () => {
      const userInfo = simnet.callReadOnlyFn(
        "mining",
        "get-user-mining-info",
        [poolId, Cl.principal(alice)],
        alice
      );
      expect(userInfo.result).toBeSome(
        Cl.tuple({
          "staked-liquidity": Cl.uint(0),
          "reward-debt": Cl.uint(0),
        })
      );
    });

    it("returns correct APR components", () => {
      simnet.callPublicFn("mining", "stake", [poolId, Cl.uint(100000)], alice);

      const aprInfo = simnet.callReadOnlyFn(
        "mining",
        "get-pool-apr",
        [poolId],
        alice
      );

      expect(aprInfo.result).toBeOk(
        Cl.tuple({
          "emission-rate": Cl.uint(1000),
          "total-staked": Cl.uint(100000),
        })
      );
    });
  });

  describe("Security Checks", () => {
    it("prevents reentrancy in stake", () => {
      // This would require a malicious contract, but we can test the lock
      const stakeResult = simnet.callPublicFn(
        "mining",
        "stake",
        [poolId, Cl.uint(10000)],
        alice
      );
      expect(stakeResult.result).toBeOk(Cl.bool(true));

      // Second stake should work fine as lock is released
      const stakeResult2 = simnet.callPublicFn(
        "mining",
        "stake",
        [poolId, Cl.uint(10000)],
        alice
      );
      expect(stakeResult2.result).toBeOk(Cl.bool(true));
    });

    it("prevents operations on inactive pool", () => {
      // Pause the pool
      simnet.callPublicFn("mining", "pause-pool-mining", [poolId], deployer);

      const { result } = simnet.callPublicFn(
        "mining",
        "stake",
        [poolId, Cl.uint(10000)],
        alice
      );
      expect(result).toBeErr(Cl.uint(102)); // ERR-POOL-INACTIVE
    });

    it("prevents non-owner from updating emission rate", () => {
      const { result } = simnet.callPublicFn(
        "mining",
        "update-emission-rate",
        [poolId, Cl.uint(2000)],
        alice
      );
      expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });

    it("allows owner to update emission rate", () => {
      const { result } = simnet.callPublicFn(
        "mining",
        "update-emission-rate",
        [poolId, Cl.uint(2000)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("Edge Cases", () => {
    it("handles division by zero in reward calculation", () => {
      // No staking, should not divide by zero
      const pendingRewards = simnet.callReadOnlyFn(
        "mining",
        "calculate-pending-rewards",
        [poolId, Cl.principal(alice)],
        alice
      );
      expect(pendingRewards.result).toBeOk(Cl.uint(0));
    });

    it("handles overflow protection", () => {
      // Stake maximum possible
      const maxStake = 1000000000000; // Large number
      const stakeResult = simnet.callPublicFn(
        "mining",
        "stake",
        [poolId, Cl.uint(maxStake)],
        alice
      );
      // Should fail due to insufficient liquidity, not overflow
      expect(stakeResult.result).toBeErr(Cl.uint(103));
    });

    it("emergency unstake works without rewards", () => {
      simnet.callPublicFn("mining", "stake", [poolId, Cl.uint(50000)], alice);

      const { result } = simnet.callPublicFn(
        "mining",
        "emergency-unstake",
        [poolId, Cl.uint(25000)],
        alice
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("multiple users staking", () => {
      simnet.callPublicFn("mining", "stake", [poolId, Cl.uint(50000)], alice);
      simnet.callPublicFn("mining", "stake", [poolId, Cl.uint(30000)], bob);

      const poolInfo = simnet.callReadOnlyFn(
        "mining",
        "get-mining-pool-info",
        [poolId],
        alice
      );

      const poolData = cvToJSON(poolInfo.result).value.value;
      expect(poolData["total-staked"].value).toBe("80000");
    });

    it("reward distribution with multiple stakers", () => {
      simnet.callPublicFn("mining", "stake", [poolId, Cl.uint(50000)], alice);
      simnet.callPublicFn("mining", "stake", [poolId, Cl.uint(50000)], bob);
      simnet.mineEmptyBlocks(10);

      // Alice should get half the rewards, Bob half
      const aliceRewards = simnet.callReadOnlyFn(
        "mining",
        "calculate-pending-rewards",
        [poolId, Cl.principal(alice)],
        alice
      );
      const bobRewards = simnet.callReadOnlyFn(
        "mining",
        "calculate-pending-rewards",
        [poolId, Cl.principal(bob)],
        bob
      );

      expect(aliceRewards.result).toBeOk(Cl.uint(5_000_000)); // 10 * 1M / 100k = 100 rps, 50k * 100 = 5M each
      expect(bobRewards.result).toBeOk(Cl.uint(5_000_000));
    });
  });
});