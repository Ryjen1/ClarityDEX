import { STACKS_TESTNET } from "@stacks/network";
import {
  boolCV,
  bufferCV,
  Cl,
  cvToHex,
  fetchCallReadOnlyFunction,
  hexToCV,
  principalCV,
  PrincipalCV,
  uintCV,
  UIntCV,
} from "@stacks/transactions";


//  Exported to be used in other files
export const AMM_CONTRACT_ADDRESS = "ST3P49R8XXQWG69S66MZASYPTTGNDKK0WW32RRJDN";
export const AMM_CONTRACT_NAME = "amm";
export const AMM_CONTRACT_PRINCIPAL = `${AMM_CONTRACT_ADDRESS}.${AMM_CONTRACT_NAME}`;

type ContractEvent = {
  event_index: number;
  event_type: string;
  tx_id: string;
  contract_log: {
    contract_id: string;
    topic: string;
    value: {
      hex: string;
      repr: string;
    };
  };
};

type PoolCV = {
  "token-0": PrincipalCV;
  "token-1": PrincipalCV;
  fee: UIntCV;
  liquidity: UIntCV;
  "balance-0": UIntCV;
  "balance-1": UIntCV;
};

export type Pool = {
  id: string;
  "token-0": string;
  "token-1": string;
  fee: number;
  liquidity: number;
  "balance-0": number;
  "balance-1": number;
};

// getAllPools
// Returns an array of Pool objects
export async function getAllPools() {
  let offset = 0;
  let done = false;

  const pools: Pool[] = [];

  // We can fetch 50 events at a time, so we run a loop until we've fetched all events
  while (!done) {
    const url = `http://api.testnet.hiro.so/extended/v1/contract/${AMM_CONTRACT_PRINCIPAL}/events?limit=50&offset=${offset}`;
    const events = (await fetch(url).then((res) => res.json()))
      .results as ContractEvent[];

    // if at any point we're getting less than 50 events back, then this is the last iteration
    if (events.length < 50) {
      done = true;
    }

    // from all events from the smart contract, only keep those which are `smart_contract_log` (remove token transfers, etc)
    const filteredEvents = events.filter((event: ContractEvent) => {
      return event.event_type === "smart_contract_log";
    });

    for (const event of filteredEvents) {
      const contractLog = event.contract_log;
      if (contractLog.contract_id !== AMM_CONTRACT_PRINCIPAL) continue;
      if (contractLog.topic !== "print") continue;

      // for each event, only care about ones which have action = "create-pool"
      const data = hexToCV(contractLog.value.hex);
      if (data.type !== "tuple") continue;
      if (data.value["action"] === undefined) continue;
      if (data.value["action"].type !== "ascii") continue;
      if (data.value["action"]["value"] !== "create-pool") continue;
      if (data.value["data"].type !== "tuple") continue;

      const poolInitialData = data.value["data"].value as PoolCV;

      // get the pool id from the pool initial data
      const poolIdResult = await fetchCallReadOnlyFunction({
        contractAddress: AMM_CONTRACT_ADDRESS,
        contractName: AMM_CONTRACT_NAME,
        functionName: "get-pool-id",
        functionArgs: [
          Cl.tuple({
            "token-0": poolInitialData["token-0"],
            "token-1": poolInitialData["token-1"],
            fee: poolInitialData.fee,
          }),
        ],
        senderAddress: AMM_CONTRACT_ADDRESS,
        network: STACKS_TESTNET,
      });
      if (poolIdResult.type !== "buffer") continue;
      const poolId = poolIdResult.value;

      // get the pool data from the pool id
      const poolDataResult = await fetchCallReadOnlyFunction({
        contractAddress: AMM_CONTRACT_ADDRESS,
        contractName: AMM_CONTRACT_NAME,
        functionName: "get-pool-data",
        functionArgs: [poolIdResult],
        senderAddress: AMM_CONTRACT_ADDRESS,
        network: STACKS_TESTNET,
      });

      if (poolDataResult.type !== "ok") continue;
      if (poolDataResult.value.type !== "some") continue;
      if (poolDataResult.value.value.type !== "tuple") continue;

      const poolData = poolDataResult.value.value.value as PoolCV;

      // convert the pool data to a Pool object
      const pool: Pool = {
        id: poolId,
        "token-0": poolInitialData["token-0"].value,
        "token-1": poolInitialData["token-1"].value,
        fee: parseInt(poolInitialData["fee"].value.toString()),
        liquidity: parseInt(poolData["liquidity"].value.toString()),
        "balance-0": parseInt(poolData["balance-0"].value.toString()),
        "balance-1": parseInt(poolData["balance-1"].value.toString()),
      };

      pools.push(pool);

      offset = event.event_index;
    }
  }

  return pools;
}

