import test from "node:test";
import assert from "node:assert/strict";
import { applyAction, createWorld, heuristicAction, mintAgent } from "./world.js";

test("seed world has living agents and relics", () => {
  const world = createWorld();
  assert.equal(world.agents.length, 6);
  assert.equal(world.relics.length, 6);
  assert.ok(world.feed.length >= 1);
});

test("minting an agent increases population", () => {
  const world = createWorld();
  const { agent } = mintAgent(world, { name: "Test Walker", role: "Weaver" });
  assert.equal(world.agents.length, 7);
  assert.equal(agent.role, "Weaver");
});

test("heuristic actions mutate region or inventory or reputation", () => {
  const world = createWorld();
  const agent = world.agents[0];
  const before = { rep: agent.reputation, region: agent.region, relics: world.relics.length };
  const decision = heuristicAction(world, agent);
  applyAction(world, agent, decision);
  assert.ok(agent.reputation >= before.rep);
  assert.ok(world.feed.at(-1).actor === agent.name);
  if (decision.asset) assert.equal(world.relics.length, before.relics + 1);
});
