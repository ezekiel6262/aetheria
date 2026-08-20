export const TREASURY = "0xAetheR1a00000000000000000000000000000001";

export const XLAYER = {
  chainId: "0x7a0",
  chainName: "X Layer Testnet",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: ["https://testrpc.xlayer.tech/terigon"],
  blockExplorerUrls: ["https://www.okx.com/web3/explorer/xlayer-test"],
};

export const state = {
  world: null,
  health: null,
  selected: 1,
  account: localStorage.getItem("aetheria.account") || null,
  live: "unknown",
  follows: JSON.parse(localStorage.getItem("aetheria.follows") || "[]"),
  query: "",
  mintDraft: JSON.parse(localStorage.getItem("aetheria.mintDraft") || "null"),
  map: { scale: 0.84, x: 0, y: 0, min: 0.72, max: 3.6 },
};

export const $ = (id) => document.getElementById(id);

export async function getJSON(url) {
  const response = await fetch(url);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || response.statusText);
  return body;
}

export async function postJSON(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || response.statusText);
  return body;
}

export async function loadWorld() {
  const [world, health] = await Promise.all([getJSON("/api/world"), getJSON("/api/health").catch(() => null)]);
  state.world = world;
  state.health = health;
  if (!world.agents.some((agent) => agent.id === state.selected)) state.selected = world.agents[0]?.id || 1;
  return world;
}

export function shortAddr(value) {
  if (!value) return "unknown";
  if (value.toLowerCase() === TREASURY.toLowerCase()) return "the world";
  if (value.length < 12) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

export function ownerLabel(value) {
  if (!value) return "the world";
  if (state.account && value.toLowerCase() === state.account.toLowerCase()) return "You";
  return shortAddr(value);
}

export function isMine(owner) {
  return Boolean(state.account && owner && owner.toLowerCase() === state.account.toLowerCase());
}

export function regionName(id) {
  return state.world?.regions.find((region) => region.id === id)?.name || id;
}

export function questById(id) {
  return state.world?.quests.find((quest) => quest.id === id);
}

export function agentById(id) {
  return state.world?.agents.find((agent) => agent.id === Number(id));
}

export function relicById(id) {
  return state.world?.relics.find((relic) => relic.id === Number(id));
}

export function explorerTx(hash) {
  return hash ? `https://www.okx.com/web3/explorer/xlayer-test/tx/${hash}` : null;
}

export function explorerAddress(address) {
  return address ? `https://www.okx.com/web3/explorer/xlayer-test/address/${address}` : null;
}

export function when(ts) {
  if (!ts) return "";
  const delta = Date.now() - ts;
  if (delta < 15_000) return "just now";
  if (delta < 60_000) return `${Math.floor(delta / 1000)}s ago`;
  if (delta < 3_600_000) return `${Math.floor(delta / 60_000)}m ago`;
  if (delta < 86_400_000) return `${Math.floor(delta / 3_600_000)}h ago`;
  return new Date(ts).toLocaleString();
}

export function clock(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function lastEvent(agentId) {
  return state.world?.feed.find((entry) => entry.agentId === agentId);
}

export function kinOf(agentId) {
  const found = new Map();
  for (const event of state.world?.feed || []) {
    if (event.agentId !== agentId && event.targetAgentId !== agentId) continue;
    const other = event.agentId === agentId ? event.targetAgentId : event.agentId;
    if (!other) continue;
    if (!found.has(other)) found.set(other, { id: other, kind: event.kind, at: event.at, region: event.region });
  }
  return [...found.values()].map((row) => ({ ...row, agent: agentById(row.id) })).filter((row) => row.agent);
}

export function eventsFor(filter) {
  return (state.world?.feed || []).filter((event) => {
    if (filter.kind && filter.kind !== "all" && event.kind !== filter.kind) return false;
    if (filter.agentId && event.agentId !== Number(filter.agentId) && event.targetAgentId !== Number(filter.agentId)) return false;
    if (filter.region && event.region !== filter.region) return false;
    if (filter.relicId && event.relicId !== Number(filter.relicId)) return false;
    if (filter.q) {
      const blob = `${event.detail} ${event.actor} ${event.speech || ""}`.toLowerCase();
      if (!blob.includes(filter.q.toLowerCase())) return false;
    }
    return true;
  });
}

export function searchWorld(q) {
  const needle = q.trim().toLowerCase();
  if (!needle || !state.world) return { agents: [], relics: [], places: [], quests: [] };
  return {
    agents: state.world.agents.filter((agent) => `${agent.name} ${agent.role} ${agent.personality}`.toLowerCase().includes(needle)),
    relics: state.world.relics.filter((relic) => `${relic.name} ${relic.kind} ${relic.description}`.toLowerCase().includes(needle)),
    places: state.world.regions.filter((region) => `${region.name} ${region.vibe}`.toLowerCase().includes(needle)),
    quests: state.world.quests.filter((quest) => `${quest.name} ${quest.detail}`.toLowerCase().includes(needle)),
  };
}

export function toggleFollow(id) {
  const num = Number(id);
  if (state.follows.includes(num)) state.follows = state.follows.filter((entry) => entry !== num);
  else state.follows = [...state.follows, num];
  localStorage.setItem("aetheria.follows", JSON.stringify(state.follows));
}

export function isFollowed(id) {
  return state.follows.includes(Number(id));
}

export function setAccount(address) {
  state.account = address || null;
  if (address) localStorage.setItem("aetheria.account", address);
  else localStorage.removeItem("aetheria.account");
}

export async function connectWallet() {
  if (!window.ethereum) throw new Error("No wallet found. You can still watch the world.");
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  setAccount(accounts[0]);
  try {
    await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: XLAYER.chainId }] });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({ method: "wallet_addEthereumChain", params: [XLAYER] });
    } else throw error;
  }
  return state.account;
}

export function applyEvent(payload) {
  if (!state.world || !payload?.event) return;
  state.world.feed.unshift(payload.event);
  state.world.feed = state.world.feed.slice(0, 200);
  if (payload.stats) state.world.stats = { ...state.world.stats, ...payload.stats };
  if (payload.agent) {
    const index = state.world.agents.findIndex((agent) => agent.id === payload.agent.id);
    if (index >= 0) state.world.agents[index] = payload.agent;
    else state.world.agents.push(payload.agent);
    state.world.stats.agents = state.world.agents.length;
  }
  if (payload.relic) {
    const index = state.world.relics.findIndex((relic) => relic.id === payload.relic.id);
    if (index >= 0) state.world.relics[index] = payload.relic;
    else state.world.relics.push(payload.relic);
    state.world.stats.relics = state.world.relics.length;
  }
}

export function startLive(onEvent) {
  const source = new EventSource("/api/stream");
  source.onopen = () => {
    state.live = "live";
  };
  source.onerror = () => {
    state.live = "polling";
  };
  source.onmessage = (message) => {
    try {
      const payload = JSON.parse(message.data);
      applyEvent(payload);
      onEvent?.(payload);
    } catch {}
  };
  return source;
}

export function go(href, replace = false) {
  const url = href.startsWith("http") ? href : href;
  if (url.startsWith("http") && !url.includes(location.host)) {
    window.open(url, "_blank", "noopener");
    return;
  }
  const path = url.replace(location.origin, "");
  if (replace) history.replaceState({}, "", path);
  else history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
