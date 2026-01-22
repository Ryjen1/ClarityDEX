import {
  addLiquidity,
  createPool,
  Pool,
  removeLiquidity,
  swap,
} from "@/lib/amm";
import {
  AppConfig,
  openContractCall,
  showConnect,
  type UserData,
  UserSession,
} from "@stacks/connect";
import { PostConditionMode } from "@stacks/transactions";
import { useEffect, useState } from "react";
import { getErrorMessage, logTransactionError, logTransactionSuccess } from "@/lib/error-utils";

const appDetails = {
  name: "Full Range AMM",
  icon: "https://cryptologos.cc/logos/stacks-stx-logo.png",
};

export type TransactionStatus = 'idle' | 'pending' | 'success' | 'error';

export interface TransactionState {
  status: TransactionStatus;
  error?: string;
  txId?: string;
  action?: string;
}

export function useStacks() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [transactionState, setTransactionState] = useState<TransactionState>({ status: 'idle' });

  const appConfig = new AppConfig(["store_write"]);
  const userSession = new UserSession({ appConfig });

  function connectWallet() {
    showConnect({
      appDetails,
      onFinish: () => {
        window.location.reload();
      },
      userSession,
    });
  }

  function disconnectWallet() {
    userSession.signUserOut();
    setUserData(null);
  }

  async function handleCreatePool(token0: string, token1: string, fee: number) {
    try {
      if (!userData) throw new Error("User not connected");
      const options = await createPool(token0, token1, fee);
      await openContractCall({
        ...options,
        appDetails,
        onFinish: (data) => {
          window.alert("Sent create pool transaction");
          console.log(data);
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.log(err);
      window.alert(err.message);
      return;
    }
  }

  async function handleSwap(pool: Pool, amount: number, zeroForOne: boolean) {
    setTransactionState({ status: 'pending', action: 'swap' });
    try {
      if (!userData) throw new Error("User not connected");
      const options = await swap(pool, amount, minOutput, zeroForOne);
      await openContractCall({
        ...options,
        appDetails,
        onFinish: (data: any) => {
          logTransactionSuccess('swap', data.txId, userData?.profile?.stxAddress?.mainnet);
          setTransactionState({ status: 'success', txId: data.txId, action: 'swap' });
        },
        onCancel: () => {
          setTransactionState({ status: 'idle' });
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err: any) {
      const err = _err as Error;
      let errorMessage = err.message;

      // Try to extract error code from Clarity error
      const errorMatch = err.message.match(/\(err u(\d+)\)/);
      if (errorMatch) {
        const errorCode = parseInt(errorMatch[1]);
        errorMessage = getErrorMessage(errorCode);
      }

      logTransactionError('swap', err, userData?.profile?.stxAddress?.mainnet);
      setTransactionState({ status: 'error', error: errorMessage, action: 'swap' });
    }
  }

  async function handleAddLiquidity(
    pool: Pool,
    amount0: number,
    amount1: number
  ) {
    try {
      if (!userData) throw new Error("User not connected");
      const options = await addLiquidity(pool, amount0, amount1);
      await openContractCall({
        ...options,
        appDetails,
        onFinish: (data) => {
          window.alert("Sent add liquidity transaction");
          console.log({ data });
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.log(err);
      window.alert(err.message);
      return;
    }
  }

  async function handleRemoveLiquidity(pool: Pool, liquidity: number) {
    try {
      if (!userData) throw new Error("User not connected");
      const options = await removeLiquidity(pool, liquidity);
      await openContractCall({
        ...options,
        appDetails,
        onFinish: (data) => {
          window.alert("Sent remove liquidity transaction");
          console.log(data);
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.log(err);
      window.alert(err.message);
      return;
    }
  }

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData);
      });
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  function retryTransaction() {
    if (transactionState.action === 'swap') {
      // For now, just reset state. In a real app, you'd store the last params
      setTransactionState({ status: 'idle' });
    }
  }

  return {
    userData,
    transactionState,
    handleCreatePool,
    handleSwap,
    handleAddLiquidity,
    handleRemoveLiquidity,
    retryTransaction,
    connectWallet,
    disconnectWallet,
  };
}
