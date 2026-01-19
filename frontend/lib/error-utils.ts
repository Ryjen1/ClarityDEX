export const ERROR_MESSAGES: Record<number, string> = {
  200: "Pool already exists. Please choose different tokens or fee.",
  201: "Incorrect token ordering. Tokens must be in alphabetical order.",
  202: "Insufficient liquidity to be added. Please increase the amounts.",
  203: "Not enough liquidity owned to withdraw the requested amount.",
  204: "Insufficient liquidity amounts being removed.",
  205: "Insufficient input token amount for swap.",
  206: "Insufficient liquidity in pool for swap.",
  207: "Insufficient amount of token 1 for swap.",
  208: "Insufficient amount of token 0 for swap.",
  209: "Pool does not exist.",
  210: "Invalid fee amount. Fee must be between 0 and 100%.",
  211: "Amount cannot be zero.",
  212: "Token transfer failed. Please check your balance.",
  213: "Unauthorized access.",
  214: "Insufficient token balance.",
  215: "Transaction timed out. Please try again.",
  216: "Network error. Please check your connection.",
  217: "Slippage tolerance exceeded. Please adjust your settings.",
  218: "Invalid function parameters.",
  219: "Contract is paused. Please try again later.",
};

export function getErrorMessage(errorCode: number): string {
  return ERROR_MESSAGES[errorCode] || "An unknown error occurred. Please try again.";
}

export function logTransactionError(action: string, error: any, userId?: string) {
  console.error(`Transaction Error - Action: ${action}`, {
    error,
    userId,
    timestamp: new Date().toISOString(),
  });
}

export function logTransactionSuccess(action: string, txId: string, userId?: string) {
  console.log(`Transaction Success - Action: ${action}`, {
    txId,
    userId,
    timestamp: new Date().toISOString(),
  });
}