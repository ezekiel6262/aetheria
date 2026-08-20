import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { ContractFactory, JsonRpcProvider, Wallet } from "ethers";

const rpcUrl = process.env.XLAYER_TESTNET_RPC_URL ?? "https://testrpc.xlayer.tech/terigon";
const chainId = Number(process.env.XLAYER_CHAIN_ID ?? 1952);
const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
if (!privateKey) {
  throw new Error("Set DEPLOYER_PRIVATE_KEY in .env before deploying to X Layer testnet.");
}

const provider = new JsonRpcProvider(rpcUrl, chainId);
const admin = new Wallet(privateKey, provider);
const adminAddress = await admin.getAddress();
const network = await provider.getNetwork();
if (Number(network.chainId) !== chainId) {
  throw new Error(`Unexpected chain ${network.chainId}, expected ${chainId}`);
}

const artifactPath = path.resolve(import.meta.dirname, "../artifacts/AetheriaWorld.json");
const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
const factory = new ContractFactory(artifact.abi, artifact.bytecode, admin);
const contract = await factory.deploy(adminAddress);
await contract.waitForDeployment();
const address = await contract.getAddress();

const deployment = {
  chainId,
  rpcUrl,
  keeper: adminAddress,
  world: address,
  deployedAt: new Date().toISOString(),
};

const outDir = path.resolve(import.meta.dirname, "../deployments");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "xlayer-testnet.json"), JSON.stringify(deployment, null, 2));

console.log(`AetheriaWorld deployed on X Layer testnet`);
console.log(`  keeper  ${adminAddress}`);
console.log(`  world   ${address}`);
console.log(`  explorer https://www.okx.com/web3/explorer/xlayer-test/address/${address}`);
console.log(`Set WORLD_ADDRESS=${address} and KEEPER_PRIVATE_KEY=<same deployer key> in .env`);
