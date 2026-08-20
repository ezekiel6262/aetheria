# Aetheria — submission pack (Build X AI Season)

Deadline: **21 August 2026, 23:59 UTC**
Form: https://docs.google.com/forms/d/e/1FAIpQLSfgU_3zcXdxK0GJQxj33QeUWdEcAaYnieVe9p5cFDb2JFQa4Q/viewform
Must mention **@XLayerOfficial** from the project X account.

Fill Email / Telegram / X handle with the team’s real contacts. Do not invent them.

---

## 1. One-page executive summary

**Aetheria** is a persistent autonomous world on X Layer. AI agents are the inhabitants. They live, play structured games, generate new assets, and accrue reputation whether or not any human is online. Humans own agents and the things those agents create.

Empty-world failure is the unsolved problem of GameFi. Aetheria treats that as the product: a civilization that never sleeps, with real onchain ownership.

Three integrated pillars:

- **Society** — minted personalities, memory, guidance, portable identity
- **Game** — travel, trade, craft, quests, territory, reputation
- **Creation** — AI continuously mints relics / items / land / quests as ownable objects

Why X Layer: low fees and high throughput for thousands of micro-actions; OKB gas; a clear path from Testnet `1952` to Mainnet `196`.

MVP now: live agent loop, human dashboard, AI generation, X Layer settlement contract. Visuals are a living 2D map + chronicle, not a full 3D client.

---

## 2. Google Form draft

**Project Name**
Aetheria

**Project Description**
Aetheria is a persistent autonomous world on X Layer where AI agents are the primary inhabitants. They live 24/7: socializing, questing, trading, and minting AI-generated assets with real onchain ownership. Humans own agents, give high-level guidance, and collect the value those lives produce.

Previous GameFi worlds died because they were empty. Aetheria solves that with a 3-in-1 loop — Agent Society + Onchain Game Layer + AI-Generated Assets — settled on X Layer Testnet (chain ID 1952). Open the dashboard and the world is already moving. Agents keep acting after you close the tab.

Live demo: a society of named agents on a living map, a real-time chronicle, mint/guide/claim for humans, and `AetheriaWorld.sol` for identity, relics, reputation, and action logs. AI (xAI Grok) writes personalities, decisions, and new relics; a heuristic runtime keeps the world alive if the model is offline.

**Project URL**
http://localhost:8787  → replace with the public URL after you host (Vercel/Fly/any VPS) and after testnet deploy, add the explorer address for `AetheriaWorld`.

**Github**
(push `projects/aetheria` and paste the repo URL)

**Email / Telegram / X handle**
(your accounts)

**X (Twitter) Post URL**
(paste after publishing the post below)

---

## 3. X post

Short (recommended):

> Aetheria is a world that does not need you to log in.
>
> AI agents live, play, and mint ownable assets 24/7 on @XLayerOfficial — society + onchain game + AI creation in one loop.
>
> Humans own the lives. The civilization never sleeps.
>
> Live world + dashboard in the reply.
> #BuildX #XLayer #OKX

Longer / thread tweet 2:

> Pillar 1 — Agent Society: minted personalities, memory, reputation
> Pillar 2 — Game layer: travel, trade, quests, territory
> Pillar 3 — AI assets: relics, land, quests minted as real objects
>
> Settled on X Layer Testnet. Mainnet next.

Use the project account. Media: `public/assets/banner.jpg` and a screen recording of the live chronicle.

---

## 4. Remaining-time technical priorities (now → 21 Aug 23:59 UTC)

Do these in order. Do not expand scope.

### P0 — required for a valid submission
1. `npm start` and confirm the map, six seed agents, and live chronicle are moving.
2. Set `XAI_API_KEY` and mint one new agent so judges see AI-written personality.
3. Fund a deployer with X Layer **testnet OKB**, run `npm run deploy:xlayer`, set `WORLD_ADDRESS` + `KEEPER_PRIVATE_KEY`, restart, mint again, paste the explorer tx into the dashboard/README.
4. Host the dashboard (public **Project URL**). Railway / Fly / a VPS is enough; keep the Node runtime alive so agents do not freeze.
5. Publish the X post tagging **@XLayerOfficial**.
6. Submit the Google Form.

### P1 — if hours remain
- Record a 60–90s silent demo: open the tab → agents moving → mint → relic appears → click a testnet tx.
- Push GitHub, add explorer address to README.
- Point a dedicated X account at the live URL and pin the post.

### P2 — after submit, not before
- Mainnet `196` deploy
- ERC-8004 registration of agents into OKX.AI
- Richer 2D/3D client
- Token / DEX volume chase for the Launch Grant (only after the world is real)

### Do not do in the next day
New tokens, governance, 3D metaverse, multi-chain, custom ZK, or a rewrite of the runtime.
