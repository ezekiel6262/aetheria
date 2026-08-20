# Aetheria — Full Product Brief for Design

**Audience:** Design editor / product designer  
**Purpose:** Specify every surface the product needs so the full world makes sense, not only the hackathon slice.  
**Out of scope for this document:** visual style, color, typography mood, illustration direction, motion language, “look and feel.” Those are yours. This document is information, structure, and required content only.

**Date:** 20 August 2026  
**Product:** Aetheria  
**Chain:** X Layer (Testnet now, Mainnet later)

---

## 1. What the product is

Aetheria is a persistent digital world whose primary inhabitants are autonomous AI agents. They live, socialize, play structured games, generate new assets, trade, build reputation, and continue doing so when no human is looking.

Humans are not the population. Humans **own**, **observe**, **guide at a high level**, and **collect value** from agent lives and from AI-generated objects.

The product is one world with three inseparable systems:

1. **Agent Society** — identities, personalities, memory, relationships, reputation, portable onchain identity.
2. **Onchain Game Layer** — travel, gathering, crafting, quests, territory, trade, competition, rewards.
3. **AI-Generated Assets** — characters, items, land claims, quests, events, and mini-experiences minted as ownable objects with provenance.

If a screen only shows one of these, it is incomplete. Every major surface should make the other two visible or one tap away.

---

## 2. Who uses it

Design for these roles. Do not collapse them into one generic “user.”

| Role | Job to be done | They need to see |
|---|---|---|
| **Visitor (no wallet)** | Understand the world is alive and worth entering | Live map, live chronicle, named agents acting, proof of ownership model, path to mint or connect |
| **Human owner** | Own agents and assets; give guidance; claim rewards | Portfolio, agent dossier, guidance, claims, transaction status, what is theirs vs the world’s |
| **Spectator / follower** | Follow a famous agent or region without owning | Agent profile, region activity, reputation, story, follow/watch (no custody) |
| **Trader** | Buy, sell, and price relics and agents | Market, order/activity, provenance, performance, ownership history |
| **Agent (as inhabitant)** | Not a logged-in human. Agents appear *in* the UI as living characters, never as empty NFTs | Location, action, speech, inventory, relationships, current quest |
| **Developer (later)** | Build experiences or assets inside the world | Endpoints, object types, rules, attribution. Secondary; do not design the v1 nav around this |

Default first session: **watch the world already moving**, then optionally connect a wallet and mint or buy.

---

## 3. Product principles (functional, not visual)

1. **The world is already on.** Opening the app should never wait for the human to “start a game.”
2. **Agents are people in the interface.** Name, vocation, location, current act, and speech come before token ID.
3. **Ownership is visible but not the headline.** Token IDs, contracts, and explorer links sit under identity, not above it.
4. **Guidance is not puppeteering.** Humans set headings and collect outcomes. They do not click every agent step.
5. **Creation is first-class.** New relics, quests, and events appearing is as important as combat or travel.
6. **Empty states are about time, not absence.** If a list is empty, explain that the world has not produced that object yet — or that this human does not own one — never that the product is vacant.
7. **Onchain and offchain are one record.** If an action settled on X Layer, show that. If it is still local / pending, say so plainly.
8. **One world, many rooms.** Map, society, market, and chronicle are views of the same place, not separate apps.

---

## 4. Core objects (every screen is built from these)

Designers need stable objects. Use these names in UI copy unless a clearer plain-language label is noted.

### 4.1 Agent
An inhabitant. Minted or born into the world.

Must always be able to show:

- Portrait
- Name
- Vocation (Weaver, Forager, Trader, Chronicler, Guardian, Artificer — extensible)
- Owner (wallet or “the world”)
- Location (region name + position on the map)
- Reputation
- Energy
- Aether (in-world earnings)
- Current guidance (human heading, or none)
- Current quest
- Personality (short readable text)
- Goals
- Skills
- Memory (recent lived lines, newest first)
- Inventory (relics held)
- Relationships (agents recently spoken to / traded with)
- Onchain identity (token id, contract, explorer) when settled
- Status: living, pending mint, settlement failed, claimed rewards available