export async function createPool(token0: string, token1: string, fee: number) {
  const token0Hex = cvToHex(principalCV(token0));
  const token1Hex = cvToHex(principalCV(token1));
  if (token0Hex > token1Hex) {
    [token0, token1] = [token1, token0];
  }

  const txOptions = {
    contractAddress: AMM_CONTRACT_ADDRESS,
    contractName: AMM_CONTRACT_NAME,
    functionName: "create-pool",
    functionArgs: [principalCV(token0), principalCV(token1), uintCV(fee)],
  };

  return txOptions;
}

export async function addLiquidity(
  pool: Pool,
  amount0: number,
  amount1: number
) {
  if (amount0 === 0 || amount1 === 0) {
    throw new Error("Cannot add liquidity with 0 amount");
  }

  // If this is not initial liquidity, we need to add amounts in a ratio of the price
  if (pool.liquidity > 0) {
    const poolRatio = pool["balance-0"] / pool["balance-1"];

    const idealAmount1 = Math.floor(amount0 / poolRatio);
    if (amount1 < idealAmount1) {
      throw new Error(
        `Cannot add liquidity in these amounts. You need to supply at least ${idealAmount1} ${
          pool["token-1"].split(".")[1]
        } along with ${amount0} ${pool["token-0"].split(".")[1]}`
      );
    }
  }

  const txOptions = {
    contractAddress: AMM_CONTRACT_ADDRESS,
    contractName: AMM_CONTRACT_NAME,
    functionName: "add-liquidity",
    functionArgs: [
      principalCV(pool["token-0"]),
      principalCV(pool["token-1"]),
      uintCV(pool.fee),
      uintCV(amount0),
      uintCV(amount1),
      uintCV(0),
      uintCV(0),
    ],
  };

  return txOptions;
}

export async function removeLiquidity(pool: Pool, liquidity: number) {
  const txOptions = {
    contractAddress: AMM_CONTRACT_ADDRESS,
    contractName: AMM_CONTRACT_NAME,
    functionName: "remove-liquidity",
    functionArgs: [
      principalCV(pool["token-0"]),
      principalCV(pool["token-1"]),
      uintCV(pool.fee),
      uintCV(liquidity),
    ],
  };

  return txOptions;
}

export async function swap(pool: Pool, amount: number, zeroForOne: boolean) {
  const txOptions = {
    contractAddress: AMM_CONTRACT_ADDRESS,
    contractName: AMM_CONTRACT_NAME,
    functionName: "swap",
    functionArgs: [
      principalCV(pool["token-0"]),
      principalCV(pool["token-1"]),
      uintCV(pool.fee),
      uintCV(amount),
      boolCV(zeroForOne),
    ],
  };

  return txOptions;
}

export async function getUserLiquidity(pool: Pool, user: string) {
  const userLiquidityResult = await fetchCallReadOnlyFunction({
    contractAddress: AMM_CONTRACT_ADDRESS,
    contractName: AMM_CONTRACT_NAME,
    functionName: "get-position-liquidity",
    functionArgs: [bufferCV(Buffer.from(pool.id, "hex")), principalCV(user)],
    senderAddress: AMM_CONTRACT_ADDRESS,
    network: STACKS_TESTNET,
  });

  if (userLiquidityResult.type !== "ok") return 0;
  if (userLiquidityResult.value.type !== "uint") return 0;
  return parseInt(userLiquidityResult.value.value.toString());
}
