import { STACKS_TESTNET } from "@stacks/network";
import {
  fetchCallReadOnlyFunction,
  cvToHex,
  hexToCV,
  contractPrincipalCV,
} from "@stacks/transactions";

export interface TokenMetadata {
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply?: number;
  tokenUri?: string;
}

export interface TokenValidation {
  isValid: boolean;
  implementsSip010: boolean;
  error?: string;
}

// Cache for token metadata
const tokenMetadataCache = new Map<string, { data: TokenMetadata; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Known tokens registry (basic implementation)
const KNOWN_TOKENS: TokenMetadata[] = [
  {
    contractAddress: "ST3P49R8XXQWG69S66MZASYPTTGNDKK0WW32RRJDN.mock-token",
    name: "Mock Token",
    symbol: "MT",
    decimals: 6,
  },
  // Add more known tokens here
];

/**
 * Fetches token metadata from a SIP-010 contract
 */
export async function fetchTokenMetadata(contractAddress: string): Promise<TokenMetadata> {
  // Check cache first
  const cached = tokenMetadataCache.get(contractAddress);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const [contractId, contractName] = contractAddress.split('.');

    // Fetch name
    const nameResult = await fetchCallReadOnlyFunction({
      contractAddress: contractId,
      contractName: contractName,
      functionName: "get-name",
      functionArgs: [],
      senderAddress: contractId,
      network: STACKS_TESTNET,
    });

    const name = nameResult.type === "ok" && nameResult.value.type === "ascii"
      ? nameResult.value.value
      : contractName;

    // Fetch symbol
    const symbolResult = await fetchCallReadOnlyFunction({
      contractAddress: contractId,
      contractName: contractName,
      functionName: "get-symbol",
      functionArgs: [],
      senderAddress: contractId,
      network: STACKS_TESTNET,
    });

    const symbol = symbolResult.type === "ok" && symbolResult.value.type === "ascii"
      ? symbolResult.value.value
      : contractName.substring(0, 3).toUpperCase();

    // Fetch decimals
    const decimalsResult = await fetchCallReadOnlyFunction({
      contractAddress: contractId,
      contractName: contractName,
      functionName: "get-decimals",
      functionArgs: [],
      senderAddress: contractId,
      network: STACKS_TESTNET,
    });

    const decimals = decimalsResult.type === "ok" && decimalsResult.value.type === "uint"
      ? parseInt(decimalsResult.value.value.toString())
      : 6; // Default to 6 decimals

    // Fetch total supply (optional)
    let totalSupply: number | undefined;
    try {
      const supplyResult = await fetchCallReadOnlyFunction({
        contractAddress: contractId,
        contractName: contractName,
        functionName: "get-total-supply",
        functionArgs: [],
        senderAddress: contractId,
        network: STACKS_TESTNET,
      });

      if (supplyResult.type === "ok" && supplyResult.value.type === "uint") {
        totalSupply = parseInt(supplyResult.value.value.toString());
      }
    } catch {
      // Total supply is optional
    }

    // Fetch token URI (optional)
    let tokenUri: string | undefined;
    try {
      const uriResult = await fetchCallReadOnlyFunction({
        contractAddress: contractId,
        contractName: contractName,
        functionName: "get-token-uri",
        functionArgs: [],
        senderAddress: contractId,
        network: STACKS_TESTNET,
      });

      if (uriResult.type === "ok" && uriResult.value.type === "some" && uriResult.value.value.type === "ascii") {
        tokenUri = uriResult.value.value.value;
      }
    } catch {
      // Token URI is optional
    }

    const metadata: TokenMetadata = {
      contractAddress,
      name,
      symbol,
      decimals,
      totalSupply,
      tokenUri,
    };

    // Cache the result
    tokenMetadataCache.set(contractAddress, { data: metadata, timestamp: Date.now() });

    return metadata;
  } catch (error) {
    console.error(`Failed to fetch metadata for ${contractAddress}:`, error);
    // Return fallback metadata
    const fallback: TokenMetadata = {
      contractAddress,
      name: contractAddress.split('.')[1] || 'Unknown Token',
      symbol: contractAddress.split('.')[1]?.substring(0, 3).toUpperCase() || 'UNK',
      decimals: 6,
    };

    // Cache fallback as well
    tokenMetadataCache.set(contractAddress, { data: fallback, timestamp: Date.now() });
    return fallback;
  }
}

/**
 * Validates if a contract implements SIP-010 trait
 */
export async function validateTokenContract(contractAddress: string): Promise<TokenValidation> {
  try {
    const [contractId, contractName] = contractAddress.split('.');

    if (!contractId || !contractName) {
      return {
        isValid: false,
        implementsSip010: false,
        error: "Invalid contract address format",
      };
    }

    // Try to call get-name to check if contract exists and has basic SIP-010 functions
    const nameResult = await fetchCallReadOnlyFunction({
      contractAddress: contractId,
      contractName: contractName,
      functionName: "get-name",
      functionArgs: [],
      senderAddress: contractId,
      network: STACKS_TESTNET,
    });

    if (nameResult.type !== "ok") {
      return {
        isValid: false,
        implementsSip010: false,
        error: "Contract does not implement get-name function",
      };
    }

    // Check for other required functions
    const requiredFunctions = ["get-symbol", "get-decimals", "get-balance", "get-total-supply", "transfer"];

    for (const func of requiredFunctions) {
      try {
        // For read-only functions, we can try calling them
        if (func !== "transfer") {
          await fetchCallReadOnlyFunction({
            contractAddress: contractId,
            contractName: contractName,
            functionName: func,
            functionArgs: func === "get-balance" ? [contractPrincipalCV(contractId, contractName)] : [],
            senderAddress: contractId,
            network: STACKS_TESTNET,
          });
        }
      } catch {
        return {
          isValid: false,
          implementsSip010: false,
          error: `Contract missing required function: ${func}`,
        };
      }
    }

    return {
      isValid: true,
      implementsSip010: true,
    };
  } catch (error) {
    console.error(`Validation failed for ${contractAddress}:`, error);
    return {
      isValid: false,
      implementsSip010: false,
      error: "Failed to validate contract",
    };
  }
}

/**
 * Returns known tokens registry
 */
export function getKnownTokens(): TokenMetadata[] {
  return KNOWN_TOKENS;
}

/**
 * Searches known tokens by name or symbol
 */
export function searchKnownTokens(query: string): TokenMetadata[] {
  const lowercaseQuery = query.toLowerCase();
  return KNOWN_TOKENS.filter(token =>
    token.name.toLowerCase().includes(lowercaseQuery) ||
    token.symbol.toLowerCase().includes(lowercaseQuery) ||
    token.contractAddress.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Formats token amount with proper decimals
 */
export function formatTokenAmount(amount: number | bigint, decimals: number): string {
  const amountStr = amount.toString();
  const amountLength = amountStr.length;

  if (amountLength <= decimals) {
    return `0.${'0'.repeat(decimals - amountLength)}${amountStr}`;
  }

  const integerPart = amountStr.slice(0, amountLength - decimals);
  const fractionalPart = amountStr.slice(amountLength - decimals);

  return `${integerPart}.${fractionalPart}`;
}

/**
 * Parses token amount from display format to raw amount
 */
export function parseTokenAmount(displayAmount: string, decimals: number): bigint {
  const [integerPart, fractionalPart = ''] = displayAmount.split('.');
  const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals);
  const fullAmount = integerPart + paddedFractional;
  return BigInt(fullAmount);
}