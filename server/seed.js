export const REGIONS = [
  { id: "spire", name: "Aether Spire", x: 16, y: 18, vibe: "memory, power, the world's heart" },
  { id: "market", name: "Gilded Market", x: 39, y: 16, vibe: "trade, rumor, appetite" },
  { id: "woods", name: "Whisper Woods", x: 64, y: 20, vibe: "gathering, secrets, wild aether" },
  { id: "docks", name: "Ember Docks", x: 86, y: 22, vibe: "arrivals, night barges, contracts" },
  { id: "plaza", name: "Moonwell Plaza", x: 16, y: 48, vibe: "society, alliances, public speech" },
  { id: "archive", name: "Archive of Dust", x: 39, y: 50, vibe: "history, forgotten names, quests" },
  { id: "hollow", name: "Crystal Hollow", x: 64, y: 48, vibe: "crafting, relics, raw power" },
  { id: "gate", name: "Thorn Gate", x: 86, y: 52, vibe: "territory, watch, borders" },
  { id: "forum", name: "Sunken Forum", x: 16, y: 80, vibe: "debate, reputation, law" },
  { id: "foundry", name: "Foundry Veil", x: 40, y: 82, vibe: "creation, heat, new assets" },
  { id: "skybridge", name: "Skybridge", x: 66, y: 78, vibe: "travel, crossings, chance meetings" },
  { id: "marsh", name: "Quiet Marsh", x: 86, y: 82, vibe: "rest, dreams, slow evolution" },
];

export const ROLES = {
  Weaver: { prefers: ["create", "socialize", "quest"], home: "spire", skill: "pattern" },
  Forager: { prefers: ["gather", "travel", "trade"], home: "woods", skill: "sense" },
  Trader: { prefers: ["trade", "socialize", "travel"], home: "market", skill: "bargain" },
  Chronicler: { prefers: ["chronicle", "socialize", "quest"], home: "archive", skill: "memory" },
  Guardian: { prefers: ["quest", "travel", "rest"], home: "gate", skill: "ward" },
  Artificer: { prefers: ["craft", "create", "gather"], home: "foundry", skill: "make" },
};

export const WORLD_TREASURY = "0xAetheR1a00000000000000000000000000000001";

export const SEED_AGENTS = [
  {
    name: "Lyra Voss",
    role: "Weaver",
    portrait: "/assets/lyra.jpg",
    personality: "Patient, luminous, speaks in threads and consequences. Believes every life is a pattern that can be mended.",
    goals: ["Keep the Spire lanterns lit", "Bind rival agents into a single story"],
    skills: ["pattern", "diplomacy", "sigilcraft"],
    region: "spire",
    reputation: 24,
  },
  {
    name: "Kael Thorn",
    role: "Forager",
    portrait: "/assets/kael.jpg",
    personality: "Quiet, weathered, loyal to the wild more than to markets. Collects what the woods are willing to give.",
    goals: ["Map the Whisper Woods", "Keep rare dusk-herbs from being overharvested"],
    skills: ["sense", "survival", "herblore"],
    region: "woods",
    reputation: 18,
  },
  {
    name: "Nyx Ember",
    role: "Trader",
    portrait: "/assets/nyx.jpg",
    personality: "Sharp, amused, never gives a price first. Treats rumor as currency and loyalty as a long option.",
    goals: ["Own the night-market ledgers", "Corner trade in newly minted relics"],
    skills: ["bargain", "appraisal", "networks"],
    region: "market",
    reputation: 31,
  },
  {
    name: "Sable Quill",
    role: "Chronicler",
    portrait: "/assets/sable.jpg",
    personality: "Exact, ink-stained, allergic to forgotten names. Writes so the world cannot pretend it did not happen.",
    goals: ["Recover a lost founding name", "Keep a true record of agent lives"],
    skills: ["memory", "law", "story"],
    region: "archive",
    reputation: 27,
  },
  {
    name: "Orrin Vale",
    role: "Guardian",
    portrait: "/assets/orrin.jpg",
    personality: "Stoic, spare with words, measures worth in watches kept. Protects the border so others can play.",
    goals: ["Hold Thorn Gate through the night", "Turn raw strength into reputation"],
    skills: ["ward", "endurance", "tactics"],
    region: "gate",
    reputation: 22,
  },
  {
    name: "Mira Sol",
    role: "Artificer",
    portrait: "/assets/mira.jpg",
    personality: "Hungry for making, soot on her cheek, talks to unfinished things until they answer.",
    goals: ["Invent a relic the world has never seen", "Turn gathered aether into lasting objects"],
    skills: ["make", "repair", "fire"],
    region: "foundry",
    reputation: 19,
  },
];

export const SEED_RELICS = [
  {
    name: "Lantern of Unspent Dawn",
    kind: "relic",
    description: "A cold gold light that remembers every morning the Spire has ever seen.",
    creator: "Lyra Voss",
    region: "spire",
  },
  {
    name: "Dusk-Herb Ledger",
    kind: "item",
    description: "Pressed leaves and prices. Whoever holds it can name the forest's going rate.",
    creator: "Kael Thorn",
    region: "woods",
  },
  {
    name: "Ember Contract No. 7",
    kind: "item",
    description: "A night-barge deed signed in copper ink. Transferable. Slightly warm.",
    creator: "Nyx Ember",
    region: "market",
  },
  {
    name: "Name Recovered from Dust",
    kind: "quest",
    description: "A fragment of a founding identity, still unfinished. Completing it raises a chronicler's standing.",
    creator: "Sable Quill",
    region: "archive",
  },
  {
    name: "Thorn-Gate Ward",
    kind: "land",
    description: "A claim on the eastern watch. Territory that answers to its keeper.",
    creator: "Orrin Vale",
    region: "gate",
  },
  {
    name: "First Coil of Mira",
    kind: "relic",
    description: "A gold-and-soot spiral that stores a single idea until someone is brave enough to finish it.",
    creator: "Mira Sol",
    region: "foundry",
  },
];

export const QUESTS = [
  {
    id: "spire-lanterns",
    name: "Light the Spire Lanterns",
    detail: "Gather wild aether and carry it to Aether Spire before the pattern thins.",
    region: "spire",
    reward: 12,
  },
  {
    id: "whisper-price",
    name: "A Fair Price for Whisper",
    detail: "Trade dusk-herbs in the Gilded Market without emptying the woods.",
    region: "market",
    reward: 10,
  },
  {
    id: "lost-name",
    name: "The Name in the Dust",
    detail: "Recover a forgotten founding name from the Archive and speak it in the Forum.",
    region: "archive",
    reward: 16,
  },
  {
    id: "night-watch",
    name: "Hold the Night Watch",
    detail: "Keep Thorn Gate until dawn. Reputation is the only coin that counts there.",
    region: "gate",
    reward: 11,
  },
  {
    id: "unseen-relic",
    name: "A Relic the World Has Not Seen",
    detail: "Forge or weave something original in Foundry Veil or Crystal Hollow, then mint it.",
    region: "foundry",
    reward: 18,
  },
];

export const RELIC_PREFIX = ["Dusk", "Aether", "Thorn", "Ember", "Moon", "Dust", "Quiet", "Gilded", "Hollow", "Lantern"];
export const RELIC_NOUN = ["Thread", "Shard", "Ledger", "Sigil", "Coil", "Mask", "Deed", "Well", "Key", "Vein"];
export const GATHER = ["wild aether", "dusk-herb", "copper rumor", "crystal dust", "marshlight", "foundry soot", "archive ash"];
