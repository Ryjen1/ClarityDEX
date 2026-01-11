
import { Cl, cvToJSON } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;

describe("Mock Token Tests", () => {
  it("ensures simnet is well initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  describe("SIP-010 Token Metadata", () => {
    it("returns correct token name", () => {
      const { result } = simnet.callReadOnlyFn("mock-token", "get-name", [], address1);
      expect(result).toBeOk(Cl.stringAscii("Mock Token"));
    });

    it("returns correct token symbol", () => {
      const { result } = simnet.callReadOnlyFn("mock-token", "get-symbol", [], address1);
      expect(result).toBeOk(Cl.stringAscii("MT"));
    });

    it("returns correct decimals", () => {
      const { result } = simnet.callReadOnlyFn("mock-token", "get-decimals", [], address1);
      expect(result).toBeOk(Cl.uint(6));
    });

    it("returns correct total supply initially", () => {
      const { result } = simnet.callReadOnlyFn("mock-token", "get-total-supply", [], address1);
      expect(result).toBeOk(Cl.uint(0));
    });

    it("returns correct token URI", () => {
      const { result } = simnet.callReadOnlyFn("mock-token", "get-token-uri", [], address1);
      expect(result).toBeOk(Cl.none());
    });
  });

  describe("Token Operations", () => {
    it("mints tokens successfully", () => {
      const mintAmount = 1000000;
      const { result, events } = simnet.callPublicFn(
        "mock-token",
        "mint",
        [Cl.uint(mintAmount), Cl.principal(address1)],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));
      expect(events.length).toBe(1);
      expect(events[0].event).toBe("ft_mint_event");
      expect(events[0].data.amount).toBe(mintAmount.toString());
    });

    it("returns correct balance after minting", () => {
      const mintAmount = 500000;
      simnet.callPublicFn(
        "mock-token",
        "mint",
        [Cl.uint(mintAmount), Cl.principal(address1)],
        deployer
      );

      const { result } = simnet.callReadOnlyFn("mock-token", "get-balance", [Cl.principal(address1)], address1);
      expect(result).toBeOk(Cl.uint(mintAmount));
    });

    it("transfers tokens successfully", () => {
      // Mint tokens first
      simnet.callPublicFn(
        "mock-token",
        "mint",
        [Cl.uint(1000000), Cl.principal(address1)],
        deployer
      );

      const transferAmount = 500000;
      const { result, events } = simnet.callPublicFn(
        "mock-token",
        "transfer",
        [Cl.uint(transferAmount), Cl.principal(address1), Cl.principal(address2), Cl.none()],
        address1
      );

      expect(result).toBeOk(Cl.bool(true));
      expect(events.length).toBe(1);
      expect(events[0].event).toBe("ft_transfer_event");
      expect(events[0].data.amount).toBe(transferAmount.toString());
    });

    it("updates balances correctly after transfer", () => {
      // Mint to address1
      simnet.callPublicFn(
        "mock-token",
        "mint",
        [Cl.uint(1000000), Cl.principal(address1)],
        deployer
      );

      const transferAmount = 300000;
      simnet.callPublicFn(
        "mock-token",
        "transfer",
        [Cl.uint(transferAmount), Cl.principal(address1), Cl.principal(address2), Cl.none()],
        address1
      );

      const { result: balance1 } = simnet.callReadOnlyFn("mock-token", "get-balance", [Cl.principal(address1)], address1);
      const { result: balance2 } = simnet.callReadOnlyFn("mock-token", "get-balance", [Cl.principal(address2)], address2);

      expect(balance1).toBeOk(Cl.uint(700000));
      expect(balance2).toBeOk(Cl.uint(300000));
    });

    it("updates total supply correctly", () => {
      simnet.callPublicFn(
        "mock-token",
        "mint",
        [Cl.uint(2000000), Cl.principal(address1)],
        deployer
      );

      const { result } = simnet.callReadOnlyFn("mock-token", "get-total-supply", [], address1);
      expect(result).toBeOk(Cl.uint(2000000));
    });
  });

  describe("Token Metadata Validation", () => {
    it("validates token metadata structure", () => {
      const { result: nameResult } = simnet.callReadOnlyFn("mock-token", "get-name", [], address1);
      const { result: symbolResult } = simnet.callReadOnlyFn("mock-token", "get-symbol", [], address1);
      const { result: decimalsResult } = simnet.callReadOnlyFn("mock-token", "get-decimals", [], address1);

      expect(nameResult).toBeOk(Cl.stringAscii("Mock Token"));
      expect(symbolResult).toBeOk(Cl.stringAscii("MT"));
      expect(decimalsResult).toBeOk(Cl.uint(6));

      // Simulate TokenMetadata interface validation
      const metadata = {
        contractAddress: `${deployer}.mock-token`,
        name: cvToJSON(nameResult).value.value,
        symbol: cvToJSON(symbolResult).value.value,
        decimals: parseInt(cvToJSON(decimalsResult).value.value),
      };

      expect(metadata.name).toBe("Mock Token");
      expect(metadata.symbol).toBe("MT");
      expect(metadata.decimals).toBe(6);
      expect(metadata.contractAddress).toBe(`${deployer}.mock-token`);
    });
  });
});
