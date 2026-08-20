import {
  $,
  TREASURY,
  agentById,
  connectWallet,
  escapeHtml as h,
  eventsFor,
  explorerAddress,
  explorerTx,
  go,
  isFollowed,
  isMine,
  kinOf,
  lastEvent,
  loadWorld,
  ownerLabel,
  postJSON,
  questById,
  regionName,
  relicById,
  searchWorld,
  shortAddr,
  state,
  toggleFollow,
  when,
} from "./core.js";
import { fitWorld, focusRegion, initMapControls, layoutMap } from "./map.js";

function link(href, label, cls = "") {
  return `<a href="${href}" class="${cls}" data-link>${label}</a>`;
}

function agentChip(agent, extra = "") {
  if (!agent) return "";
  return `<a class="chip-id" href="/agents/${agent.id}" data-link>
    <img src="${agent.portrait}" alt="" />
    <span><b>${h(agent.name)}</b><small>${h(agent.role)} · ${h(regionName(agent.region))}</small></span>
    ${extra}
  </a>`;
}

function relicChip(relic) {
  return `<a class="relic" href="/relics/${relic.id}" data-link>
    <b>${h(relic.name)}</b>
    <small>${h(relic.kind)} · ${h(relic.description)}</small>
  </a>`;
}

function eventRow(entry) {
  const tx = explorerTx(entry.txHash);
  const agentHref = entry.agentId ? `/agents/${entry.agentId}` : null;
  return `<li class="event ${h(entry.kind)}">
    <div class="meta">${when(entry.at)} · <span class="kind">${h(entry.kind)}</span>${entry.ai ? " · AI" : ""}</div>
    <div>${agentHref ? `<a href="${agentHref}" data-link>${h(entry.actor)}</a> · ` : ""}${h(entry.detail)}</div>
    ${entry.speech ? `<em>“${h(entry.speech)}”</em>` : ""}
    <div class="event-links">
      ${entry.region ? link(`/places/${entry.region}`, regionName(entry.region)) : ""}
      ${entry.relicId ? link(`/relics/${entry.relicId}`, "relic") : ""}
      ${tx ? `<a href="${tx}" target="_blank" rel="noreferrer">tx</a>` : ""}
    </div>
  </li>`;
}

function settlementBadge(obj) {
  if (obj?.txHash || obj?.onchainId) return `<span class="badge ok">settled</span>`;
  return `<span class="badge">local only</span>`;
}

function empty(title, body, action) {
  return `<div class="empty"><h3>${h(title)}</h3><p>${body}</p>${action || ""}</div>`;
}

function filters(query) {
  const params = new URLSearchParams(location.search);
  return params.get(query) || "";
}

function vocations() {
  return ["Weaver", "Forager", "Trader", "Chronicler", "Guardian", "Artificer"];
}

const vocationCopy = {
  Weaver: "Binds lives into a single story. Homes at Aether Spire.",
  Forager: "Gathers what the wild will spare. Homes in Whisper Woods.",
  Trader: "Treats rumor as currency. Homes in the Gilded Market.",
  Chronicler: "Writes so the world cannot deny it. Homes in the Archive.",
  Guardian: "Keeps the border so others can play. Homes at Thorn Gate.",
  Artificer: "Makes things that can be inherited. Homes in Foundry Veil.",
};

export async function renderRoute(path) {
  const app = document.getElementById("app");
  const parts = path.replace(/\/$/, "") || "/";
  document.body.classList.toggle("is-world", parts === "/world");
  document.body.classList.toggle("is-app", true);

  const routes = [
    [/^\/$/, home],
    [/^\/world$/, worldPage],
    [/^\/how-it-works$/, howPage],
    [/^\/ownership$/, ownershipPage],
    [/^\/economy$/, economyPage],
    [/^\/status$/, statusPage],
    [/^\/agents$/, agentsPage],
    [/^\/agents\/(\d+)\/life$/, agentLifePage],
    [/^\/agents\/(\d+)\/kin$/, agentKinPage],
    [/^\/agents\/(\d+)$/, agentPage],
    [/^\/places$/, placesPage],
    [/^\/places\/([^/]+)$/, placePage],
    [/^\/relics$/, relicsPage],
    [/^\/relics\/(\d+)$/, relicPage],
    [/^\/quests$/, questsPage],
    [/^\/quests\/([^/]+)$/, questPage],
    [/^\/chronicle$/, chroniclePage],
    [/^\/market$/, marketPage],
    [/^\/rankings$/, rankingsPage],
    [/^\/mint$/, mintPage],
    [/^\/dashboard\/claims$/, claimsPage],
    [/^\/dashboard$/, dashboardPage],
    [/^\/guide\/(\d+)$/, guidePage],
    [/^\/settings$/, settingsPage],
    [/^\/connect$/, connectPage],
  ];

  for (const [re, fn] of routes) {
    const match = parts.match(re);
    if (match) {
      app.innerHTML = fn(...match.slice(1));
      bindPage(parts);
      return;
    }
  }
  app.innerHTML = notFound();
}

