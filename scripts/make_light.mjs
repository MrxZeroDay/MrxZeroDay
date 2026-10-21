// Derives *.light.svg variants from the dark SVGs by remapping the palette.
// Run after the dark SVGs exist. The 3D graph's light version is generated with THEME=light
// and only gets its frame/text remapped here.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const MAP = {
  "#0d1117": "#ffffff", "#0a1f12": "#e8f6ec", "#161b22": "#eaeef2", "#242938": "#eaeef2",
  "#1f3a28": "#b6d9c0", "#1f6b35": "#9ccbab", "#0b3d1e": "#dafbe1",
  "#e6edf3": "#1f2328", "#c9d1d9": "#24292f", "#8b949e": "#57606a", "#6e7681": "#6e7781",
  "#39ff14": "#1a7f37",
  "#56d4dd": "#0a8fa0", "#ffb454": "#b86e00", "#b388eb": "#7c4dcc", "#8892d8": "#4a56b0",
  "#6aa9ff": "#1f6feb", "#ff7b72": "#cf222e", "#4cc9f0": "#0a8fb5", "#ff7a59": "#d4502a",
  "#e0425f": "#c42b4a", "#f6821f": "#d96a00", "#4f9dff": "#1f6feb", "#7aa116": "#5f8100",
  "#ffd866": "#a67c00", "#c3e88d": "#4d7c0f",
};
const light = (svg) => svg.replace(/#[0-9a-fA-F]{6}\b/g, (c) => MAP[c.toLowerCase()] ?? c);

const all = readdirSync("assets", { recursive: true }).map((f) => `assets/${f}`.split("\\").join("/")).filter((f) => f.endsWith(".svg"));
const isLight = (f) => f.endsWith(".light.svg");
const isGraph = (f) => /contrib-3d/.test(f);
let n = 0;
for (const f of all.filter((f) => !isLight(f) && !isGraph(f))) {
  writeFileSync(f.replace(/\.svg$/, ".light.svg"), light(readFileSync(f, "utf8")));
  n++;
}
for (const f of all.filter((f) => isLight(f) && isGraph(f))) {
  writeFileSync(f, light(readFileSync(f, "utf8")));
  n++;
}
console.log(`light variants written (${n})`);
