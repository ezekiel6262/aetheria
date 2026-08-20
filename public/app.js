const state = {
  world: null,
  selected: 1,
  account: null,
  map: {
    scale: 0.84,
    x: 0,
    y: 0,
    min: 0.72,
    max: 3.6,
    ready: false,
  },
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
  if (!state.world) return;
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
    token.addEventListener("click", (event) => {
      event.stopPropagation();
      state.selected = Number(token.dataset.id);
      renderRoster();
      renderDossier();
    });
  }
  layoutMap();
}

function layoutMap() {
  const wrap = $("map-wrap");
  const scene = $("map-scene");
  const img = $("map-art");
  if (!wrap || !scene || !img || !img.naturalWidth) return;
  const pad = 28;
  const availW = Math.max(120, wrap.clientWidth - pad * 2);
  const availH = Math.max(120, wrap.clientHeight - pad * 2);
  const ratio = img.naturalWidth / img.naturalHeight;
  let width = availW;
  let height = width / ratio;
  if (height > availH) {
    height = availH;
    width = height * ratio;
  }
  scene.style.width = `${width}px`;
  scene.style.height = `${height}px`;
  const scale = state.map.scale;
  const baseX = (wrap.clientWidth - width * scale) / 2;
  const baseY = (wrap.clientHeight - height * scale) / 2;
  clampMapPan(wrap, width, height);
  scene.style.transform = `translate(${baseX + state.map.x}px, ${baseY + state.map.y}px) scale(${scale})`;
  state.map.ready = true;
}

function clampMapPan(wrap, width, height) {
  const scale = state.map.scale;
  const extraX = Math.max(0, (width * scale - wrap.clientWidth) / 2 + 48);
  const extraY = Math.max(0, (height * scale - wrap.clientHeight) / 2 + 48);
  state.map.x = Math.min(extraX, Math.max(-extraX, state.map.x));
  state.map.y = Math.min(extraY, Math.max(-extraY, state.map.y));
}

function setMapScale(next, origin) {
  const wrap = $("map-wrap");
  const scene = $("map-scene");
  if (!wrap || !scene) return;
  const prev = state.map.scale;
  const scale = Math.min(state.map.max, Math.max(state.map.min, next));
  if (origin && scene.offsetWidth) {
    const rect = wrap.getBoundingClientRect();
    const cx = origin.x - rect.left - wrap.clientWidth / 2;
    const cy = origin.y - rect.top - wrap.clientHeight / 2;
    const factor = scale / prev;
    state.map.x = cx - (cx - state.map.x) * factor;
    state.map.y = cy - (cy - state.map.y) * factor;
  }
  state.map.scale = scale;
  if (scale <= 0.86) {
    state.map.x = 0;
    state.map.y = 0;
  }
  layoutMap();
}

function fitWorld() {
  state.map.scale = 0.84;
  state.map.x = 0;
  state.map.y = 0;
  layoutMap();
}

function initMapControls() {
  const wrap = $("map-wrap");
  const img = $("map-art");
  if (!wrap || !img) return;
  img.addEventListener("load", layoutMap);
  if (img.complete) layoutMap();
  window.addEventListener("resize", layoutMap);

  $("zoom-in").addEventListener("click", () => setMapScale(state.map.scale * 1.22));
  $("zoom-out").addEventListener("click", () => setMapScale(state.map.scale / 1.22));
  $("zoom-fit").addEventListener("click", fitWorld);

  wrap.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? 1 / 1.12 : 1.12;
      setMapScale(state.map.scale * delta, { x: event.clientX, y: event.clientY });
    },
    { passive: false },
  );

  let dragging = false;
  let last = { x: 0, y: 0 };
  wrap.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button, .token")) return;
    dragging = true;
    last = { x: event.clientX, y: event.clientY };
    wrap.classList.add("is-panning");
    wrap.setPointerCapture(event.pointerId);
  });
  wrap.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    state.map.x += event.clientX - last.x;
    state.map.y += event.clientY - last.y;
    last = { x: event.clientX, y: event.clientY };
    layoutMap();
  });
  const endPan = () => {
    dragging = false;
    wrap.classList.remove("is-panning");
  };
  wrap.addEventListener("pointerup", endPan);
  wrap.addEventListener("pointercancel", endPan);
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

initMapControls();
loadWorld();
setInterval(loadWorld, 12000);
