// Derives *.light.svg variants from the dark SVGs by remapping the palette (run after the dark ones exist).
import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const MAP = {
  "#0d1117": "#ffffff", "#0a1f12": "#e8f6ec", "#161b22": "#eaeef2", "#242938": "#eaeef2",
  "#1f3a28": "#b6d9c0", "#1f6b35": "#9ccbab", "#0b3d1e": "#dafbe1",
  "#e6edf3": "#1f2328", "#c9d1d9": "#24292f", "#8b949e": "#57606a", "#6e7681": "#6e7781",
  "#39ff14": "#1a7f37",
  "#56d4dd": "#0a8fa0", "#ffb454": "#b86e00", "#b388eb": "#7c4dcc", "#8892d8": "#4a56b0",
  "#6aa9ff": "#1f6feb", "#ff7b72": "#cf222e", "#4cc9f0": "#0a8fb5", "#ff7a59": "#d4502a",
  "#e0425f": "#c42b4a", "#f6821f": "#d96a00", "#4f9dff": "#1f6feb", "#7aa116": "#5f8100",
};
const light = (svg) => svg.replace(/#[0-9a-fA-F]{6}\b/g, (c) => MAP[c.toLowerCase()] ?? c);

const dark = ["header", "profile", "build", "focus", "stats", "langs"].map((n) => `${n}.svg`)
  .concat(readdirSync("art").filter((f) => f.endsWith(".svg") && !f.endsWith(".light.svg")).map((f) => `art/${f}`));
for (const f of dark) writeFileSync(f.replace(/\.svg$/, ".light.svg"), light(readFileSync(f, "utf8")));
// the light 3D graph is generated separately with THEME=light; only its frame/text need remapping
writeFileSync("contrib-3d.light.svg", light(readFileSync("contrib-3d.light.svg", "utf8")));
console.log(`light variants written (${dark.length + 1})`);
