import { decideAction } from "./ai.js";
import { settleAction, settleMintRelic } from "./chain.js";
import { applyAction, heuristicAction, pickActors, saveWorld } from "./world.js";
import { REGIONS } from "./seed.js";

const TICK_MS = Number(process.env.TICK_MS ?? 4500);

export async function runTick(world, { chain, onEvent } = {}) {
  world.tick += 1;
  const actors = pickActors(world, world.tick % 5 === 0 ? 2 : 1);
  const events = [];
  for (const agent of actors) {
    let decision = null;
    let usedAI = false;
    try {
      if (Math.random() < 0.55) {
        decision = await decideAction(world, agent);
        usedAI = Boolean(decision);
      }
    } catch (error) {
      console.warn("AI tick failed:", error.message);
    }
    if (!decision) decision = heuristicAction(world, agent);

    const extras = { ai: usedAI };
    try {
      if (chain?.ready && Math.random() < 0.35) {
        const settled = await settleAction(chain, agent, decision, REGIONS);
        if (settled) {
          extras.txHash = settled.hash;
          world.stats.settled += 1;
          world.chain.mode = "xlayer";
        }
      }
    } catch (error) {
      console.warn("Settlement skipped:", error.message);
    }

    const result = applyAction(world, agent, decision, extras);
    if (result.relic && chain?.ready) {
      try {
        const minted = await settleMintRelic(chain, agent, result.relic);
        if (minted) {
          result.relic.txHash = minted.hash;
          result.relic.onchainId = minted.onchainId;
          result.event.txHash = minted.hash;
          world.stats.settled += 1;
        }
      } catch (error) {
        console.warn("Relic mint skipped:", error.message);
      }
    }
    onEvent?.({ ...result, ai: usedAI });
    events.push({ ...result, ai: usedAI });
  }
  saveWorld(world);
  return events;
}

export function startRuntime(world, { chain, onEvent } = {}) {
  let busy = false;
  const tick = async () => {
    if (busy) return;
    busy = true;
    try {
      await runTick(world, { chain, onEvent });
    } finally {
      busy = false;
    }
  };
  const timer = setInterval(() => {
    tick().catch((error) => console.error("tick error", error));
  }, TICK_MS);
  tick().catch((error) => console.error("first tick error", error));
  return () => clearInterval(timer);
}
