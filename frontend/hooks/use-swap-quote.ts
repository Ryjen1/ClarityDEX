"use client";

import { useEffect, useState } from "react";
import {
  boolCV,
  fetchCallReadOnlyFunction,
  principalCV,
  uintCV,
} from "@stacks/transactions";
import { STACKS_TESTNET } from "@stacks/network";
import type { Pool } from "@/lib/amm";
import {
  AMM_CONTRACT_ADDRESS,
  AMM_CONTRACT_NAME,
} from "@/lib/amm";

export interface SwapQuote {
  outputAmount: bigint;
  feeAmount: bigint;
}

export interface UseSwapQuoteResult {
  quote: SwapQuote | null;
  isLoading: boolean;
  error: string | null;
}

// useSwapQuote hits the read-only contract function and gives the UI
// just enough state to show a preview, a spinner, or an error banner.

export function useSwapQuote(
  pool: Pool | null,
  amountIn: number,
  zeroForOne: boolean
): UseSwapQuoteResult {
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // wrap the async work so we can re-run it whenever inputs change

    async function fetchQuote() {
      if (!pool || amountIn <= 0) {
        // no pool chosen or zero input means nothing to preview
        setQuote(null);
        setError(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // call the Clarity function exactly the same way the frontend submits swaps
        const result = await fetchCallReadOnlyFunction({
          contractAddress: AMM_CONTRACT_ADDRESS,
          contractName: AMM_CONTRACT_NAME,
          functionName: "get-swap-quote",
          functionArgs: [
            principalCV(pool["token-0"]),
            principalCV(pool["token-1"]),
            uintCV(pool.fee),
            uintCV(amountIn),
            boolCV(zeroForOne),
          ],
          network: STACKS_TESTNET,
          senderAddress: AMM_CONTRACT_ADDRESS,
        });

        if (cancelled) return;

        if (result.type !== "ok" || result.value.type !== "tuple") {
          throw new Error("Could not retrieve swap quote");
        }

        // unpack the tuple that comes back from Clarity
        const tuple = result.value.value;
        const output = tuple["output-amount"];
        const fee = tuple["fee-amount"];

        if (output.type !== "uint" || fee.type !== "uint") {
          throw new Error("Unexpected quote return shape");
        }

        // normalise everything to bigint so the UI can do math safely
        setQuote({
          outputAmount: BigInt(output.value.toString()),
          feeAmount: BigInt(fee.value.toString()),
        });
      } catch (err) {
        if (cancelled) return;
        setQuote(null);
        setError((err as Error).message);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchQuote();

    return () => {
      // guard against state updates once the component unmounts
      cancelled = true;
    };
  }, [pool, amountIn, zeroForOne]);

  return { quote, isLoading, error };
}
