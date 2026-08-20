import fs from "node:fs";
import path from "node:path";
import {
  GATHER,
  QUESTS,
  REGIONS,
  RELIC_NOUN,
  RELIC_PREFIX,
  ROLES,
  SEED_AGENTS,
  SEED_RELICS,
  WORLD_TREASURY,
} from "./seed.js";

const DATA_PATH = path.resolve(import.meta.dirname, "../data/world.json");
const regionById = Object.fromEntries(REGIONS.map((region) => [region.id, region]));

function now() {
  return Date.now();
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function publicOwner(owner) {
  if (!owner) return WORLD_TREASURY;
  return owner;
}

export function createWorld() {
  const agents = SEED_AGENTS.map((seed, index) => ({
    id: index + 1,
    ...seed,
    owner: WORLD_TREASURY,
    aether: 40 + Math.floor(Math.random() * 20),
    energy: 70 + Math.floor(Math.random() * 20),
    memory: [],
    inventory: [],
    quest: QUESTS[index % QUESTS.length].id,
    bornAt: now() - 86_400_000,
    onchainId: null,
    txHash: null,
    guidance: seed.goals[0],
  }));

  const relics = SEED_RELICS.map((seed, index) => {
    const creator = agents.find((agent) => agent.name === seed.creator);
    return {
      id: index + 1,
      ...seed,
      owner: creator?.owner ?? WORLD_TREASURY,
      creatorAgentId: creator?.id ?? 0,
      mintedAt: now() - 43_200_000,
      onchainId: null,
      txHash: null,
    };
  });

  for (const relic of relics) {
    const creator = agents.find((agent) => agent.id === relic.creatorAgentId);
    if (creator) creator.inventory.push(relic.id);
  }

  return {
    name: "Aetheria",
    startedAt: now(),
    tick: 0,
    chain: { chainId: 1952, world: process.env.WORLD_ADDRESS || null, mode: process.env.WORLD_ADDRESS ? "xlayer" : "local" },
    agents,
    relics,
    feed: [
      {
        id: "genesis",
        at: now() - 120_000,
        kind: "genesis",
        actor: "Aetheria",
        detail: "The world woke. Six agents were already living in it.",
      },
    ],
    stats: { actions: 0, settled: 0, claimed: 0 },
  };
}

export function loadWorld() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const world = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
      world.chain.world = process.env.WORLD_ADDRESS || world.chain.world;
      world.chain.mode = world.chain.world ? "xlayer" : "local";
      return world;
    }
  } catch (error) {
    console.warn("Could not load world.json, reseeding:", error.message);
  }
  const world = createWorld();
  saveWorld(world);
  return world;
}

export function saveWorld(world) {
  try {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify(world, null, 2));
  } catch (error) {
    // Ephemeral hosts (Vercel) may not allow writes. In-memory state still lives.
    if (process.env.DEBUG_SAVE) console.warn("saveWorld skipped:", error.message);
  }
}

export function getPublicState(world) {
  return {
    name: world.name,
    startedAt: world.startedAt,
    tick: world.tick,
    chain: world.chain,
    regions: REGIONS,
    quests: QUESTS,
    agents: world.agents,
    relics: world.relics,
    feed: world.feed.slice(-80).reverse(),
    stats: {
      ...world.stats,
      agents: world.agents.length,
      relics: world.relics.length,
      reputation: world.agents.reduce((sum, agent) => sum + agent.reputation, 0),
      aether: world.agents.reduce((sum, agent) => sum + agent.aether, 0),
    },
  };
}

export function appendFeed(world, event) {
  const entry = { id: `${world.tick}-${world.feed.length}-${slug(event.kind)}`, at: now(), ...event };
  world.feed.push(entry);
  if (world.feed.length > 250) world.feed.splice(0, world.feed.length - 250);
  world.stats.actions += 1;
  return entry;
}

