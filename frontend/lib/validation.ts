export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export function validateSlippageTolerance(value: string): ValidationResult {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return { isValid: false, errorMessage: "Slippage tolerance must be a valid number" };
  }
  if (num <= 0) {
    return { isValid: false, errorMessage: "Slippage tolerance must be greater than 0" };
  }
  if (num > 50) {
    return { isValid: false, errorMessage: "Slippage tolerance cannot exceed 50%" };
  }
  // Check for reasonable precision, e.g., up to 2 decimal places
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    return { isValid: false, errorMessage: "Slippage tolerance can have at most 2 decimal places" };
  }
  return { isValid: true };
}