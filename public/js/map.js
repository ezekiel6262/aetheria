import { $, state } from "./core.js";

export function layoutMap() {
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
  const extraX = Math.max(0, (width * scale - wrap.clientWidth) / 2 + 48);
  const extraY = Math.max(0, (height * scale - wrap.clientHeight) / 2 + 48);
  state.map.x = Math.min(extraX, Math.max(-extraX, state.map.x));
  state.map.y = Math.min(extraY, Math.max(-extraY, state.map.y));
  const baseX = (wrap.clientWidth - width * scale) / 2;
  const baseY = (wrap.clientHeight - height * scale) / 2;
  scene.style.transform = `translate(${baseX + state.map.x}px, ${baseY + state.map.y}px) scale(${scale})`;
}

export function setMapScale(next, origin) {
  const wrap = $("map-wrap");
  if (!wrap) return;
  const prev = state.map.scale;
  const scale = Math.min(state.map.max, Math.max(state.map.min, next));
  if (origin) {
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

export function fitWorld() {
  state.map.scale = 0.84;
  state.map.x = 0;
  state.map.y = 0;
  layoutMap();
}

export function focusRegion(regionId) {
  const region = state.world?.regions.find((entry) => entry.id === regionId);
  if (!region) return;
  state.map.scale = 1.8;
  const wrap = $("map-wrap");
  if (!wrap) return;
  state.map.x = (0.5 - region.x / 100) * wrap.clientWidth * 0.7;
  state.map.y = (0.5 - region.y / 100) * wrap.clientHeight * 0.7;
  layoutMap();
}

export function initMapControls() {
  const wrap = $("map-wrap");
  const img = $("map-art");
  if (!wrap || !img || wrap.dataset.ready) return;
  wrap.dataset.ready = "1";
  if (!state.map) {
    state.map = { scale: 0.84, x: 0, y: 0, min: 0.72, max: 3.6 };
  }
  img.addEventListener("load", layoutMap);
  if (img.complete) layoutMap();
  window.addEventListener("resize", layoutMap);
  $("zoom-in")?.addEventListener("click", () => setMapScale(state.map.scale * 1.22));
  $("zoom-out")?.addEventListener("click", () => setMapScale(state.map.scale / 1.22));
  $("zoom-fit")?.addEventListener("click", fitWorld);
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
    if (event.target.closest("button, .token, a")) return;
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