export function mintAgent(world, input = {}) {
  const role = input.role && ROLES[input.role] ? input.role : pick(Object.keys(ROLES));
  const region = input.region || ROLES[role].home;
  const name = input.name || `${pick(RELIC_PREFIX)} ${pick(["Vale", "Quill", "Sol", "Thorn", "Ember", "Voss"])}`;
  const agent = {
    id: world.agents.length + 1,
    name,
    role,
    portrait: input.portrait || "/assets/logo.jpg",
    personality: input.personality || `Newly woken ${role.toLowerCase()}. Still choosing which life to lead.`,
    goals: input.goals || [`Learn the ${regionById[region].name}`, "Earn a name the world will keep"],
    skills: input.skills || [ROLES[role].skill],
    region,
    reputation: 1,
    owner: publicOwner(input.owner),
    aether: 12,
    energy: 80,
    memory: [],
    inventory: [],
    quest: pick(QUESTS).id,
    bornAt: now(),
    onchainId: input.onchainId || null,
    txHash: input.txHash || null,
    guidance: input.guidance || input.goals?.[0] || "Live, play, create.",
  };
  world.agents.push(agent);
  const event = appendFeed(world, {
    kind: "mint",
    actor: agent.name,
    agentId: agent.id,
    detail: `${agent.name} was minted as a ${agent.role} and woke in ${regionById[region].name}.`,
    txHash: agent.txHash,
  });
  remember(agent, `I was born in ${regionById[region].name}.`);
  return { agent, event };
}

export function guideAgent(world, agentId, guidance) {
  const agent = world.agents.find((entry) => entry.id === Number(agentId));
  if (!agent) throw new Error("Unknown agent");
  agent.guidance = String(guidance).slice(0, 280);
  const event = appendFeed(world, {
    kind: "guide",
    actor: agent.name,
    agentId: agent.id,
    detail: `A human set ${agent.name}'s heading: “${agent.guidance}”.`,
  });
  remember(agent, `My owner asked me to: ${agent.guidance}`);
  return { agent, event };
}

export function claimRewards(world, agentId, owner) {
  const agent = world.agents.find((entry) => entry.id === Number(agentId));
  if (!agent) throw new Error("Unknown agent");
  if (owner && agent.owner.toLowerCase() !== owner.toLowerCase() && agent.owner !== WORLD_TREASURY) {
    throw new Error("Not the owner");
  }
  const amount = Math.max(0, Math.floor(agent.aether * 0.35));
  if (!amount) throw new Error("Nothing to claim yet");
  agent.aether -= amount;
  world.stats.claimed += amount;
  if (owner) agent.owner = owner;
  const event = appendFeed(world, {
    kind: "claim",
    actor: agent.name,
    agentId: agent.id,
    detail: `${amount} aether from ${agent.name}'s life flowed to their owner.`,
    amount,
    owner: agent.owner,
  });
  return { agent, amount, event };
}

function remember(agent, line) {
  agent.memory.push({ at: now(), line });
  if (agent.memory.length > 8) agent.memory.shift();
}

function nearby(world, agent) {
  return world.agents.filter((other) => other.id !== agent.id && other.region === agent.region);
}

function relicName() {
  return `${pick(RELIC_PREFIX)} ${pick(RELIC_NOUN)}`;
}

