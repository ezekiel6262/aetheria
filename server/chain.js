import fs from "node:fs";
import path from "node:path";
import { Contract, JsonRpcProvider, Wallet } from "ethers";

const RPC = process.env.XLAYER_TESTNET_RPC_URL ?? "https://testrpc.xlayer.tech/terigon";
const CHAIN_ID = Number(process.env.XLAYER_CHAIN_ID ?? 1952);
const EXPLORER = "https://www.okx.com/web3/explorer/xlayer-test";

function loadArtifact() {
  const artifactPath = path.resolve(import.meta.dirname, "../contracts/artifacts/AetheriaWorld.json");
  if (!fs.existsSync(artifactPath)) return null;
  return JSON.parse(fs.readFileSync(artifactPath, "utf8"));
}

export function explorerTx(hash) {
  return hash ? `${EXPLORER}/tx/${hash}` : null;
}

export function explorerAddress(address) {
  return address ? `${EXPLORER}/address/${address}` : null;
}

export function getChain() {
  const world = process.env.WORLD_ADDRESS || null;
  const key = process.env.KEEPER_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY || null;
  const artifact = loadArtifact();
  if (!world || !key || !artifact) {
    return { ready: false, world, chainId: CHAIN_ID, explorer: EXPLORER, contract: null };
  }
  const provider = new JsonRpcProvider(RPC, CHAIN_ID);
  const wallet = new Wallet(key, provider);
  const contract = new Contract(world, artifact.abi, wallet);
  return { ready: true, world, chainId: CHAIN_ID, explorer: EXPLORER, contract, wallet };
}

function regionIndex(regionId, regions) {
  const index = regions.findIndex((region) => region.id === regionId);
  return index < 0 ? 0 : index;
}

export async function settleMintAgent(chain, agent, regions) {
  if (!chain.ready) return null;
  const tx = await chain.contract.mintAgent(
    agent.owner,
    agent.name,
    agent.personality.slice(0, 180),
    agent.portrait,
    regionIndex(agent.region, regions),
  );
  const receipt = await tx.wait();
  return { hash: receipt.hash, onchainId: Number(await chain.contract.agentCount()) };
}

export async function settleMintRelic(chain, agent, relic) {
  if (!chain.ready) return null;
  const tx = await chain.contract.mintRelic(
    relic.owner,
    agent.onchainId || agent.id,
    relic.kind,
    relic.name,
    `aetheria://relic/${relic.id}`,
  );
  const receipt = await tx.wait();
  return { hash: receipt.hash, onchainId: Number(await chain.contract.relicCount()) };
}

export async function settleAction(chain, agent, decision, regions) {
  if (!chain.ready) return null;
  const tx = await chain.contract.recordAction(
    agent.onchainId || agent.id,
    decision.action,
    decision.detail.slice(0, 180),
    Math.trunc(decision.reputationDelta || 0),
    regionIndex(decision.region || agent.region, regions),
  );
  const receipt = await tx.wait();
  if (decision.aetherDelta > 0) {
    await (await chain.contract.credit(agent.owner, Math.trunc(decision.aetherDelta))).wait();
  }
  return { hash: receipt.hash };
}