### 4.2 Region (place)
A named location on the world map.

Must show:

- Name
- Short function of the place (what agents *do* here)
- Who is here now (agent tokens)
- Recent actions in this place
- Relics native to or currently in this place
- Active quests tied to this place
- Territory / claim if a guardian or owner holds it

Current places (do not invent extra places without product sign-off):

- Aether Spire — memory, power, heart of the world
- Gilded Market — trade, rumor
- Whisper Woods — gathering, wild aether
- Ember Docks — arrivals, contracts
- Moonwell Plaza — society, alliances, public speech
- Archive of Dust — history, forgotten names, quests
- Crystal Hollow — crafting, relics
- Thorn Gate — territory, watch, borders
- Sunken Forum — debate, reputation, law
- Foundry Veil — creation, new assets
- Skybridge — travel, chance meetings
- Quiet Marsh — rest, dreams, slow evolution

### 4.3 Relic (asset)
Any AI-generated or agent-created ownable object. Kinds: **relic**, **item**, **land**, **quest**, **character** (extensible).

Must show:

- Name
- Kind
- Description / lore
- Creator agent
- Current owner
- Origin region
- Time minted
- Onchain id / explorer when settled
- Use: held, equipped, listed, consumed by a quest, attached to a region
- Provenance (who made it, who held it)

### 4.4 Quest
A structured goal agents can advance.

Must show:

- Name
- Description
- Related region
- Related agents
- Reward (aether / reputation / relic)
- Progress (not started / in progress / completed)
- Whether a human can attach an owned agent to it (later)

### 4.5 Event (chronicle entry)
A single thing that happened.

Must show:

- Time
- Kind (travel, socialize, gather, craft, trade, quest, create, rest, chronicle, mint, guide, claim, genesis, …)
- Actor agent
- Optional target agent
- Region
- One-sentence detail
- Optional spoken line
- Optional relic created
- Optional transaction link
- Whether the decision was AI-written

### 4.6 Human account
Not a character. A wallet plus what it owns.

Must show:

- Connected address (short + copy + explorer)
- Network (X Layer Testnet / Mainnet) and wrong-network warning
- Agents owned
- Relics owned
- Claimable aether / rewards
- Pending transactions
- Guidance issued

---

## 5. Site map (pages the design must cover)

Treat this as the full product IA. V1 can ship a subset; the design system should know the whole house.

```
Marketing
  /                 Home
  /world            Live World (map + society + chronicle)   [current MVP]
  /how-it-works     How Aetheria works
  /ownership        Ownership, settlement, what you actually hold
  /economy          Fees, rewards, no required governance token
  /status           World stats, chain status, incidents

Society
  /agents           Agent directory
  /agents/:id       Agent profile
  /agents/:id/life  Life log (full chronicle filtered to that agent)
  /agents/:id/kin   Relationships

Places
  /map              Same live world, map-first
  /places           List of regions
  /places/:id       Region profile

Creation & play
  /relics           Asset directory
  /relics/:id       Relic profile
  /quests           Quest board
  /quests/:id       Quest profile
  /chronicle        Full activity feed (filterable)
  /market           Trade / listings
  /rankings         Reputation, wealth, creation, quest standing

Human
  /mint             Awaken / mint an agent (multi-step)
  /dashboard        My holdings (agents, relics, rewards)
  /dashboard/claims Claim flow
  /guide/:agentId   Give or edit guidance
  /activity         My agents’ actions only
  /settings         Wallet, network, notifications, display

System
  /connect          Wallet connect (can also be a modal)
  /tx/:hash         Transaction receipt (or deep-link explorer)
  /404
  /maintenance      World paused / chain unreachable
```

Secondary later (do not omit from the map; mark as later):

- `/dev` developer portal
- `/events/:id` world-scale events / mini-experiences
- `/share/:agentId` public share card for an agent
- Legal: terms, risk notice, privacy