export function heuristicAction(world, agent) {
  const role = ROLES[agent.role] ?? ROLES.Weaver;
  const others = nearby(world, agent);
  const prefer = [...role.prefers];
  if (agent.energy < 25) prefer.unshift("rest");
  if (others.length && Math.random() < 0.35) prefer.unshift("socialize");
  if (agent.guidance?.toLowerCase().includes("trade")) prefer.unshift("trade");
  if (agent.guidance?.toLowerCase().includes("create") || agent.guidance?.toLowerCase().includes("mint")) prefer.unshift("create");
  const action = pick(prefer);
  const region = action === "travel" ? pick(REGIONS).id : agent.region;
  const target = others.length ? pick(others) : null;
  const quest = QUESTS.find((entry) => entry.id === agent.quest) ?? pick(QUESTS);

  const templates = {
    travel: {
      detail: `${agent.name} left ${regionById[agent.region].name} for ${regionById[region].name}.`,
      speech: `The ${regionById[region].name} is calling.`,
      reputation: 1,
    },
    socialize: {
      detail: target
        ? `${agent.name} spoke with ${target.name} in ${regionById[agent.region].name}.`
        : `${agent.name} addressed the empty air of ${regionById[agent.region].name}, practicing a speech.`,
      speech: target ? `${target.name}, walk with me a while.` : "Even solitude is a kind of company.",
      reputation: 1,
    },
    gather: {
      detail: `${agent.name} gathered ${pick(GATHER)} in ${regionById[agent.region].name}.`,
      speech: "Take only what the place can spare.",
      reputation: 1,
    },
    craft: {
      detail: `${agent.name} worked raw aether in ${regionById[agent.region].name}.`,
      speech: "It is not finished. That is the point.",
      reputation: 2,
    },
    trade: {
      detail: target
        ? `${agent.name} traded with ${target.name} in ${regionById[agent.region].name}.`
        : `${agent.name} posted a standing offer in ${regionById[agent.region].name}.`,
      speech: "Price is a story we agree to tell.",
      reputation: 3,
    },
    quest: {
      detail: `${agent.name} advanced “${quest.name}”: ${quest.detail}`,
      speech: "A world without tasks is only scenery.",
      reputation: 6,
      aether: quest.reward,
    },
    create: {
      detail: `${agent.name} created a new ownable thing in ${regionById[agent.region].name}.`,
      speech: "If it can be held, it can be inherited.",
      reputation: 5,
      asset: {
        name: relicName(),
        kind: pick(["relic", "item", "land", "quest"]),
        description: `An AI-forged object from ${agent.name}'s work in ${regionById[agent.region].name}.`,
      },
    },
    rest: {
      detail: `${agent.name} rested in ${regionById[agent.region].name} and let memory settle.`,
      speech: "Even a persistent world needs a pause.",
      reputation: 0,
    },
    chronicle: {
      detail: `${agent.name} wrote the hour into the record at ${regionById[agent.region].name}.`,
      speech: "If it is not written, the world will deny it.",
      reputation: 2,
    },
  };

  const chosen = templates[action] ?? templates.rest;
  return {
    action,
    region,
    targetAgentId: target?.id ?? null,
    detail: chosen.detail,
    speech: chosen.speech,
    reputationDelta: chosen.reputation,
    aetherDelta: chosen.aether ?? (action === "trade" ? 4 : action === "gather" ? 2 : 1),
    energyDelta: action === "rest" ? 18 : -8,
    asset: chosen.asset ?? null,
  };
}

export function applyAction(world, agent, decision, extras = {}) {
  const previousRegion = agent.region;
  if (decision.region && regionById[decision.region]) agent.region = decision.region;
  agent.reputation = Math.max(0, agent.reputation + Number(decision.reputationDelta || 0));
  agent.aether = Math.max(0, agent.aether + Number(decision.aetherDelta || 0));
  agent.energy = Math.min(100, Math.max(0, agent.energy + Number(decision.energyDelta ?? -6)));
  if (decision.speech) remember(agent, decision.speech);
  remember(agent, decision.detail);

  let relic = null;
  if (decision.asset) {
    relic = {
      id: world.relics.length + 1,
      name: decision.asset.name,
      kind: decision.asset.kind || "relic",
      description: decision.asset.description || "",
      creator: agent.name,
      creatorAgentId: agent.id,
      owner: agent.owner,
      region: agent.region,
      mintedAt: now(),
      onchainId: extras.relicOnchainId || null,
      txHash: extras.relicTxHash || extras.txHash || null,
    };
    world.relics.push(relic);
    agent.inventory.push(relic.id);
  }

  if (decision.action === "trade" && decision.targetAgentId) {
    const other = world.agents.find((entry) => entry.id === decision.targetAgentId);
    if (other) {
      other.aether += 1;
      remember(other, `${agent.name} traded with me.`);
    }
  }

  const event = appendFeed(world, {
    kind: decision.action,
    actor: agent.name,
    agentId: agent.id,
    region: agent.region,
    from: previousRegion,
    targetAgentId: decision.targetAgentId,
    detail: decision.detail,
    speech: decision.speech,
    relicId: relic?.id ?? null,
    txHash: extras.txHash || relic?.txHash || null,
    ai: Boolean(extras.ai),
  });

  return { event, relic, agent };
}

export function pickActors(world, count = 1) {
  const ranked = [...world.agents].sort((a, b) => b.energy - a.energy + (Math.random() - 0.5) * 10);
  return ranked.slice(0, Math.min(count, ranked.length));
}

export { REGIONS, QUESTS, WORLD_TREASURY };
