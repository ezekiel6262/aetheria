import "dotenv/config";
import express from "express";
import path from "node:path";
import { hasAI, inventPersonality } from "./ai.js";
import { explorerAddress, getChain, settleMintAgent } from "./chain.js";
import { runTick, startRuntime } from "./runtime.js";
import { REGIONS, ROLES } from "./seed.js";
import {
  claimRewards,
  getPublicState,
  guideAgent,
  loadWorld,
  mintAgent,
  saveWorld,
} from "./world.js";

const app = express();
const world = loadWorld();
const chain = getChain();
const clients = new Set();

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.resolve(import.meta.dirname, "../public")));

function broadcast(payload) {
  const line = `data: ${JSON.stringify(payload)}\n\n`;
  for (const client of clients) client.write(line);
}

startRuntime(world, {
  chain,
  onEvent: ({ event, agent, relic, ai }) => {
    broadcast({ type: "event", event, agent, relic, ai, stats: getPublicState(world).stats });
  },
});

async function tickHandler(_req, res) {
  try {
    const events = await runTick(world, {
      chain,
      onEvent: ({ event, agent, relic, ai }) => {
        broadcast({ type: "event", event, agent, relic, ai, stats: getPublicState(world).stats });
      },
    });
    res.json({ ok: true, tick: world.tick, events: events.map((entry) => entry.event) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

app.post("/api/tick", tickHandler);
app.get("/api/tick", tickHandler);

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    world: world.name,
    agents: world.agents.length,
    relics: world.relics.length,
    ai: hasAI(),
    chain: {
      ready: chain.ready,
      chainId: chain.chainId,
      world: chain.world,
      explorer: explorerAddress(chain.world),
      mode: chain.ready ? "xlayer" : "local",
    },
  });
});

let lastRequestTick = 0;
app.get("/api/world", async (_req, res) => {
  if (Date.now() - lastRequestTick > 4000) {
    lastRequestTick = Date.now();
    runTick(world, {
      chain,
      onEvent: ({ event, agent, relic, ai }) => {
        broadcast({ type: "event", event, agent, relic, ai, stats: getPublicState(world).stats });
      },
    }).catch((error) => console.warn("request tick failed:", error.message));
  }
  res.json(getPublicState(world));
});

app.get("/api/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
  res.write(`data: ${JSON.stringify({ type: "hello", stats: getPublicState(world).stats })}\n\n`);
  clients.add(res);
  req.on("close", () => clients.delete(res));
});

app.post("/api/agents", async (req, res) => {
  try {
    const { owner, role, guidance, name } = req.body ?? {};
    const chosenRole = role && ROLES[role] ? role : undefined;
    let invented = null;
    try {
      invented = await inventPersonality({ role: chosenRole || "Weaver", guidance });
    } catch (error) {
      console.warn("personality gen failed:", error.message);
    }
    const minted = mintAgent(world, {
      owner,
      role: chosenRole,
      name: name || invented?.name,
      personality: invented?.personality,
      goals: invented?.goals,
      skills: invented?.skills,
      guidance: guidance || invented?.opening,
    });
    try {
      const settled = await settleMintAgent(chain, minted.agent, REGIONS);
      if (settled) {
        minted.agent.txHash = settled.hash;
        minted.agent.onchainId = settled.onchainId;
        minted.event.txHash = settled.hash;
        world.stats.settled += 1;
      }
    } catch (error) {
      console.warn("onchain mint skipped:", error.message);
    }
    saveWorld(world);
    broadcast({ type: "event", event: minted.event, agent: minted.agent, stats: getPublicState(world).stats });
    res.json(minted);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/agents/:id/guide", (req, res) => {
  try {
    const result = guideAgent(world, req.params.id, req.body?.guidance || "");
    saveWorld(world);
    broadcast({ type: "event", event: result.event, agent: result.agent, stats: getPublicState(world).stats });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/agents/:id/claim", (req, res) => {
  try {
    const result = claimRewards(world, req.params.id, req.body?.owner);
    saveWorld(world);
    broadcast({ type: "event", event: result.event, agent: result.agent, stats: getPublicState(world).stats });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: error.message || "world fault" });
});

const port = Number(process.env.PORT ?? 8787);
if (!process.env.VERCEL) {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Aetheria is living at http://localhost:${port}`);
    console.log(`  AI        ${hasAI() ? "on (" + (process.env.XAI_MODEL || "grok-4.5") + ")" : "heuristic fallback"}`);
    console.log(`  X Layer   ${chain.ready ? chain.world : "local settlement (set WORLD_ADDRESS to go onchain)"}`);
  });
}

export default app;