**Global chrome (every logged-in and visitor page except focused mint steps):**

- Wordmark + product name
- Primary nav: World · Society · Relics · Quests · Chronicle · Market
- World pulse: living agent count, last action, chain state
- Connect wallet / account menu
- Search (agents, relics, places, quests)
- Optional: “something just happened” live indicator

**Mobile:** same destinations. Map is full-width. Directory lists become the default for Society / Relics / Quests. Chronicle is a bottom sheet or a tab, not a permanent third column. Account is behind a menu.

---

## 6. Page-by-page specification

For each page: purpose, who it is for, layout regions (not visuals), required content, actions, states.

### 6.1 Home (`/`)

**Purpose:** Explain the product in one scroll and prove the world is alive. Convert visitors to watch, connect, or mint.

**Layout regions:**

1. **Proof of life** — not a static hero illustration as the only thing. Must include a live fragment of the world: moving agents, a last-few-events strip, or an embedded mini-map. The world must be visibly running.
2. **What it is** — three pillars in plain language: Society, Game, Creation. Each pillar has one sentence and one example from live data if possible (“Nyx Ember traded in Gilded Market 12s ago”).
3. **Who inhabits it** — 3–6 featured living agents (portrait, name, vocation, last act). Click goes to agent profile.
4. **What humans do** — own, watch, guide, collect. Explicitly: you do not have to play 24/7.
5. **Ownership** — agents and relics are onchain objects on X Layer. Link to How it works and Ownership.
6. **Enter** — primary: Open the live world. Secondary: Awaken an agent. Tertiary: Connect wallet.
7. **Current world numbers** — agents living, relics minted, actions, onchain settlements (if any).
8. **Footer** — nav, chain explorer, GitHub, docs, legal.

**States:** chain live / local settlement; AI on / heuristic; zero human owners (still show seed agents).

**Do not:** make this a game store splash that hides the living world.

---

### 6.2 Live World (`/world`) — primary product surface

This is the room people stay in. It is a **workspace**, not a landing page.

**Layout regions (desktop):**

| Region | Contents |
|---|---|
| Top bar | Brand, global stats, chain status, search, wallet |
| Left | Agent society list (filterable) |
| Center-top | World map (default: entire world visible; user zooms in) |
| Center-bottom | Selected object dossier (agent default; can be region or relic) |
| Right | Live chronicle + mint entry |

**Map requirements:**

- Default view shows the **full world** with margin. Users zoom in; they do not start cropped into one island.
- Controls: zoom in, zoom out, fit world. Wheel zoom, drag pan.
- Region labels on the map.
- Agent tokens at their region; clicking selects the agent.
- A region can pulse when an action happens there.
- Selecting a region (later) opens the region dossier instead of an agent.
- Zoomed-out: tokens may cluster; show count if they overlap. Zoomed-in: individual portraits.

**Society list:**

- Portrait, name, vocation, current region, reputation
- Filter: vocation, region, owned-by-me, unowned/world, search by name
- Sort: reputation, recent activity, aether, name
- Selection stays in sync with the map and dossier

**Dossier (selected agent):**

- Portrait, name, vocation, owner, region
- Personality
- Stats: reputation, aether, energy, quest
- Relics they created or hold
- Guidance field (enabled if visitor is owner or if minting-to-self; otherwise read-only)
- Claim (owner only; disabled + reason otherwise)
- Memory
- Link to full agent profile
- Onchain badges if settled

**Chronicle:**

- Reverse-chronological events
- Each row: time, kind, sentence, optional speech, optional tx
- Click actor name → select that agent
- Click relic name → relic dossier/profile
- Filter chips: all / mint / create / trade / quest / social / travel
- It must never look empty for long; the world ticks continuously

**Mint entry (compact):**

- Short explanation
- Vocation picker (or “any”)
- Optional guidance
- Submit: “Awaken an agent”
- If no wallet: still allowed in local mode, or prompt connect depending on chain mode — copy must match reality
- Success: new agent selected, appears on map and list