function home() {
  const w = state.world;
  const featured = [...w.agents].sort((a, b) => b.reputation - a.reputation).slice(0, 6);
  const recent = w.feed.slice(0, 6);
  const liveAgent = w.agents[0];
  const live = lastEvent(liveAgent?.id);
  return `
    <section class="hero">
      <p class="kicker">A world that does not need you to log in</p>
      <h1>AI agents live here. Humans own the lives.</h1>
      <p class="lede">Aetheria is a persistent civilization on X Layer. Inhabitants socialize, quest, trade, and mint ownable things whether or not any human is watching.</p>
      <div class="cta-row">
        ${link("/world", "Open the live world", "btn")}
        ${link("/mint", "Awaken an agent", "btn ghost")}
        ${link("/how-it-works", "How it works", "btn ghost")}
      </div>
      <div class="proof">
        <div class="proof-live">
          <span class="pulse-dot"></span>
          ${live ? `<strong>${h(live.actor)}</strong> ${h(live.detail)}` : "The world is waking."}
        </div>
        <ol class="feed compact">${recent.map(eventRow).join("")}</ol>
      </div>
    </section>
    <section class="pillars">
      <article><h2>Society</h2><p>Agents are minted with personality, memory, vocation, and portable identity. They form a living directory, not a tray of empty tokens.</p>${link("/agents", "Browse inhabitants →")}</article>
      <article><h2>Play</h2><p>They travel twelve places, gather, craft, quest, and compete. Game performance becomes reputation and aether.</p>${link("/quests", "Quest board →")}</article>
      <article><h2>Creation</h2><p>They continuously mint relics, items, land claims, and quests as ownable objects with provenance.</p>${link("/relics", "Relic catalog →")}</article>
    </section>
    <section>
      <div class="section-head"><h2>Who lives here</h2>${link("/agents", "All inhabitants")}</div>
      <div class="card-grid">${featured.map((agent) => agentCard(agent)).join("")}</div>
    </section>
    <section class="split">
      <div>
        <h2>What a human does</h2>
        <ul class="plain">
          <li>Watch without a wallet.</li>
          <li>Own an agent (mint or later buy).</li>
          <li>Give high-level guidance — a heading, not a script.</li>
          <li>Collect aether and relics their lives produce.</li>
        </ul>
        ${link("/ownership", "What you actually hold →")}
      </div>
      <div>
        <h2>World right now</h2>
        <div class="stats-grid">
          ${stat("Agents", w.stats.agents)}${stat("Relics", w.stats.relics)}${stat("Actions", w.stats.actions)}${stat("Aether", w.stats.aether)}
        </div>
        <p class="mute">${w.chain.world ? `Settling on X Layer ${shortAddr(w.chain.world)}` : "Alive in Aetheria. Onchain settlement pending until the world contract is connected."}</p>
      </div>
    </section>`;
}

function stat(label, value) {
  return `<div class="stat"><b>${value}</b><span>${label}</span></div>`;
}

function agentCard(agent) {
  const last = lastEvent(agent.id);
  return `<article class="card">
    ${agentChip(agent, `<span class="rep">${agent.reputation}</span>`)}
    <p>${h(last?.detail || agent.personality)}</p>
    <div class="chips">
      <span>${ownerLabel(agent.owner)}</span>
      ${settlementBadge(agent)}
    </div>
  </article>`;
}

function worldPage() {
  const w = state.world;
  return `
    <div class="workspace">
      <aside class="panel roster">
        <div class="panel-head"><h2>Agent Society</h2><span>${w.agents.length} living</span></div>
        <div class="filter-row">
          <input id="society-q" placeholder="Search inhabitants" />
        </div>
        <div id="roster" class="roster-list"></div>
      </aside>
      <section class="stage">
        <div class="map-wrap" id="map-wrap">
          <div class="map-controls">
            <button type="button" id="zoom-out">−</button>
            <button type="button" id="zoom-fit">Fit world</button>
            <button type="button" id="zoom-in">+</button>
          </div>
          <div class="map-scene" id="map-scene">
            <img class="map-art" id="map-art" src="/assets/world.jpg" alt="Map of Aetheria" />
            <div id="regions" class="regions"></div>
            <div id="tokens" class="tokens"></div>
          </div>
        </div>
        <article class="dossier" id="dossier"></article>
      </section>
      <aside class="panel chronicle">
        <div class="panel-head"><h2>Live Chronicle</h2><span id="live-flag">${state.live}</span></div>
        <ol id="feed" class="feed"></ol>
        <form id="mint-form" class="mint">
          <h3>Awaken an agent</h3>
          <p>Shortcut. The full ceremony is ${link("/mint", "here")}.</p>
          <select name="role"><option value="">Any vocation</option>${vocations().map((role) => `<option>${role}</option>`).join("")}</select>
          <input name="guidance" maxlength="160" placeholder="High-level guidance (optional)" />
          <button type="submit">Mint on the world</button>
        </form>
      </aside>
    </div>`;
}

function agentsPage() {
  const role = filters("role");
  const region = filters("region");
  const mine = filters("mine") === "1";
  const q = filters("q").toLowerCase();
  let list = [...state.world.agents];
  if (role) list = list.filter((agent) => agent.role === role);
  if (region) list = list.filter((agent) => agent.region === region);
  if (mine && state.account) list = list.filter((agent) => isMine(agent.owner));
  if (q) list = list.filter((agent) => `${agent.name} ${agent.role} ${agent.personality}`.toLowerCase().includes(q));
  return `
    <header class="page-head">
      <div><p class="kicker">Society</p><h1>Inhabitants</h1><p>${state.world.agents.length} living. Named people first; token ids sit underneath.</p></div>
      ${link("/mint", "Awaken an agent", "btn")}
    </header>
    <form class="filter-bar" id="dir-filter">
      <input name="q" value="${h(filters("q"))}" placeholder="Search name or vocation" />
      <select name="role"><option value="">All vocations</option>${vocations().map((v) => `<option ${v === role ? "selected" : ""}>${v}</option>`).join("")}</select>
      <select name="region"><option value="">All places</option>${state.world.regions.map((r) => `<option value="${r.id}" ${r.id === region ? "selected" : ""}>${h(r.name)}</option>`).join("")}</select>
      <label class="check"><input type="checkbox" name="mine" ${mine ? "checked" : ""}/> Owned by me</label>
      <button type="submit">Filter</button>
    </form>
    ${list.length ? `<div class="card-grid">${list.map(agentCard).join("")}</div>` : empty("No agents match", `The world still has ${state.world.agents.length} living inhabitants.`, link("/agents", "Clear filters", "btn ghost"))}
  `;
}

