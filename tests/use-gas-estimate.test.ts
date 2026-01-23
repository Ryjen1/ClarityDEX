import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGasEstimate } from '../frontend/hooks/use-gas-estimate';

// Mock fetch
global.fetch = vi.fn();

describe('useGasEstimate', () => {
  it('should return zero fee when disabled', () => {
    const { result } = renderHook(() => useGasEstimate(false));

    expect(result.current.fee).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should fetch fee estimate when enabled', async () => {
    const mockFeeData = { low: 100 };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockFeeData),
    });

    const { result } = renderHook(() => useGasEstimate(true));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.fee).toBe(200); // 100 * 2
    expect(result.current.error).toBe(null);
  });

  it('should handle API error and use fallback', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useGasEstimate(true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.fee).toBe(300); // fallback
    expect(result.current.error).toBe('Using fallback fee estimate');
  });

  it('should handle non-ok response', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    const { result } = renderHook(() => useGasEstimate(true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.fee).toBe(300); // fallback
    expect(result.current.error).toBe('Using fallback fee estimate');
  });
});