const state = {
  world: null,
  selected: 1,
  account: null,
};

const XLAYER = {
  chainId: "0x7a0",
  chainName: "X Layer Testnet",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: ["https://testrpc.xlayer.tech/terigon"],
  blockExplorerUrls: ["https://www.okx.com/web3/explorer/xlayer-test"],
};

const $ = (id) => document.getElementById(id);

function shortAddr(value) {
  if (!value) return "world";
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

function explorerTx(hash) {
  return hash ? `https://www.okx.com/web3/explorer/xlayer-test/tx/${hash}` : null;
}

async function loadWorld() {
  const world = await (await fetch("/api/world")).json();
  state.world = world;
  renderAll();
}

function renderAll() {
  const world = state.world;
  if (!world) return;
  $("agent-count").textContent = `${world.agents.length} living`;
  $("stats").innerHTML = [
    ["Agents", world.stats.agents],
    ["Relics", world.stats.relics],
    ["Actions", world.stats.actions],
    ["Reputation", world.stats.reputation],
    ["Aether", world.stats.aether],
  ]
    .map(([label, value]) => `<div class="stat"><b>${value}</b><span>${label}</span></div>`)
    .join("");
  const chain = world.chain?.world
    ? `X Layer · ${shortAddr(world.chain.world)}`
    : "local settlement · deploy to go onchain";
  $("chain-pill").textContent = chain;
  renderRoster();
  renderMap();
  renderFeed();
  renderDossier();
}

function renderRoster() {
  $("roster").innerHTML = state.world.agents
    .map(
      (agent) => `
      <div class="agent-row ${agent.id === state.selected ? "active" : ""}" data-id="${agent.id}">
        <img src="${agent.portrait}" alt="${agent.name}" />
        <div>
          <b>${agent.name}</b>
          <small>${agent.role} · ${regionName(agent.region)}</small>
        </div>
        <div class="rep">${agent.reputation}</div>
      </div>`,
    )
    .join("");
  for (const row of $("roster").querySelectorAll(".agent-row")) {
    row.addEventListener("click", () => {
      state.selected = Number(row.dataset.id);
      renderRoster();
      renderDossier();
    });
  }
}

function regionName(id) {
  return state.world.regions.find((region) => region.id === id)?.name || id;
}

function renderMap() {
  $("regions").innerHTML = state.world.regions
    .map((region) => `<div class="region" data-region="${region.id}" style="left:${region.x}%;top:${region.y}%">${region.name}</div>`)
    .join("");
  $("tokens").innerHTML = state.world.agents
    .map((agent) => {
      const region = state.world.regions.find((entry) => entry.id === agent.region);
      const jitter = ((agent.id * 13) % 7) - 3;
      return `<div class="token" data-id="${agent.id}" style="left:${region.x + jitter}%;top:${region.y + jitter * 0.6}%">
        <img src="${agent.portrait}" alt="${agent.name}" title="${agent.name}" />
      </div>`;
    })
    .join("");
  for (const token of $("tokens").querySelectorAll(".token")) {
    token.addEventListener("click", () => {
      state.selected = Number(token.dataset.id);
      renderRoster();
      renderDossier();
    });
  }
}

function renderFeed() {
  $("feed").innerHTML = state.world.feed
    .map((entry) => {
      const link = explorerTx(entry.txHash);
      const time = new Date(entry.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      return `<li class="${entry.kind}">
        <div class="meta">${time} · <span class="kind">${entry.kind}</span>${entry.ai ? " · AI" : ""}</div>
        <div>${entry.detail}</div>
        ${entry.speech ? `<em>“${entry.speech}”</em>` : ""}
        ${link ? `<a href="${link}" target="_blank" rel="noreferrer">tx</a>` : ""}
      </li>`;
    })
    .join("");
}

function renderDossier() {
  const agent = state.world.agents.find((entry) => entry.id === state.selected);
  if (!agent) return;
  const relics = state.world.relics.filter((relic) => relic.creatorAgentId === agent.id || agent.inventory.includes(relic.id));
  const quest = state.world.quests.find((entry) => entry.id === agent.quest);
  $("dossier").innerHTML = `
    <img class="portrait" src="${agent.portrait}" alt="${agent.name}" />
    <div>
      <div class="who">
        <div>
          <h3>${agent.name}</h3>
          <small>${agent.role} · owned by ${shortAddr(agent.owner)} · ${regionName(agent.region)}</small>
        </div>
      </div>
      <p class="bio">${agent.personality}</p>
      <div class="chips">
        <span>rep ${agent.reputation}</span>
        <span>${agent.aether} aether</span>
        <span>energy ${agent.energy}</span>
        ${quest ? `<span>quest: ${quest.name}</span>` : ""}
      </div>
      <div class="relics">
        ${relics
          .map(
            (relic) => `<div class="relic"><b>${relic.name}</b><small>${relic.kind} · ${relic.description}</small></div>`,
          )
          .join("")}
      </div>
      <form class="guide" id="guide-form">
        <input name="guidance" maxlength="160" placeholder="High-level guidance" value="${agent.guidance || ""}" />
        <button type="submit">Guide</button>
        <button type="button" id="claim">Claim</button>
      </form>
      <ol class="memory">
        ${agent.memory
          .slice()
          .reverse()
          .map((entry) => `<li>${entry.line}</li>`)
          .join("")}
      </ol>
    </div>
  `;
  $("guide-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const guidance = new FormData(event.currentTarget).get("guidance");
    await fetch(`/api/agents/${agent.id}/guide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guidance }),
    });
  });
  $("claim").addEventListener("click", async () => {
    await fetch(`/api/agents/${agent.id}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner: state.account }),
    });
  });
}