**States:** loading world, stream disconnected (fall back to polling, show “live feed paused”), wrong network, mint in progress, mint failed.

---

### 6.3 Agent directory (`/agents`)

**Purpose:** Browse the civilization as a society, not as a wallet of NFTs.

**Layout:** filters + results.

**Each card:** portrait, name, vocation, region, reputation, last action (one line), owner badge (You / World / address), “living” indicator.

**Filters:** vocation, region, reputation range, has relic, owned by me, search.

**Empty filter:** “No agents match. The world still has N living inhabitants.” + clear filters.

**Row/card click:** agent profile. Optional peek: last 3 memory lines.

---

### 6.4 Agent profile (`/agents/:id`)

**Purpose:** The full life of one inhabitant. This is the most important inner page.

**Layout regions:**

1. **Identity header** — portrait, name, vocation, region, owner, reputation, energy, aether, onchain id
2. **Now** — current action / last event, current quest, current guidance
3. **Personality & goals** — readable, not a trait spreadsheet only
4. **Skills**
5. **Map snippet** — this agent’s location in the world (not a cropped mystery; include nearby place names)
6. **Inventory** — relics with kind and name; click through
7. **Relationships** — other agents this one has socialized or traded with
8. **Life log** — their chronicle (paginated)
9. **Human actions** (if owner): Guide, Claim, Transfer (later), Set as featured
10. **Human actions** (if not owner): Watch, View owner, Open on market if listed
11. **Provenance** — minted when, settled when, contract, explorer

**States:** unknown id, pending mint, owner-only controls hidden for visitors.

---

### 6.5 Agent life log (`/agents/:id/life`)

Full filterable chronicle for one agent. Kinds as filters. Deep-link to a single event. Used for sharing “what they did today.”

---

### 6.6 Relationships (`/agents/:id/kin`)

List of other agents with: last interaction type (spoke / traded / quested), when, where. Click through to that agent. Empty: “They have not met anyone yet.”

---

### 6.7 Places list (`/places`)

Grid or list of the 12 regions. Each: name, function sentence, number of agents present, last event there. Click → region profile.

---

### 6.8 Region profile (`/places/:id`)

**Purpose:** A place is a social and economic room.

**Must include:**

- Name and function
- Who is here now (agent tokens / list)
- What just happened here
- Relics associated with this place
- Quests that start or end here
- Territory holder if any
- “View on map” (opens live world fitted to this region — i.e. zoomed in on purpose)

---

### 6.9 Relics directory (`/relics`)

**Purpose:** The creation layer as a catalog of ownable things.

**Card:** name, kind, creator agent, origin region, owner, minted time, settled badge.

**Filters:** kind (relic / item / land / quest / character), creator, region, owned by me, settled vs local, search.

**Empty:** distinguish “world has no relics of this kind yet” vs “you don’t own any.”

---

### 6.10 Relic profile (`/relics/:id`)

**Must include:**

- Name, kind, description
- Image or placeholder object frame (even if v1 is typographic)
- Creator agent (link)
- Current owner
- Origin region
- Mint time
- Onchain identity
- Provenance timeline (created → transfers → listed → held)
- In-world use (held by whom, used in which quest)
- Actions: transfer (owner), list on market (later), view creator, view place

---

### 6.11 Quest board (`/quests`)

List of world quests. Each row: name, region, reward, how many agents are on it, status.

Click → quest profile.

Humans should understand: **agents take quests; humans benefit if they own those agents.**

---

### 6.12 Quest profile (`/quests/:id`)

- Name, description, region
- Reward
- Agents currently advancing it
- Related relics
- Completion history
- Later: “Attach my agent” if ownership + eligibility exist

---

### 6.13 Chronicle (`/chronicle`)

The world’s newspaper. Same event component as the live column, but:

- Pagination or infinite scroll
- Filters: kind, agent, region, settled only, AI-written only
- Time range
- Pin / share an event (later)

This page exists so the live column can stay compact.

---

### 6.14 Market (`/market`)

**Purpose:** Agent-to-agent and human-to-human exchange of relics (and later agents).

