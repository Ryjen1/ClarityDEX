import { describe, it, expect } from 'vitest';
import { validateSlippageTolerance } from '../frontend/lib/validation';

describe('validateSlippageTolerance', () => {
  it('should return valid for valid slippage tolerance', () => {
    expect(validateSlippageTolerance('0.5')).toEqual({ isValid: true });
    expect(validateSlippageTolerance('1.0')).toEqual({ isValid: true });
    expect(validateSlippageTolerance('50')).toEqual({ isValid: true });
    expect(validateSlippageTolerance('0.01')).toEqual({ isValid: true });
    expect(validateSlippageTolerance('10.5')).toEqual({ isValid: true });
  });

  it('should return invalid for non-numeric input', () => {
    expect(validateSlippageTolerance('abc')).toEqual({
      isValid: false,
      errorMessage: 'Slippage tolerance must be a valid number'
    });
    expect(validateSlippageTolerance('')).toEqual({
      isValid: false,
      errorMessage: 'Slippage tolerance must be a valid number'
    });
  });

  it('should return invalid for zero or negative values', () => {
    expect(validateSlippageTolerance('0')).toEqual({
      isValid: false,
      errorMessage: 'Slippage tolerance must be greater than 0'
    });
    expect(validateSlippageTolerance('-1')).toEqual({
      isValid: false,
      errorMessage: 'Slippage tolerance must be greater than 0'
    });
  });

  it('should return invalid for values exceeding 50%', () => {
    expect(validateSlippageTolerance('50.1')).toEqual({
      isValid: false,
      errorMessage: 'Slippage tolerance cannot exceed 50%'
    });
    expect(validateSlippageTolerance('100')).toEqual({
      isValid: false,
      errorMessage: 'Slippage tolerance cannot exceed 50%'
    });
  });

  it('should return invalid for more than 2 decimal places', () => {
    expect(validateSlippageTolerance('0.123')).toEqual({
      isValid: false,
      errorMessage: 'Slippage tolerance can have at most 2 decimal places'
    });
    expect(validateSlippageTolerance('1.001')).toEqual({
      isValid: false,
      errorMessage: 'Slippage tolerance can have at most 2 decimal places'
    });
  });

  it('should return valid for exactly 2 decimal places', () => {
    expect(validateSlippageTolerance('0.12')).toEqual({ isValid: true });
    expect(validateSlippageTolerance('1.50')).toEqual({ isValid: true });
  });
});