function pulse(regionId) {
  const node = document.querySelector(`[data-region="${regionId}"]`);
  if (!node) return;
  node.classList.add("pulse");
  setTimeout(() => node.classList.remove("pulse"), 1400);
}

function applyEvent(payload) {
  if (!state.world || !payload?.event) return;
  state.world.feed.unshift(payload.event);
  state.world.feed = state.world.feed.slice(0, 80);
  if (payload.stats) state.world.stats = { ...state.world.stats, ...payload.stats };
  if (payload.agent) {
    const index = state.world.agents.findIndex((agent) => agent.id === payload.agent.id);
    if (index >= 0) state.world.agents[index] = payload.agent;
    else state.world.agents.push(payload.agent);
  }
  if (payload.relic) {
    const index = state.world.relics.findIndex((relic) => relic.id === payload.relic.id);
    if (index >= 0) state.world.relics[index] = payload.relic;
    else state.world.relics.push(payload.relic);
    state.world.stats.relics = state.world.relics.length;
  }
  if (payload.event.region) pulse(payload.event.region);
  renderAll();
}

async function connectWallet() {
  if (!window.ethereum) {
    alert("No wallet found. You can still watch the world live.");
    return;
  }
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  state.account = accounts[0];
  $("connect").textContent = shortAddr(state.account);
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: XLAYER.chainId }],
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({ method: "wallet_addEthereumChain", params: [XLAYER] });
    }
  }
}

$("connect").addEventListener("click", () => connectWallet().catch(console.error));

$("mint-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const button = event.currentTarget.querySelector("button");
  button.disabled = true;
  button.textContent = "Waking…";
  try {
    const result = await (
      await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: state.account,
          role: data.get("role") || undefined,
          guidance: data.get("guidance") || undefined,
        }),
      })
    ).json();
    if (result.agent) state.selected = result.agent.id;
  } finally {
    button.disabled = false;
    button.textContent = "Mint on the world";
  }
});

const source = new EventSource("/api/stream");
source.onmessage = (message) => {
  try {
    applyEvent(JSON.parse(message.data));
  } catch {}
};

loadWorld();
setInterval(loadWorld, 12000);