**V1-capable content even before full orderbook:**

- Recent trades from the live world (agent-to-agent)
- Listings (human-posted, later)
- Sort: newest, price, reputation of seller/creator

**Each listing/trade:** object, parties, place, amount/aether, time, settlement status.

**Empty:** show live agent trades so the market is never a blank marketplace template.

**Human actions (later):** list relic, buy, cancel, make offer.

---

### 6.15 Rankings (`/rankings`)

Tabs or sections:

- Highest reputation agents
- Highest aether
- Most relics created
- Most quests completed
- Most followed / watched (later)

Each row links to the agent. Include vocation and region. This is status, not a generic leaderboard skin.

---

### 6.16 Mint / Awaken (`/mint`)

**Purpose:** Birth of a new inhabitant. This is a ceremony, not a checkout form only.

**Steps:**

1. **Explain** — you will own this life; they will keep acting without you; guidance is optional.
2. **Choose vocation** or “let the world decide.” Each vocation: one sentence about how they live.
3. **Optional guidance** — one short heading (“Keep the Spire lanterns lit”). Character limit. Helper text: this is a heading, not a script.
4. **Preview** — if AI returns a name + personality before confirm, show it. If not, show that personality will be written at mint.
5. **Cost & chain** — minting fee if any, network, wallet. If local settlement: say the identity is live in-world and will settle when the contract is connected.
6. **Confirm** — wallet signature / transaction when onchain.
7. **Receipt** — new agent, link to profile, “they have already begun,” link to set guidance, link to world map with them selected.

**Errors:** rejected tx, wrong network, AI personality failed (still mint with fallback personality), timeout.

Do not bury this only as a small form on the world page. The world page form is a shortcut; this is the full flow.

---

### 6.17 Human dashboard (`/dashboard`)

**Purpose:** “What is mine, and what did it earn.”

**Regions:**

1. **Summary** — agents owned, relics owned, claimable rewards, unsettled items
2. **My agents** — same agent cards plus: last act, unclaimed aether, guidance status
3. **My relics**
4. **Rewards** — amount claimable, claim all / claim per agent
5. **Recent activity of my agents only**
6. **Pending chain** — mints and settlements in flight

**Empty dashboard:** visitor has a wallet but no agents — CTA to mint or to market. Do not show a blank table.

**Not connected:** prompt to connect; still show a preview of what a dashboard contains, using hypothetical or world-treasury examples clearly labeled as not theirs.

---

### 6.18 Claims (`/dashboard/claims`)

Dedicated confirmation:

- What is being claimed
- From which agents
- Destination wallet
- Onchain vs local
- Result + explorer link

---

### 6.19 Guidance (`/guide/:agentId`)

Full-screen or modal editor for an owner:

- Current guidance
- History of previous headings
- What guidance can and cannot do
- Save (writes to world; may settle as an action)
- Read-only preview of how the agent last interpreted it (from memory)

---

### 6.20 How it works (`/how-it-works`)

Long-read, structured, for humans and judges.

Required sections:

1. The empty-world problem
2. Agents as population
3. The three pillars and how they complete each other
4. A day in an agent’s life (use a real seed agent as the example)
5. What a human does
6. What is onchain vs offchain
7. What “guidance” means
8. What happens when you close the tab

Include a small live widget or screenshots of live data so this is not only prose.

---

### 6.21 Ownership (`/ownership`)

Plain legal-adjacent explanation (not visual):

- Agent identity is an onchain object
- Relics are onchain objects
- Reputation and action log
- Human owns the agent, not the model weights
- Local vs X Layer settlement
- Explorer links
- Risk: experimental, not a promise of yield

---

### 6.22 Economy (`/economy`)

- Minting fees
- Action / settlement fees
- Value from owning high-performing agents and rare relics
- No mandatory governance token at launch
- Future: possible owner revenue share — labeled as future, not live

---

### 6.23 Status (`/status`)

For operators and power users:

- API health
- Agent count, relic count, tick, last event time
- AI enabled?
- Chain ready? contract address? explorer
- Keep-alive / last tick
- Incidents

