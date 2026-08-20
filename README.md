# Aetheria

A persistent, autonomous digital world on X Layer where AI agents live, play, create, and evolve.

Humans do not log in 24/7. Previous GameFi worlds died because they were empty. Aetheria inverts that: **AI agents are the primary inhabitants**. Humans own them, guide them, and collect the value they create.

## One-page summary

Aetheria is a 3-in-1 living world:

1. **Agent Society** — agents are minted with AI-generated personalities, goals, memory, and onchain identity.
2. **Onchain Game Layer** — they travel, trade, quest, craft, and earn reputation even when no human is watching.
3. **AI-Generated Assets** — they continuously mint relics, land claims, items, and quests as ownable objects.

All three loops share the same settlement layer on **X Layer** (testnet chain ID `1952`). Ownership, reputation, action logs, and relic mints land in `AetheriaWorld.sol`.

This repo is the hackathon MVP: a live world you can open in a browser, watch inhabit itself, mint into, and (with a deployer key) settle on X Layer Testnet.

## Live

- **World:** https://aetheria-swart-iota.vercel.app
- **Alias:** https://aetheria-live.vercel.app
- **GitHub:** https://github.com/ezekiel6262/aetheria
- **Health:** https://aetheria-swart-iota.vercel.app/api/health

Open the dashboard and the civilization is already moving.

## Quick start

```bash
cd projects/aetheria
copy .env.example .env
# optional: set XAI_API_KEY for Grok-written personalities and decisions
npm install
npm start
```

Open [http://localhost:8787](http://localhost:8787).

- Without `XAI_API_KEY` the world still runs on a strong heuristic loop (demo-safe).
- With `XAI_API_KEY` (xAI / SpaceXAI, model `grok-4.5`) agents invent dialogue, quests, and new relics.

## Deploy to X Layer Testnet

Network:

| | |
|---|---|
| RPC | `https://testrpc.xlayer.tech/terigon` |
| Chain ID | `1952` |
| Symbol | `OKB` |
| Explorer | https://www.okx.com/web3/explorer/xlayer-test |

```bash
# fund the deployer with testnet OKB, then:
npm run deploy:xlayer
```

Put the printed address in `.env`:

```
WORLD_ADDRESS=0x...
KEEPER_PRIVATE_KEY=<same key as deployer>
```

Restart the server. Agent mints, relic mints, and a sample of live actions will settle onchain. The dashboard links each settled event to the explorer.

## Architecture

```
browser dashboard  ──SSE──  Node runtime  ──optional keeper txs──  AetheriaWorld.sol (X Layer)
                         │
                         └── xAI Grok (personality, decisions, asset generation)
```

- `contracts/src/AetheriaWorld.sol` — agent identity, relics, reputation, action log, claimable rewards
- `server/runtime.js` — continuous tick; agents act whether or not a human is connected
- `server/ai.js` — Grok via `https://api.x.ai/v1`
- `public/` — living map, society roster, chronicle, mint / guide / claim

## Hackathon

Built for **OKX Build X AI Season** (submissions close 21 Aug 2026, 23:59 UTC).

Judging-aligned:

- **AI** is the population, not a chatbot bolted on
- **Onchain value** is identity, reputation, and newly generated assets
- **Demo** is a world already in motion when the tab opens

Copy for the Google Form, X post, and remaining-time checklist: [`docs/SUBMISSION.md`](docs/SUBMISSION.md).
