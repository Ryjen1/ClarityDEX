import { STACKS_TESTNET } from "@stacks/network";
import { fetchCallReadOnlyFunction } from "@stacks/transactions";

export interface TokenMetadata {
  contractAddress: string;
  contractName: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply?: number;
}

export interface TokenValidation {
  isValid: boolean;
  error?: string;
}

export const KNOWN_TOKENS: Record<string, TokenMetadata> = {
  'STX': {
    contractAddress: '',
    contractName: 'STX',
    name: 'Stacks',
    symbol: 'STX',
    decimals: 6,
  },
  'ST3P49R8XXQWG69S66MZASYPTTGNDKK0WW32RRJDN.mock-token': {
    contractAddress: 'ST3P49R8XXQWG69S66MZASYPTTGNDKK0WW32RRJDN',
    contractName: 'mock-token',
    name: 'Mock Token',
    symbol: 'MT',
    decimals: 6,
  },
  'ST3P49R8XXQWG69S66MZASYPTTGNDKK0WW32RRJDN.mock-token-2': {
    contractAddress: 'ST3P49R8XXQWG69S66MZASYPTTGNDKK0WW32RRJDN',
    contractName: 'mock-token-2',
    name: 'Mock Token 2',
    symbol: 'MT2',
    decimals: 6,
  },
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usda-token': {
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'usda-token',
    name: 'USDA',
    symbol: 'USDA',
    decimals: 6,
  },
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wstx-token': {
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'wstx-token',
    name: 'Wrapped STX',
    symbol: 'wSTX',
    decimals: 6,
  },
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.weth-token': {
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'weth-token',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
  },
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-token': {
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'sbtc-token',
    name: 'Wrapped Bitcoin',
    symbol: 'sBTC',
    decimals: 8,
  },
  // Add more popular testnet tokens here as needed
};

export async function fetchTokenMetadata(contractAddress: string, contractName: string): Promise<TokenMetadata | null> {
  try {
    const nameResult = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-name',
      functionArgs: [],
      senderAddress: contractAddress,
      network: STACKS_TESTNET,
    });
    if (nameResult.type !== 'ok' || nameResult.value.type !== 'ascii') return null;
    const name = nameResult.value.value;

    const symbolResult = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-symbol',
      functionArgs: [],
      senderAddress: contractAddress,
      network: STACKS_TESTNET,
    });
    if (symbolResult.type !== 'ok' || symbolResult.value.type !== 'ascii') return null;
    const symbol = symbolResult.value.value;

    const decimalsResult = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-decimals',
      functionArgs: [],
      senderAddress: contractAddress,
      network: STACKS_TESTNET,
    });
    if (decimalsResult.type !== 'ok' || decimalsResult.value.type !== 'uint') return null;
    const decimals = parseInt(decimalsResult.value.value.toString());

    const totalSupplyResult = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-total-supply',
      functionArgs: [],
      senderAddress: contractAddress,
      network: STACKS_TESTNET,
    });
    let totalSupply: number | undefined;
    if (totalSupplyResult.type === 'ok' && totalSupplyResult.value.type === 'uint') {
      totalSupply = parseInt(totalSupplyResult.value.value.toString());
    }

    return {
      contractAddress,
      contractName,
      name,
      symbol,
      decimals,
      totalSupply,
    };
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return null;
  }
}

export async function validateTokenContract(contractAddress: string, contractName: string): Promise<TokenValidation> {
  try {
    const nameResult = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-name',
      functionArgs: [],
      senderAddress: contractAddress,
      network: STACKS_TESTNET,
    });
    if (nameResult.type !== 'ok' || nameResult.value.type !== 'ascii') {
      return { isValid: false, error: 'Invalid token contract: no get-name function' };
    }

    const symbolResult = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-symbol',
      functionArgs: [],
      senderAddress: contractAddress,
      network: STACKS_TESTNET,
    });
    if (symbolResult.type !== 'ok' || symbolResult.value.type !== 'ascii') {
      return { isValid: false, error: 'Invalid token contract: no get-symbol function' };
    }

    const decimalsResult = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-decimals',
      functionArgs: [],
      senderAddress: contractAddress,
      network: STACKS_TESTNET,
    });
    if (decimalsResult.type !== 'ok' || decimalsResult.value.type !== 'uint') {
      return { isValid: false, error: 'Invalid token contract: no get-decimals function' };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: `Error validating token contract: ${error.message}` };
  }
}