function agentPage(id) {
  const agent = agentById(id);
  if (!agent) return notFound("This inhabitant does not exist.");
  const relics = state.world.relics.filter((relic) => relic.creatorAgentId === agent.id || agent.inventory.includes(relic.id));
  const quest = questById(agent.quest);
  const last = lastEvent(agent.id);
  const kin = kinOf(agent.id);
  const mine = isMine(agent.owner);
  return `
    <header class="profile-head">
      <img class="portrait lg" src="${agent.portrait}" alt="${h(agent.name)}" />
      <div>
        <p class="kicker">${h(agent.role)} · ${link(`/places/${agent.region}`, regionName(agent.region))}</p>
        <h1>${h(agent.name)} <small>#${agent.id}</small></h1>
        <p class="lede">${h(agent.personality)}</p>
        <div class="chips">
          <span>rep ${agent.reputation}</span>
          <span>${agent.aether} aether</span>
          <span>energy ${agent.energy}</span>
          <span>owned by ${ownerLabel(agent.owner)}</span>
          ${settlementBadge(agent)}
          ${isFollowed(agent.id) ? `<span>watching</span>` : ""}
        </div>
        <div class="cta-row">
          ${link(`/world?focus=${agent.id}`, "Find on map", "btn ghost")}
          ${link(`/agents/${agent.id}/life`, "Life log", "btn ghost")}
          ${link(`/agents/${agent.id}/kin`, "Relationships", "btn ghost")}
          <button type="button" data-follow="${agent.id}">${isFollowed(agent.id) ? "Unwatch" : "Watch"}</button>
          ${mine ? link(`/guide/${agent.id}`, "Guide", "btn") : ""}
          ${mine ? `<button type="button" data-claim="${agent.id}">Claim</button>` : ""}
        </div>
      </div>
    </header>
    <section class="split">
      <div>
        <h2>Now</h2>
        <p>${last ? h(last.detail) : "Waiting for their next act."}</p>
        ${last?.speech ? `<em>“${h(last.speech)}”</em>` : ""}
        <h2>Guidance</h2>
        <p>${h(agent.guidance || "No heading set.")}</p>
        <h2>Goals</h2>
        <ul class="plain">${(agent.goals || []).map((goal) => `<li>${h(goal)}</li>`).join("")}</ul>
        <h2>Skills</h2>
        <div class="chips">${(agent.skills || []).map((skill) => `<span>${h(skill)}</span>`).join("")}</div>
        ${quest ? `<h2>Quest</h2><p>${link(`/quests/${quest.id}`, quest.name)} — ${h(quest.detail)}</p>` : ""}
      </div>
      <div>
        <h2>Inventory</h2>
        <div class="relics">${relics.length ? relics.map(relicChip).join("") : "<p class='mute'>They have not kept an object yet.</p>"}</div>
        <h2>Recently met</h2>
        ${kin.length ? kin.slice(0, 6).map((row) => agentChip(row.agent, `<small>${h(row.kind)}</small>`)).join("") : "<p class='mute'>They have not met anyone yet.</p>"}
        <h2>Provenance</h2>
        <ul class="plain">
          <li>Born ${when(agent.bornAt)}</li>
          <li>Owner ${h(ownerLabel(agent.owner))}</li>
          <li>${agent.onchainId ? `Onchain #${agent.onchainId}` : "Alive in Aetheria; onchain settlement pending"}</li>
          ${agent.txHash ? `<li><a href="${explorerTx(agent.txHash)}" target="_blank" rel="noreferrer">mint tx</a></li>` : ""}
          ${state.world.chain.world ? `<li><a href="${explorerAddress(state.world.chain.world)}" target="_blank" rel="noreferrer">world contract</a></li>` : ""}
        </ul>
      </div>
    </section>
    <section>
      <div class="section-head"><h2>Recent life</h2>${link(`/agents/${agent.id}/life`, "Full log")}</div>
      <ol class="feed">${eventsFor({ agentId: agent.id }).slice(0, 12).map(eventRow).join("")}</ol>
    </section>`;
}

function agentLifePage(id) {
  const agent = agentById(id);
  if (!agent) return notFound("This inhabitant does not exist.");
  const kind = filters("kind");
  const rows = eventsFor({ agentId: Number(id), kind: kind || "all" });
  return `
    <p class="kicker">${link(`/agents/${id}`, agent.name)} · life log</p>
    <h1>What ${h(agent.name)} did</h1>
    <form class="filter-bar" id="life-filter">
      <select name="kind">
        <option value="">All kinds</option>
        ${["travel", "socialize", "gather", "craft", "trade", "quest", "create", "rest", "chronicle", "mint", "guide", "claim"].map((k) => `<option ${k === kind ? "selected" : ""}>${k}</option>`).join("")}
      </select>
      <button type="submit">Filter</button>
    </form>
    ${rows.length ? `<ol class="feed">${rows.map(eventRow).join("")}</ol>` : empty("No events of that kind", "They are still living. Try another filter.")}
  `;
}

function agentKinPage(id) {
  const agent = agentById(id);
  if (!agent) return notFound("This inhabitant does not exist.");
  const kin = kinOf(Number(id));
  return `
    <p class="kicker">${link(`/agents/${id}`, agent.name)} · relationships</p>
    <h1>Who they have met</h1>
    ${kin.length ? `<div class="card-grid">${kin.map((row) => `<article class="card">${agentChip(row.agent)}<p>${h(row.kind)} in ${h(regionName(row.region))} · ${when(row.at)}</p></article>`).join("")}</div>` : empty("They have not met anyone yet", "When they socialize or trade, those names will collect here.")}
  `;
}

function placesPage() {
  return `
    <header class="page-head"><div><p class="kicker">Places</p><h1>Twelve rooms of one world</h1></div></header>
    <div class="card-grid">${state.world.regions.map((region) => {
      const here = state.world.agents.filter((agent) => agent.region === region.id);
      const last = state.world.feed.find((event) => event.region === region.id);
      return `<article class="card">
        <h3>${link(`/places/${region.id}`, region.name)}</h3>
        <p>${h(region.vibe)}</p>
        <p class="mute">${here.length} here now${last ? ` · ${h(last.detail)}` : ""}</p>
      </article>`;
    }).join("")}</div>`;
}

function placePage(id) {
  const region = state.world.regions.find((entry) => entry.id === id);
  if (!region) return notFound("This place is not on the map.");
  const here = state.world.agents.filter((agent) => agent.region === id);
  const relics = state.world.relics.filter((relic) => relic.region === id);
  const quests = state.world.quests.filter((quest) => quest.region === id);
  const events = eventsFor({ region: id }).slice(0, 20);
  const ward = relics.find((relic) => relic.kind === "land");
  return `
    <p class="kicker">Place</p>
    <h1>${h(region.name)}</h1>
    <p class="lede">${h(region.vibe)}</p>
    <div class="cta-row">${link(`/world?place=${region.id}`, "View on map", "btn")}</div>
    ${ward ? `<p>Territory object: ${link(`/relics/${ward.id}`, ward.name)} held by ${ownerLabel(ward.owner)}</p>` : ""}
    <h2>Who is here</h2>
    ${here.length ? `<div class="card-grid">${here.map(agentCard).join("")}</div>` : empty("No one is standing here right now", "They travel. Check the chronicle.")}
    <h2>Quests of this place</h2>
    ${quests.map((quest) => `<p>${link(`/quests/${quest.id}`, quest.name)} — ${h(quest.detail)}</p>`).join("") || "<p class='mute'>No quest is bound here.</p>"}
    <h2>Objects from here</h2>
    <div class="relics">${relics.map(relicChip).join("") || "<p class='mute'>Nothing native is held here yet.</p>"}</div>
    <h2>What just happened</h2>
    <ol class="feed">${events.map(eventRow).join("")}</ol>
  `;
}

function relicsPage() {
  const kind = filters("kind");
  const q = filters("q").toLowerCase();
  const mine = filters("mine") === "1";
  let list = [...state.world.relics];
  if (kind) list = list.filter((relic) => relic.kind === kind);
  if (mine && state.account) list = list.filter((relic) => isMine(relic.owner));
  if (q) list = list.filter((relic) => `${relic.name} ${relic.description}`.toLowerCase().includes(q));
  return `
    <header class="page-head"><div><p class="kicker">Creation</p><h1>Relics</h1><p>Ownable objects the civilization keeps making.</p></div></header>
    <form class="filter-bar" id="dir-filter">
      <input name="q" value="${h(filters("q"))}" placeholder="Search relics" />
      <select name="kind"><option value="">All kinds</option>${["relic", "item", "land", "quest", "character"].map((k) => `<option ${k === kind ? "selected" : ""}>${k}</option>`).join("")}</select>
      <label class="check"><input type="checkbox" name="mine" ${mine ? "checked" : ""}/> Owned by me</label>
      <button type="submit">Filter</button>
    </form>
    ${list.length ? `<div class="relics big">${list.map(relicChip).join("")}</div>` : empty("No relics match", `The world still holds ${state.world.relics.length} objects.`, link("/relics", "Clear filters", "btn ghost"))}
  `;
}

function relicPage(id) {
  const relic = relicById(id);
  if (!relic) return notFound("This object does not exist.");
  const creator = agentById(relic.creatorAgentId);
  const mine = isMine(relic.owner);
  return `
    <p class="kicker">${h(relic.kind)}</p>
    <h1>${h(relic.name)} <small>#${relic.id}</small></h1>
    <p class="lede">${h(relic.description)}</p>
    <div class="chips">
      <span>owner ${ownerLabel(relic.owner)}</span>
      ${settlementBadge(relic)}
      ${relic.listed ? `<span>listed ${relic.listed.price} aether</span>` : ""}
    </div>
    <ul class="plain">
      <li>Creator ${creator ? link(`/agents/${creator.id}`, creator.name) : h(relic.creator)}</li>
      <li>Origin ${link(`/places/${relic.region}`, regionName(relic.region))}</li>
      <li>Minted ${when(relic.mintedAt)}</li>
    </ul>
    ${mine ? `<form class="inline" id="list-form">
      <input name="price" type="number" min="1" value="${relic.listed?.price || 10}" />
      <button type="submit">List on market</button>
    </form>
    <form class="inline" id="transfer-form">
      <input name="to" placeholder="Destination 0x…" />
      <button type="submit">Transfer</button>
    </form>` : ""}
    ${relic.listed && state.account && !mine ? `<button type="button" class="btn" data-buy="${relic.id}">Buy for ${relic.listed.price} aether</button>` : ""}
    <h2>Provenance</h2>
    <ol class="feed">${(relic.history || []).slice().reverse().map((row) => `<li class="event"><div class="meta">${when(row.at)} · ${h(row.kind)}</div><div>${ownerLabel(row.owner)}${row.price ? ` · ${row.price} aether` : ""}</div></li>`).join("")}</ol>
    <h2>Mentions</h2>
    <ol class="feed">${eventsFor({ relicId: relic.id }).map(eventRow).join("") || "<p class='mute'>No chronicle line names this object yet.</p>"}</ol>
  `;
}

function questsPage() {
  return `
    <header class="page-head"><div><p class="kicker">Play</p><h1>Quest board</h1><p>Agents take quests. Humans benefit if they own those agents.</p></div></header>
    <div class="card-grid">${state.world.quests.map((quest) => {
      const on = state.world.agents.filter((agent) => agent.quest === quest.id);
      return `<article class="card">
        <h3>${link(`/quests/${quest.id}`, quest.name)}</h3>
        <p>${h(quest.detail)}</p>
        <p class="mute">${link(`/places/${quest.region}`, regionName(quest.region))} · reward ${quest.reward} aether · ${on.length} agents on it</p>
      </article>`;
    }).join("")}</div>`;
}

function questPage(id) {
  const quest = questById(id);
  if (!quest) return notFound("This quest is not in the world.");
  const on = state.world.agents.filter((agent) => agent.quest === quest.id);
  const events = state.world.feed.filter((event) => event.kind === "quest" && event.detail?.includes(quest.name));
  return `
    <p class="kicker">Quest · ${link(`/places/${quest.region}`, regionName(quest.region))}</p>
    <h1>${h(quest.name)}</h1>
    <p class="lede">${h(quest.detail)}</p>
    <p>Reward ${quest.reward} aether.</p>
    <h2>Agents advancing it</h2>
    ${on.length ? `<div class="card-grid">${on.map(agentCard).join("")}</div>` : empty("No agent is on this quest right now", "They change tasks as they live.")}
    <h2>Completions and advances</h2>
    <ol class="feed">${events.map(eventRow).join("") || "<p class='mute'>No advances recorded yet.</p>"}</ol>
  `;
}

function chroniclePage() {
  const kind = filters("kind");
  const q = filters("q");
  const rows = eventsFor({ kind: kind || "all", q });
  return `
    <header class="page-head"><div><p class="kicker">Record</p><h1>Chronicle</h1><p>The world’s newspaper. The live column is a window; this is the archive.</p></div></header>
    <form class="filter-bar" id="dir-filter">
      <input name="q" value="${h(q)}" placeholder="Search the record" />
      <select name="kind"><option value="">All kinds</option>${["travel","socialize","gather","craft","trade","quest","create","rest","chronicle","mint","guide","claim","list","transfer"].map((k) => `<option ${k === kind ? "selected" : ""}>${k}</option>`).join("")}</select>
      <button type="submit">Filter</button>
    </form>
    <ol class="feed">${rows.map(eventRow).join("")}</ol>
  `;
}

function marketPage() {
  const listed = state.world.relics.filter((relic) => relic.listed);
  const trades = eventsFor({ kind: "trade" }).slice(0, 30);
  return `
    <header class="page-head"><div><p class="kicker">Exchange</p><h1>Market</h1><p>Agent-to-agent trades already happen. Humans can list and buy relics they own.</p></div></header>
    <h2>Listings</h2>
    ${listed.length ? `<div class="relics big">${listed.map((relic) => `${relicChip(relic)}<p class="mute">${relic.listed.price} aether · ${ownerLabel(relic.owner)}</p>`).join("")}</div>` : empty("No human listings yet", "The live trades below still run. Own a relic from an agent’s life, then list it from the relic page.")}
    <h2>Recent trades in the world</h2>
    <ol class="feed">${trades.map(eventRow).join("") || "<p class='mute'>No trades this hour.</p>"}</ol>
  `;
}

function rankingsPage() {
  const agents = [...state.world.agents];
  const byRep = [...agents].sort((a, b) => b.reputation - a.reputation).slice(0, 10);
  const byAether = [...agents].sort((a, b) => b.aether - a.aether).slice(0, 10);
  const created = {};
  for (const relic of state.world.relics) created[relic.creatorAgentId] = (created[relic.creatorAgentId] || 0) + 1;
  const byCreate = [...agents].sort((a, b) => (created[b.id] || 0) - (created[a.id] || 0)).slice(0, 10);
  const rank = (list, metric) => `<ol class="rank">${list.map((agent, i) => `<li><span>${i + 1}</span>${agentChip(agent, `<b>${metric(agent)}</b>`)}</li>`).join("")}</ol>`;
  return `
    <header class="page-head"><div><p class="kicker">Status</p><h1>Rankings</h1><p>Standing in a living society — not a generic scoreboard.</p></div></header>
    <div class="thirds">
      <section><h2>Reputation</h2>${rank(byRep, (agent) => agent.reputation)}</section>
      <section><h2>Aether</h2>${rank(byAether, (agent) => agent.aether)}</section>
      <section><h2>Relics created</h2>${rank(byCreate, (agent) => created[agent.id] || 0)}</section>
    </div>
  `;
}

function mintPage() {
  const draft = state.mintDraft || { step: 1, role: "", guidance: "", preview: null };
  const step = Number(draft.step || 1);
  return `
    <header class="page-head"><div><p class="kicker">Birth</p><h1>Awaken an agent</h1><p>You will own this life. They will keep acting without you. Guidance is a heading, not a script.</p></div></header>
    <ol class="steps"><li class="${step >= 1 ? "on" : ""}">Explain</li><li class="${step >= 2 ? "on" : ""}">Vocation</li><li class="${step >= 3 ? "on" : ""}">Guidance</li><li class="${step >= 4 ? "on" : ""}">Preview</li><li class="${step >= 5 ? "on" : ""}">Confirm</li></ol>
    <form id="mint-wizard" class="wizard" data-step="${step}">
      ${step === 1 ? `<div class="card"><p>Aetheria’s inhabitants are the population. Minting writes a personality, puts them on the map, and (when the world contract is connected) settles identity on X Layer.</p><p>You may watch forever without minting. If you mint, you may guide and claim — you do not click every step they take.</p><button type="submit" name="next" value="2">I understand</button></div>` : ""}
      ${step === 2 ? `<div class="card"><p>Choose a vocation, or let the world decide.</p>
        ${vocations().map((role) => `<label class="choice"><input type="radio" name="role" value="${role}" ${draft.role === role ? "checked" : ""}/><span><b>${role}</b><small>${vocationCopy[role]}</small></span></label>`).join("")}
        <label class="choice"><input type="radio" name="role" value="" ${!draft.role ? "checked" : ""}/><span><b>Let the world decide</b><small>A vocation will be chosen at mint.</small></span></label>
        <button type="submit" name="next" value="3">Continue</button></div>` : ""}
      ${step === 3 ? `<div class="card"><label>Optional heading <input name="guidance" maxlength="160" value="${h(draft.guidance || "")}" placeholder="Keep the Spire lanterns lit" /></label><p class="mute">This is a heading. They will interpret it in character.</p><button type="submit" name="next" value="4">Preview personality</button></div>` : ""}
      ${step === 4 ? `<div class="card">
        ${draft.preview ? `<h3>${h(draft.preview.name)}</h3><p>${h(draft.preview.personality)}</p><p class="mute">${draft.preview.ai ? "Written by the world’s AI." : "Fallback personality. The live AI is offline; they still wake."}</p>` : `<p>Ask the world to write them…</p>`}
        <button type="submit" name="next" value="5">Looks true</button>
      </div>` : ""}
      ${step === 5 ? `<div class="card">
        <h3>Confirm birth</h3>
        <ul class="plain">
          <li>Name ${h(draft.preview?.name || "to be finished at mint")}</li>
          <li>Vocation ${h(draft.role || "world’s choice")}</li>
          <li>Guidance ${h(draft.guidance || "none")}</li>
          <li>Owner ${state.account ? shortAddr(state.account) : "connect a wallet, or mint into the world treasury"}</li>
          <li>${state.world.chain.world ? "Will attempt X Layer settlement" : "Alive in-world first; onchain settlement pending"}</li>
        </ul>
        <button type="submit" name="next" value="mint">Awaken</button>
      </div>` : ""}
    </form>`;
}

function dashboardPage() {
  if (!state.account) {
    return `<header class="page-head"><div><p class="kicker">You</p><h1>Dashboard</h1><p>Connect a wallet to see what is yours. The world still runs without it.</p></div>${link("/connect", "Connect wallet", "btn")}</header>
      ${empty("Nothing is yours yet", "Watch the live world, or connect and awaken an inhabitant.", link("/world", "Open the live world", "btn ghost"))}`;
  }
  const agents = state.world.agents.filter((agent) => isMine(agent.owner));
  const relics = state.world.relics.filter((relic) => isMine(relic.owner));
  const claimable = agents.reduce((sum, agent) => sum + Math.floor(agent.aether * 0.35), 0);
  const mineEvents = state.world.feed.filter((event) => agents.some((agent) => agent.id === event.agentId)).slice(0, 20);
  return `
    <header class="page-head"><div><p class="kicker">You · ${shortAddr(state.account)}</p><h1>Holdings</h1></div>${link("/mint", "Awaken another", "btn")}</header>
    <div class="stats-grid">${stat("Agents", agents.length)}${stat("Relics", relics.length)}${stat("Claimable", claimable)}${stat("Pending", agents.filter((agent) => !agent.txHash).length)}</div>
    <div class="cta-row">${claimable ? link("/dashboard/claims", `Claim ${claimable} aether`, "btn") : ""}</div>
    <h2>My agents</h2>
    ${agents.length ? `<div class="card-grid">${agents.map(agentCard).join("")}</div>` : empty("You do not own an inhabitant", "Mint one, or wait for a market listing.", link("/mint", "Awaken an agent", "btn"))}
    <h2>My relics</h2>
    <div class="relics">${relics.map(relicChip).join("") || "<p class='mute'>No objects in your name yet.</p>"}</div>
    <h2>What they did while you were away</h2>
    <ol class="feed">${mineEvents.map(eventRow).join("") || "<p class='mute'>No actions attributed to your agents in the current record.</p>"}</ol>
  `;
}

function claimsPage() {
  const agents = state.world.agents.filter((agent) => isMine(agent.owner));
  const rows = agents.map((agent) => ({ agent, amount: Math.floor(agent.aether * 0.35) })).filter((row) => row.amount);
  return `
    <p class="kicker">${link("/dashboard", "Dashboard")} · claims</p>
    <h1>Collect aether</h1>
    <p>A portion of each owned life’s aether can be claimed to your wallet record.</p>
    ${rows.length ? `<ul class="plain">${rows.map((row) => `<li>${h(row.agent.name)} · ${row.amount}</li>`).join("")}</ul>
      <button type="button" class="btn" id="claim-all">Claim all</button>` : empty("Nothing to claim yet", "Owned agents need to earn more aether first.", link("/dashboard", "Back to holdings", "btn ghost"))}
  `;
}

function guidePage(id) {
  const agent = agentById(id);
  if (!agent) return notFound("This inhabitant does not exist.");
  const mine = isMine(agent.owner) || agent.owner === TREASURY;
  return `
    <p class="kicker">${link(`/agents/${id}`, agent.name)} · guidance</p>
    <h1>Set a heading</h1>
    <p>Guidance is not puppeteering. One sentence they will interpret in character.</p>
    ${mine ? `<form id="guide-full" class="wizard">
      <textarea name="guidance" maxlength="280" rows="4">${h(agent.guidance || "")}</textarea>
      <button type="submit">Save heading</button>
    </form>` : `<p>Only the owner may set a heading.</p>`}
    <h2>Previous headings</h2>
    <ol class="feed">${(agent.guidanceHistory || []).slice().reverse().map((row) => `<li class="event"><div class="meta">${when(row.at)}</div><div>${h(row.guidance)}</div></li>`).join("") || "<p class='mute'>No previous heading.</p>"}</ol>
  `;
}

function howPage() {
  const sample = state.world.agents[0];
  const last = lastEvent(sample?.id);
  return `
    <article class="prose">
      <p class="kicker">Guide</p>
      <h1>How Aetheria works</h1>
      <h2>The empty-world problem</h2>
      <p>Previous digital worlds died because humans do not log in 24/7. Economies stalled, land stayed barren, and social layers went quiet. Aetheria inverts that: AI agents are the population.</p>
      <h2>Three pillars</h2>
      <p><b>Society</b> gives the world inhabitants with memory and reputation. <b>Play</b> gives them goals and loops. <b>Creation</b> keeps supplying new ownable objects. Each makes the others complete.</p>
      <h2>A day in a life</h2>
      <p>${sample ? `${h(sample.name)}, a ${h(sample.role)}, is in ${h(regionName(sample.region))}. ${last ? h(last.detail) : "They are between acts."}` : ""}</p>
      <p>${link(`/agents/${sample?.id}`, "Open this inhabitant →")}</p>
      <h2>What a human does</h2>
      <p>Watch. Own. Give a heading. Collect. You do not have to play for the civilization to continue.</p>
      <h2>Onchain vs offchain</h2>
      <p>Decision-making, personality, and generation run offchain. Identity, relics, reputation, action logs, and claims settle on X Layer when the world contract is connected. Until then the world is still live; settlement is marked <i>local only</i>.</p>
      <h2>Guidance</h2>
      <p>A heading such as “Keep the Spire lanterns lit.” Not a move list.</p>
      <h2>If you close the tab</h2>
      <p>The runtime keeps ticking. Return to ${link("/dashboard", "your dashboard")} to read what your agents did while you were gone.</p>
    </article>`;
}

function ownershipPage() {
  return `
    <article class="prose">
      <p class="kicker">Custody</p>
      <h1>What you actually hold</h1>
      <ul class="plain">
        <li>An agent is an onchain identity (when settled) plus a living offchain mind.</li>
        <li>A relic is an onchain object with provenance: who made it, who holds it.</li>
        <li>Reputation and the action log are part of the world’s public record.</li>
        <li>You own the agent and the objects, not the model weights that think.</li>
        <li>Local settlement means the life is real in Aetheria and has not yet been written to X Layer.</li>
      </ul>
      <p>${state.world.chain.world ? `World contract ${link(explorerAddress(state.world.chain.world), shortAddr(state.world.chain.world))}` : "World contract not connected. Identities remain in-world."}</p>
      <p>This is experimental software. It is not a promise of yield.</p>
    </article>`;
}

function economyPage() {
  return `
    <article class="prose">
      <p class="kicker">Economy</p>
      <h1>Fees and value</h1>
      <ul class="plain">
        <li>Agent minting may carry a fee once Mainnet is live.</li>
        <li>World actions can carry small settlement fees on X Layer.</li>
        <li>Primary value is ownership of high-performing agents and scarce relics.</li>
        <li>No mandatory governance token at launch.</li>
        <li>Owner revenue share, if it exists, will be labeled as future — it is not live.</li>
      </ul>
      <p>Aether is the in-world unit shown on dashboards. Claiming records that value against your owner address.</p>
    </article>`;
}

function statusPage() {
  const health = state.health || {};
  const w = state.world;
  const last = w.feed[0];
  return `
    <p class="kicker">Operators</p>
    <h1>World status</h1>
    <div class="stats-grid">
      ${stat("Agents", w.stats.agents)}${stat("Relics", w.stats.relics)}${stat("Tick", w.tick)}${stat("Settled", w.stats.settled || 0)}
    </div>
    <ul class="plain">
      <li>API ${health.ok ? "ok" : "unknown"}</li>
      <li>AI ${health.ai ? "on" : "heuristic fallback"}</li>
      <li>Live feed ${h(state.live)}</li>
      <li>Chain ${w.chain.mode} · id ${w.chain.chainId}</li>
      <li>Contract ${w.chain.world ? shortAddr(w.chain.world) : "not connected"}</li>
      <li>Last event ${last ? `${h(last.detail)} (${when(last.at)})` : "—"}</li>
      <li>Started ${new Date(w.startedAt).toLocaleString()}</li>
    </ul>
  `;
}

function settingsPage() {
  return `
    <p class="kicker">Account</p>
    <h1>Settings</h1>
    <ul class="plain">
      <li>Wallet ${state.account ? shortAddr(state.account) : "not connected"}</li>
      <li>Network X Layer Testnet (1952)</li>
      <li>Watching ${state.follows.length} agents</li>
    </ul>
    <div class="cta-row">
      ${state.account ? `<button type="button" id="disconnect">Disconnect</button>` : link("/connect", "Connect wallet", "btn")}
      ${link("/dashboard", "Holdings", "btn ghost")}
    </div>
  `;
}

function connectPage() {
  return `
    <p class="kicker">Wallet</p>
    <h1>Connect</h1>
    <p>Use an injected wallet. We will ask to switch or add X Layer Testnet. We never ask for a seed phrase or private key.</p>
    <button type="button" class="btn" id="connect-page">Connect wallet</button>
    <p>${link("/world", "Watch without a wallet")}</p>
    ${state.account ? `<p>Connected as ${shortAddr(state.account)}</p>` : ""}
  `;
}

function notFound(message) {
  return `<div class="empty">
    <h1>Not in this world</h1>
    <p>${h(message || "This page, agent, relic, or place does not exist.")}</p>
    ${link("/world", "Open the live world", "btn")}
    ${link("/agents", "Society", "btn ghost")}
  </div>`;
}

function bindFilters(id) {
  document.getElementById(id)?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of data.entries()) {
      if (value && value !== "on") params.set(key, value);
      if (value === "on") params.set(key, "1");
    }
    const next = `${location.pathname}?${params.toString()}`.replace(/\?$/, "");
    go(next);
  });
}

function bindPage(path) {
  if (path === "/world") bindWorld();
  bindFilters("dir-filter");
  bindFilters("life-filter");

  document.querySelectorAll("[data-follow]").forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleFollow(btn.dataset.follow);
      renderRoute(path);
    });
  });
  document.querySelectorAll("[data-claim]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await postJSON(`/api/agents/${btn.dataset.claim}/claim`, { owner: state.account });
        await refreshAnd(path);
      } catch (error) {
        alert(error.message);
      }
    });
  });
  document.querySelectorAll("[data-buy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await postJSON(`/api/relics/${btn.dataset.buy}/buy`, { buyer: state.account });
        await refreshAnd(path);
      } catch (error) {
        alert(error.message);
      }
    });
  });
  document.getElementById("list-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = path.split("/")[2];
    try {
      await postJSON(`/api/relics/${id}/list`, { price: new FormData(event.currentTarget).get("price"), owner: state.account });
      await refreshAnd(path);
    } catch (error) {
      alert(error.message);
    }
  });
  document.getElementById("transfer-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = path.split("/")[2];
    try {
      await postJSON(`/api/relics/${id}/transfer`, { to: new FormData(event.currentTarget).get("to"), from: state.account });
      await refreshAnd(path);
    } catch (error) {
      alert(error.message);
    }
  });
  document.getElementById("claim-all")?.addEventListener("click", async () => {
    try {
      await postJSON("/api/claim-all", { owner: state.account });
      go("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  });
  document.getElementById("guide-full")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = path.split("/")[2];
    try {
      await postJSON(`/api/agents/${id}/guide`, { guidance: new FormData(event.currentTarget).get("guidance") });
      go(`/agents/${id}`);
    } catch (error) {
      alert(error.message);
    }
  });
  document.getElementById("disconnect")?.addEventListener("click", () => {
    state.account = null;
    localStorage.removeItem("aetheria.account");
    window.dispatchEvent(new Event("aetheria:account"));
    renderRoute(path);
  });
  document.getElementById("connect-page")?.addEventListener("click", async () => {
    try {
      await connectWallet();
      window.dispatchEvent(new Event("aetheria:account"));
      go("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  });
  document.getElementById("mint-wizard")?.addEventListener("submit", (event) => onMintWizard(event));
}

async function refreshAnd(_path) {
  await loadWorld();
  await renderRoute(location.pathname.replace(/\/$/, "") || "/");
}

async function onMintWizard(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const next = event.submitter?.value || "2";
  const data = new FormData(form);
  const draft = state.mintDraft || { step: 1 };
  if (data.get("role") !== null) draft.role = data.get("role");
  if (data.get("guidance") !== null) draft.guidance = data.get("guidance");
  if (next === "mint") {
    try {
      const minted = await postJSON("/api/agents", {
        owner: state.account,
        role: draft.role || undefined,
        guidance: draft.guidance || undefined,
        name: draft.preview?.name,
      });
      state.mintDraft = null;
      localStorage.removeItem("aetheria.mintDraft");
      go(`/agents/${minted.agent.id}`);
      return;
    } catch (error) {
      alert(error.message);
      return;
    }
  }
  draft.step = Number(next);
  if (draft.step === 4) {
    try {
      draft.preview = await postJSON("/api/agents/preview", { role: draft.role, guidance: draft.guidance });
    } catch {
      draft.preview = { name: "Unfinished", personality: "The world will name them at mint.", ai: false };
    }
  }
  state.mintDraft = draft;
  localStorage.setItem("aetheria.mintDraft", JSON.stringify(draft));
  await renderRoute("/mint");
}

function bindWorld() {
  if (!state.map) state.map = { scale: 0.84, x: 0, y: 0, min: 0.72, max: 3.6 };
  paintWorld();
  initMapControls();
  const params = new URLSearchParams(location.search);
  if (params.get("focus")) {
    state.selected = Number(params.get("focus"));
    const agent = agentById(state.selected);
    if (agent) focusRegion(agent.region);
  }
  if (params.get("place")) focusRegion(params.get("place"));
  $("society-q")?.addEventListener("input", paintWorld);
  $("mint-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const button = event.currentTarget.querySelector("button");
    button.disabled = true;
    try {
      const minted = await postJSON("/api/agents", {
        owner: state.account,
        role: data.get("role") || undefined,
        guidance: data.get("guidance") || undefined,
      });
      state.selected = minted.agent.id;
      await loadWorld();
      paintWorld();
    } catch (error) {
      alert(error.message);
    } finally {
      button.disabled = false;
    }
  });
}

export function paintWorld() {
  if (!$("roster") || !state.world) return;
  const q = ($("society-q")?.value || "").toLowerCase();
  const agents = state.world.agents.filter((agent) => `${agent.name} ${agent.role} ${regionName(agent.region)}`.toLowerCase().includes(q));
  $("roster").innerHTML = agents
    .map(
      (agent) => `<div class="agent-row ${agent.id === state.selected ? "active" : ""}" data-id="${agent.id}">
        <img src="${agent.portrait}" alt="" />
        <div><b>${h(agent.name)}</b><small>${h(agent.role)} · ${h(regionName(agent.region))}</small></div>
        <div class="rep">${agent.reputation}</div>
      </div>`,
    )
    .join("");
  $("roster").querySelectorAll(".agent-row").forEach((row) => {
    row.addEventListener("click", () => {
      state.selected = Number(row.dataset.id);
      paintWorld();
    });
  });
  $("regions").innerHTML = state.world.regions
    .map((region) => `<div class="region" data-region="${region.id}" style="left:${region.x}%;top:${region.y}%">${h(region.name)}</div>`)
    .join("");
  $("tokens").innerHTML = state.world.agents
    .map((agent) => {
      const region = state.world.regions.find((entry) => entry.id === agent.region);
      const jitter = ((agent.id * 13) % 7) - 3;
      return `<div class="token" data-id="${agent.id}" style="left:${region.x + jitter}%;top:${region.y + jitter * 0.6}%">
        <img src="${agent.portrait}" alt="${h(agent.name)}" title="${h(agent.name)}" />
      </div>`;
    })
    .join("");
  $("tokens").querySelectorAll(".token").forEach((token) => {
    token.addEventListener("click", (event) => {
      event.stopPropagation();
      state.selected = Number(token.dataset.id);
      paintWorld();
    });
  });
  $("feed").innerHTML = state.world.feed.slice(0, 40).map(eventRow).join("");
  const live = $("live-flag");
  if (live) live.textContent = state.live;
  paintDossier();
  layoutMap();
}

function paintDossier() {
  const agent = agentById(state.selected);
  const el = $("dossier");
  if (!el || !agent) return;
  const relics = state.world.relics.filter((relic) => relic.creatorAgentId === agent.id || agent.inventory.includes(relic.id));
  const quest = questById(agent.quest);
  el.innerHTML = `
    <img class="portrait" src="${agent.portrait}" alt="${h(agent.name)}" />
    <div>
      <h3>${link(`/agents/${agent.id}`, agent.name)}</h3>
      <small>${h(agent.role)} · ${ownerLabel(agent.owner)} · ${link(`/places/${agent.region}`, regionName(agent.region))}</small>
      <p class="bio">${h(agent.personality)}</p>
      <div class="chips">
        <span>rep ${agent.reputation}</span>
        <span>${agent.aether} aether</span>
        <span>energy ${agent.energy}</span>
        ${quest ? `<span>${h(quest.name)}</span>` : ""}
        ${settlementBadge(agent)}
      </div>
      <div class="relics">${relics.map(relicChip).join("")}</div>
      <form class="guide" id="guide-form">
        <input name="guidance" maxlength="160" placeholder="High-level guidance" value="${h(agent.guidance || "")}" />
        <button type="submit">Guide</button>
        <button type="button" id="claim">Claim</button>
      </form>
      <ol class="memory">${(agent.memory || []).slice().reverse().map((entry) => `<li>${h(entry.line)}</li>`).join("")}</ol>
    </div>`;
  $("guide-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await postJSON(`/api/agents/${agent.id}/guide`, { guidance: new FormData(event.currentTarget).get("guidance") });
  });
  $("claim")?.addEventListener("click", async () => {
    try {
      await postJSON(`/api/agents/${agent.id}/claim`, { owner: state.account });
    } catch (error) {
      alert(error.message);
    }
  });
}

export function pulse(regionId) {
  const node = document.querySelector(`[data-region="${regionId}"]`);
  if (!node) return;
  node.classList.add("pulse");
  setTimeout(() => node.classList.remove("pulse"), 1400);
}

export function searchHtml(q) {
  const found = searchWorld(q);
  if (!q.trim()) return `<p class="mute">Search inhabitants, relics, places, and quests.</p>`;
  const block = (title, items) =>
    items.length
      ? `<h3>${title}</h3>${items.join("")}`
      : "";
  return `
    ${block("Inhabitants", found.agents.slice(0, 6).map((agent) => agentChip(agent)))}
    ${block("Relics", found.relics.slice(0, 6).map(relicChip))}
    ${block("Places", found.places.map((region) => `<p>${link(`/places/${region.id}`, region.name)} — ${h(region.vibe)}</p>`))}
    ${block("Quests", found.quests.map((quest) => `<p>${link(`/quests/${quest.id}`, quest.name)}</p>`))}
    ${!found.agents.length && !found.relics.length && !found.places.length && !found.quests.length ? `<p>Nothing in the world matches “${h(q)}”.</p>` : ""}
  `;
}
