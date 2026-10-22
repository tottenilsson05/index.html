// PIG-specific settings. Kept apart from GUD so the two sites never share branding or keys.
// Fill these in at launch; anything left empty shows as "not live yet" instead of a made-up value.
export const PIG = {
  name: "PIG",
  ticker: "$PIG",
  // Solana mint address of $PIG. Leave "" until the coin exists — Buy.exe will say so.
  CA: "CdCnpS9qUyG19fxTAsvGsyMaZxMS5dNA6J2T4fr5pump",
  // Social links. Empty values are hidden.
  X: "",
  telegram: "",
  // Where launches go (handled by /api/create through PumpPortal on the hosted site).
  launchProvider: "pump.fun",
  // Server namespace for chat + launches on the hosted site (Upstash keys are prefixed with this).
  ns: "pig",
};

// PIG Radio: official Lana Del Rey uploads (LanaDelReyVEVO), played through YouTube's own player on the hosted site.
export const TRACKS = [
  { id: "cE6wxDqdOV0", title: "Video Games", album: "Born To Die" },
  { id: "TdrL3QxjyVw", title: "Summertime Sadness", album: "Born To Die" },
  { id: "Bag1gUxuU0g", title: "Born To Die", album: "Born To Die" },
  { id: "o_1aF54DO60", title: "Young and Beautiful", album: "The Great Gatsby" },
  { id: "JRWox-i6aAk", title: "Blue Jeans", album: "Born To Die" },
  { id: "oKxuiw3iMBE", title: "West Coast", album: "Ultraviolence" },
  { id: "Py_-3di1yx0", title: "Ride", album: "Paradise" },
  { id: "sxDdEPED0h8", title: "National Anthem", album: "Born To Die" },
];

// Station tracks published with the site itself (same origin, so the visualizer reads the real audio).
// Add files you hold the rights to as {src: "audio/file.mp3", title, artist}.
export const STATION = [];

export const pumpUrl = ca => `https://pump.fun/coin/${ca}`;
export const dexUrl = ca => `https://dexscreener.com/solana/${ca}`;
export const solscanUrl = ca => `https://solscan.io/token/${ca}`;
