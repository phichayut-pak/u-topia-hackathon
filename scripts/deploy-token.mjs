// Compiles contracts/DemoUSDT.sol and deploys it to Avalanche Fuji with 1,000,000 tUSDT minted to the treasury.
// Usage: FUJI_PRIVATE_KEY=0x... node scripts/deploy-token.mjs
import fs from "node:fs";
import solc from "solc";
import { createWalletClient, createPublicClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { avalancheFuji } from "viem/chains";

const key = process.env.FUJI_PRIVATE_KEY;
if (!key) {
  console.error("Set FUJI_PRIVATE_KEY (a throwaway testnet wallet funded with test AVAX from the Fuji faucet).");
  process.exit(1);
}

const source = fs.readFileSync(new URL("../contracts/DemoUSDT.sol", import.meta.url), "utf8");
const input = {
  language: "Solidity",
  sources: { "DemoUSDT.sol": { content: source } },
  settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: "paris", outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } } },
};
const out = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = (out.errors ?? []).filter((e) => e.severity === "error");
if (errors.length) {
  console.error(errors.map((e) => e.formattedMessage).join("\n"));
  process.exit(1);
}
const { abi, evm } = out.contracts["DemoUSDT.sol"].DemoUSDT;

const account = privateKeyToAccount(key);
const transport = http(process.env.FUJI_RPC_URL ?? "https://api.avax-test.network/ext/bc/C/rpc");
const wallet = createWalletClient({ account, chain: avalancheFuji, transport });
const pub = createPublicClient({ chain: avalancheFuji, transport });

console.log("Deploying from", account.address);
const hash = await wallet.deployContract({ abi, bytecode: "0x" + evm.bytecode.object, args: [parseUnits("1000000", 6)] });
const receipt = await pub.waitForTransactionReceipt({ hash });
console.log("Token deployed:", receipt.contractAddress);
console.log("Explorer:", `https://testnet.snowtrace.io/address/${receipt.contractAddress}`);
console.log(`\nAdd to .env.local:\nTOKEN_ADDRESS=${receipt.contractAddress}\nTOKEN_DECIMALS=6`);
