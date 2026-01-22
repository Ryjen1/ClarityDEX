import { describe, expect, it, vi } from "vitest";
import { fetchTokenMetadata, validateTokenContract } from "../frontend/lib/token-utils";

// Mock the @stacks/transactions module
vi.mock("@stacks/transactions", () => ({
  fetchCallReadOnlyFunction: vi.fn(),
  STACKS_TESTNET: {},
}));

import { fetchCallReadOnlyFunction } from "@stacks/transactions";

const mockFetchCallReadOnlyFunction = vi.mocked(fetchCallReadOnlyFunction);

describe("Token Utilities Tests", () => {
  const contractAddress = "ST3P49R8XXQWG69S66MZASYPTTGNDKK0WW32RRJDN";
  const contractName = "mock-token";

  describe("fetchTokenMetadata", () => {
    it("should fetch metadata for a valid token contract", async () => {
      mockFetchCallReadOnlyFunction.mockImplementation((args) => {
        if (args.functionName === "get-name") {
          return Promise.resolve({ type: "ok", value: { type: "ascii", value: "Mock Token" } });
        }
        if (args.functionName === "get-symbol") {
          return Promise.resolve({ type: "ok", value: { type: "ascii", value: "MT" } });
        }
        if (args.functionName === "get-decimals") {
          return Promise.resolve({ type: "ok", value: { type: "uint", value: 6n } });
        }
        if (args.functionName === "get-total-supply") {
          return Promise.resolve({ type: "ok", value: { type: "uint", value: 1000000n } });
        }
        return Promise.resolve({ type: "error" });
      });

      const metadata = await fetchTokenMetadata(contractAddress, contractName);

      expect(metadata).toEqual({
        contractAddress,
        contractName,
        name: "Mock Token",
        symbol: "MT",
        decimals: 6,
        totalSupply: 1000000,
      });
    });

    it("should return null for invalid token contract", async () => {
      mockFetchCallReadOnlyFunction.mockResolvedValue({ type: "error" });

      const metadata = await fetchTokenMetadata(contractAddress, contractName);

      expect(metadata).toBeNull();
    });

    it("should handle missing total supply", async () => {
      mockFetchCallReadOnlyFunction.mockImplementation((args) => {
        if (args.functionName === "get-name") {
          return Promise.resolve({ type: "ok", value: { type: "ascii", value: "Mock Token" } });
        }
        if (args.functionName === "get-symbol") {
          return Promise.resolve({ type: "ok", value: { type: "ascii", value: "MT" } });
        }
        if (args.functionName === "get-decimals") {
          return Promise.resolve({ type: "ok", value: { type: "uint", value: 6n } });
        }
        if (args.functionName === "get-total-supply") {
          return Promise.resolve({ type: "error" });
        }
        return Promise.resolve({ type: "error" });
      });

      const metadata = await fetchTokenMetadata(contractAddress, contractName);

      expect(metadata).toEqual({
        contractAddress,
        contractName,
        name: "Mock Token",
        symbol: "MT",
        decimals: 6,
        totalSupply: undefined,
      });
    });
  });

  describe("validateTokenContract", () => {
    it("should validate a valid token contract", async () => {
      mockFetchCallReadOnlyFunction.mockImplementation((args) => {
        if (args.functionName === "get-name") {
          return Promise.resolve({ type: "ok", value: { type: "ascii", value: "Mock Token" } });
        }
        if (args.functionName === "get-symbol") {
          return Promise.resolve({ type: "ok", value: { type: "ascii", value: "MT" } });
        }
        if (args.functionName === "get-decimals") {
          return Promise.resolve({ type: "ok", value: { type: "uint", value: 6n } });
        }
        return Promise.resolve({ type: "error" });
      });

      const validation = await validateTokenContract(contractAddress, contractName);

      expect(validation).toEqual({ isValid: true });
    });

    it("should invalidate contract without get-name", async () => {
      mockFetchCallReadOnlyFunction.mockResolvedValue({ type: "error" });

      const validation = await validateTokenContract(contractAddress, contractName);

      expect(validation).toEqual({ isValid: false, error: "Invalid token contract: no get-name function" });
    });

    it("should invalidate contract without get-symbol", async () => {
      mockFetchCallReadOnlyFunction.mockImplementation((args) => {
        if (args.functionName === "get-name") {
          return Promise.resolve({ type: "ok", value: { type: "ascii", value: "Mock Token" } });
        }
        return Promise.resolve({ type: "error" });
      });

      const validation = await validateTokenContract(contractAddress, contractName);

      expect(validation).toEqual({ isValid: false, error: "Invalid token contract: no get-symbol function" });
    });

    it("should invalidate contract without get-decimals", async () => {
      mockFetchCallReadOnlyFunction.mockImplementation((args) => {
        if (args.functionName === "get-name") {
          return Promise.resolve({ type: "ok", value: { type: "ascii", value: "Mock Token" } });
        }
        if (args.functionName === "get-symbol") {
          return Promise.resolve({ type: "ok", value: { type: "ascii", value: "MT" } });
        }
        return Promise.resolve({ type: "error" });
      });

      const validation = await validateTokenContract(contractAddress, contractName);

      expect(validation).toEqual({ isValid: false, error: "Invalid token contract: no get-decimals function" });
    });

    it("should handle network errors", async () => {
      mockFetchCallReadOnlyFunction.mockRejectedValue(new Error("Network error"));

      const validation = await validateTokenContract(contractAddress, contractName);

      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain("Error validating token contract");
    });
  });

  describe("Real token scenarios", () => {
    it("should handle real token with different decimals", async () => {
      mockFetchCallReadOnlyFunction.mockImplementation((args) => {
        if (args.functionName === "get-name") {
          return Promise.resolve({ type: "ok", value: { type: "ascii", value: "USD Token" } });
        }
        if (args.functionName === "get-symbol") {
          return Promise.resolve({ type: "ok", value: { type: "ascii", value: "USDA" } });
        }
        if (args.functionName === "get-decimals") {
          return Promise.resolve({ type: "ok", value: { type: "uint", value: 8n } });
        }
        if (args.functionName === "get-total-supply") {
          return Promise.resolve({ type: "ok", value: { type: "uint", value: 500000000n } });
        }
        return Promise.resolve({ type: "error" });
      });

      const metadata = await fetchTokenMetadata("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "usda-token");

      expect(metadata).toEqual({
        contractAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        contractName: "usda-token",
        name: "USD Token",
        symbol: "USDA",
        decimals: 8,
        totalSupply: 500000000,
      });
    });
  });
});