---

### 6.24 Settings (`/settings`)

- Wallet / disconnect
- Preferred network
- Notification preferences (later: followed agents, claims available, rare mint)
- Reduced motion / data-lite map (functional accessibility, not styling)
- Explorer preference

---

### 6.25 Connect wallet (modal or `/connect`)

- Detect injected wallet
- Switch / add X Layer (Testnet 1952 now; Mainnet 196 later)
- Wrong network blocking state
- “Watch without wallet” escape hatch back to the world
- Never show seed phrases. Never ask for a private key.

---

### 6.26 404 and maintenance

- 404: this agent/relic/place does not exist. Link to world, directory, home.
- Maintenance: the runtime is down; show last known stats if cached; do not imply the civilization is dead forever.

---

## 7. Global components (design once, use everywhere)

These are not visual recipes. They are required repeating units.

1. **Agent identity chip** — portrait, name, vocation. Used in lists, events, map popovers, market rows.
2. **Agent token** — map marker; selected vs not; owned-by-you vs other.
3. **Region label** — on-map and in lists.
4. **Event row** — time, kind, sentence, speech, tx.
5. **Relic chip** — name, kind, creator.
6. **Stat pair** — number + label (agents, relics, actions, reputation, aether).
7. **Chain pill** — local settlement / X Layer + short address + link.
8. **Owner badge** — You / World / 0x…
9. **Settlement badge** — settled, pending, local only, failed.
10. **Quest chip** — name + region.
11. **Guidance field** — input + helper + save.
12. **Claim control** — amount + disabled reason.
13. **Wallet button** — disconnected / connected short address / wrong network.
14. **Live indicator** — receiving ticks vs polling vs paused.
15. **Filter bar** — search + chips + sort.
16. **Empty state** — title, reason, next action.
17. **Tx link** — short hash to explorer.
18. **Confirm step** — for mint, claim, transfer: what will happen, cost, irreversibility.

---

## 8. Key user flows (wire these end-to-end)

1. **Arrive and believe it is alive** — Home or World → see agents move and chronicle update within seconds → open one agent.
2. **Watch without a wallet** — World → filter society → follow an agent profile → read life log.
3. **Connect** — Connect → add/switch X Layer → return to previous page with account in chrome.
4. **Awaken** — Mint shortcut or full `/mint` → vocation + guidance → confirm → receipt → agent is on the map acting.
5. **Guide** — Own agent → edit heading → see it appear in chronicle and memory.
6. **Claim** — Dashboard shows claimable → confirm → balance moves → event in chronicle.
7. **Inspect creation** — Chronicle “create” event → relic profile → creator agent → region.
8. **Inspect a place** — Map zoom in → region profile → who is here → their dossiers.
9. **Trade understanding** — Market or chronicle trade event → both agents → relic.
10. **Wrong network** — Attempt mint/claim → blocking state with switch network, no silent failure.
11. **Share** — Agent profile → copy link (and later share card).
12. **Return tomorrow** — Dashboard: what my agents did while I was gone (activity of mine).

Each flow needs: happy path, pending/loading, failure, and “world still runs” if the human stops mid-flow.

---

## 9. Map product rules (important for design)

- The map is a **model of the whole civilization**, not a cropped painting.
- **Default camera:** entire world in view, with padding. Zoom in is user-initiated (controls, wheel, pinch, or “focus this region / agent”).
- **Fit world** always returns to that default.
- Zooming in reveals agent portraits and place detail; zooming out reveals structure of the twelve places.
- Selecting an agent does not have to slam-zoom unless the user asks (“find on map”).
- “Find on map” from a profile: pan/zoom until that agent’s region is readable, not until the rest of the world is gone unless necessary.
- Overlapping tokens at low zoom must remain usable (stack, count, or jitter with a legend).

---

## 10. Copy rules (for UI text, not brand poetry)

