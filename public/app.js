import { $, connectWallet, go, loadWorld, shortAddr, startLive, state, switchNetwork } from "./js/core.js";
import { paintWorld, pulse, renderRoute, searchHtml } from "./js/pages.js";

function path() {
  return location.pathname.replace(/\/$/, "") || "/";
}

function setActiveNav() {
  const current = path();
  document.querySelectorAll("[data-nav]").forEach((link) => {
    const href = link.getAttribute("href");
    const on = href === "/" ? current === "/" : current === href || current.startsWith(`${href}/`);
    link.classList.toggle("active", on);
  });
  const connect = $("connect");
  if (connect) connect.textContent = state.account ? shortAddr(state.account) : "Connect wallet";
  const pulseEl = $("world-pulse");
  if (pulseEl && state.world) {
    const settled = state.world.agents.filter((agent) => agent.txHash || agent.onchainId).length;
    const chain = state.world.chain?.world ? "X Layer" : "local";
    pulseEl.textContent = `${state.world.stats.agents} living · ${settled} settled · ${chain}`;
  }
  const banner = $("network-banner");
  if (banner) banner.hidden = !state.wrongNetwork;
}

async function render() {
  if (!state.world) await loadWorld();
  setActiveNav();
  await renderRoute(path());
  setActiveNav();
}

function bindChrome() {
  document.body.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-link], a[data-nav]");
    if (!link) return;
    const href = link.getAttribute("href");
    if (!href || href.startsWith("http") || link.target === "_blank") return;
    event.preventDefault();
    go(href);
  });
  $("connect")?.addEventListener("click", async () => {
    if (state.account) {
      go("/dashboard");
      return;
    }
    try {
      await connectWallet();
      setActiveNav();
    } catch (error) {
      alert(error.message);
      go("/connect");
    }
  });
  $("fix-network")?.addEventListener("click", async () => {
    try {
      await switchNetwork();
      setActiveNav();
    } catch (error) {
      alert(error.message);
    }
  });
  $("search-toggle")?.addEventListener("click", () => {
    const panel = $("search-panel");
    panel.hidden = !panel.hidden;
    if (!panel.hidden) $("search-input")?.focus();
  });
  $("search-input")?.addEventListener("input", (event) => {
    $("search-results").innerHTML = searchHtml(event.target.value);
  });
  $("claim-cancel")?.addEventListener("click", () => $("claim-dialog").close());
  $("claim-confirm")?.addEventListener("click", async () => {
    const id = state.claimAgentId;
    $("claim-dialog").close();
    if (!id) return;
    const { postJSON, loadWorld } = await import("./js/core.js");
    try {
      await postJSON(`/api/agents/${id}/claim`, { owner: state.account });
      await loadWorld();
      await render();
    } catch (error) {
      alert(error.message);
    }
  });
  window.addEventListener("popstate", render);
  window.addEventListener("aetheria:account", () => {
    setActiveNav();
    render();
  });
}

async function boot() {
  bindChrome();
  try {
    await loadWorld();
  } catch (error) {
    $("app").innerHTML = `<div class="empty"><h1>The runtime is unreachable</h1><p>${error.message}</p></div>`;
    return;
  }
  startLive((payload) => {
    setActiveNav();
    if (path() === "/world") {
      if (payload?.event?.region) pulse(payload.event.region);
      paintWorld();
    }
  });
  setInterval(async () => {
    try {
      await loadWorld();
      setActiveNav();
      if (path() === "/world") paintWorld();
    } catch {}
  }, 15000);
  await render();
}

boot();
