import OpenAI from "openai";
import { QUESTS, REGIONS } from "./seed.js";

const MODEL = process.env.XAI_MODEL || "grok-4.5";

export function hasAI() {
  return Boolean(process.env.XAI_API_KEY);
}

function client() {
  return new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: "https://api.x.ai/v1",
  });
}

async function jsonComplete(system, user) {
  const response = await client().chat.completions.create({
    model: MODEL,
    temperature: 0.95,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  const text = response.choices[0]?.message?.content ?? "{}";
  return JSON.parse(text);
}

export async function inventPersonality({ role, guidance }) {
  if (!hasAI()) return null;
  return jsonComplete(
    "You mint inhabitants for Aetheria, a persistent onchain world. Return JSON only.",
    `Invent a new ${role} agent. Optional human guidance: ${guidance || "none"}.
Return JSON: {"name":string,"personality":string,"goals":[string,string],"skills":[string,string,string],"opening":string}`,
  );
}

export async function decideAction(world, agent) {
  if (!hasAI()) return null;
  const nearby = world.agents
    .filter((other) => other.region === agent.region && other.id !== agent.id)
    .map((other) => other.name);
  const relics = world.relics.filter((relic) => relic.creatorAgentId === agent.id).map((relic) => relic.name);
  const quest = QUESTS.find((entry) => entry.id === agent.quest);
  const payload = {
    agent: {
      name: agent.name,
      role: agent.role,
      personality: agent.personality,
      guidance: agent.guidance,
      region: agent.region,
      reputation: agent.reputation,
      aether: agent.aether,
      energy: agent.energy,
      memory: agent.memory.map((entry) => entry.line),
      relics,
      quest: quest?.name,
    },
    nearby,
    regions: REGIONS.map((region) => region.id),
  };

  const decision = await jsonComplete(
    `You are the mind of an autonomous agent living in Aetheria.
Choose ONE action for this moment. Stay in character. Keep detail to one vivid sentence.
Actions: travel, socialize, gather, craft, trade, quest, create, rest, chronicle.
If action is create, invent a new ownable asset.
Return JSON:
{"action":string,"region":string,"targetAgentName":string|null,"detail":string,"speech":string,"reputationDelta":number,"aetherDelta":number,"energyDelta":number,"asset":{"name":string,"kind":"relic"|"item"|"land"|"quest","description":string}|null}`,
    JSON.stringify(payload),
  );

  const target = world.agents.find((other) => other.name === decision.targetAgentName);
  if (target) decision.targetAgentId = target.id;
  if (decision.region && !REGIONS.some((region) => region.id === decision.region)) decision.region = agent.region;
  decision.reputationDelta = Number(decision.reputationDelta ?? 1);
  decision.aetherDelta = Number(decision.aetherDelta ?? 1);
  decision.energyDelta = Number(decision.energyDelta ?? -7);
  return decision;
}
