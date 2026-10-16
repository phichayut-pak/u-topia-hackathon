import { createWalletClient, createPublicClient, http, parseUnits, erc20Abi, type Hex, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { avalancheFuji } from "viem/chains";

// Optional: settle each USDT deduction on Avalanche Fuji as a real tUSDT transfer
// from the demo user's wallet to the treasury. Testnet only, test tokens with no value.
// Needs FUJI_USER_PRIVATE_KEY (demo user), TREASURY_ADDRESS and TOKEN_ADDRESS (from scripts/deploy-token.mjs).
export const chainConfigured = () =>
  Boolean(process.env.FUJI_USER_PRIVATE_KEY && process.env.TREASURY_ADDRESS && process.env.TOKEN_ADDRESS);

export async function settleOnChain(coinAmount: number): Promise<{ txHash: string; explorer: string } | null> {
  if (!chainConfigured()) return null;
  const account = privateKeyToAccount(process.env.FUJI_USER_PRIVATE_KEY as Hex);
  const transport = http(process.env.FUJI_RPC_URL ?? "https://api.avax-test.network/ext/bc/C/rpc");
  const wallet = createWalletClient({ account, chain: avalancheFuji, transport });
  const pub = createPublicClient({ chain: avalancheFuji, transport });
  const decimals = Number(process.env.TOKEN_DECIMALS ?? 6);
  const hash = await wallet.writeContract({
    address: process.env.TOKEN_ADDRESS as Address,
    abi: erc20Abi,
    functionName: "transfer",
    args: [process.env.TREASURY_ADDRESS as Address, parseUnits(coinAmount.toFixed(Math.min(6, decimals)), decimals)],
  });
  await pub.waitForTransactionReceipt({ hash, timeout: 20_000 });
  return { txHash: hash, explorer: `https://testnet.snowtrace.io/tx/${hash}` };
}