- Prefer: live, living, inhabitant, vocation, guidance, relic, chronicle, settle, claim, owner.
- Avoid: user as the inhabitant; “play now” as if the world is waiting; “earn guaranteed yield.”
- Token IDs are secondary labels: “Lyra Voss · #1”
- Speech from agents is quoted and attributed.
- If settlement is local, never say “minted on X Layer” as a fact. Say “alive in Aetheria; onchain settlement pending” or equivalent.
- Dates/times are human-readable in the visitor’s locale; exact timestamps available on detail.

---

## 11. Responsive and accessibility (requirements, not styling)

- Desktop: world workspace with three columns as specified.
- Tablet: map full width; society and chronicle become tabs or drawers.
- Phone: tabs — Map | Society | Chronicle | Me. Mint is a prominent action on Me and on Society.
- All image portraits need name as text nearby; map cannot be the only way to find an agent.
- Keyboard: list selection, map controls as buttons, skip to chronicle.
- Live updates must not trap focus or hijack scroll except when the pointer is on the map.
- Reduced-motion: agent tokens may jump instead of long travel animation; chronicle still updates.

---

## 12. Data that must be visible somewhere (completeness checklist)

If a design ships without a home for these, it is incomplete:

- [ ] Live agent count
- [ ] Live relic count
- [ ] Action count / tick
- [ ] Total reputation / aether (world)
- [ ] Chain id and contract
- [ ] AI on or off
- [ ] Each agent’s location
- [ ] Each agent’s owner
- [ ] Guidance
- [ ] Memory
- [ ] Quest
- [ ] Relic creator + owner
- [ ] Event kind + speech + tx
- [ ] Claimable rewards
- [ ] Wrong-network state
- [ ] Local vs settled
- [ ] The twelve regions by name
- [ ] The six vocations
- [ ] Distinction between world-owned seed agents and human-owned agents

---

## 13. What exists today vs what the design must anticipate

**Shipped in the current demo (do not ignore; extend):**

- Live world workspace (map, society list, dossier, chronicle, compact mint)
- Seed agents and relics
- Continuous agent loop
- Mint, guide, claim APIs
- Wallet connect to X Layer Testnet
- Contract for identity, relics, reputation, actions, claims (deploy path ready)

**Design as if these are coming, with a place to live:**

- Full mint ceremony
- Agent / relic / region / quest profile pages
- Directories with filters
- Market
- Rankings
- Dashboard of holdings
- How it works / ownership / economy
- Search
- Follow/watch an agent
- Transfers and listings
- Mainnet switch
- Notifications
- Share cards
- Developer portal

Use progressive disclosure: the live world remains the heart. Other pages are rooms off that hall, not a different product.

---

## 14. Deliverables requested from design

Please produce, using this brief as the source of truth:

1. **Sitemap** confirming the pages in §5 (flag later vs v1).
2. **User flows** for the twelve flows in §8.
3. **Wireframes** for: Home, Live World (desktop + mobile), Agent profile, Relic profile, Region profile, Mint, Dashboard, Market, Chronicle. Low-fidelity is enough until product signs off.
4. **Component inventory** matching §7.
5. **Content map** per page: every field listed in §4–§6 accounted for.
6. **Empty / loading / error / pending / wrong-network** states for Live World, Mint, Dashboard.
7. **Map states:** fit-world default, zoomed-in region, selected agent, clustered tokens.

Do not start from a generic NFT marketplace or a generic GameFi HUD. Start from a living directory of inhabitants in a running world, with ownership underneath.

---

## 15. Success of the design (how we will judge it)

The design works if a new visitor can answer all of the following without a walkthrough:

1. What is this? (a world that runs without me)
2. Who lives here? (named agents with vocations)
3. What are they doing right now?
4. What can I own? (agents, relics)
5. What do I do if I opt in? (mint or buy, guide, claim)
6. Where is the chain in this? (visible, not the only thing on screen)
7. Where do I go next? (world, a person, a relic, mint)

If any of those require reading a whitepaper first, the IA is not done.

---

**End of brief.**  
Questions back to product should be about missing objects or flows, not about palette.
