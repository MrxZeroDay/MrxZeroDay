// Renders profile.svg: the animated, syntax-coloured `cat z.profile` terminal.
import { writeFileSync } from "node:fs";

const G = "#39ff14", W = "#e6edf3", D = "#6e7681";
const KEYC = { name: "#39ff14", main: "#8892d8", class: "#6aa9ff", craft: "#ffb454", creed: "#ff7b72", loop: "#56d4dd", now: "#b388eb" };
const rows = [
  ["name", [["Z", W], ["  //  ", D], ["MrxZeroDay", G]]],
  ["main", [["PHP", "#8892d8"], ["  ·  ", D], ["C#", "#b388eb"]]],
  ["class", [["full-stack", "#6aa9ff"], [", ", D], ["backend", G], [" by nature", W]]],
  ["craft", [["payment flows", "#ffb454"], [" · ", D], ["dashboards", "#56d4dd"], [" · ", D], ["Excel pipelines", G]]],
  ["creed", [["clean APIs", G], [" over ", D], ["messy frontends", "#ff7b72"]]],
  ["loop", [["learn", "#56d4dd"], [" → ", D], ["build", "#ffb454"], [" → ", D], ["ship", G], [" → ", D], ["refactor", "#b388eb"]]],
  ["now", [["private enterprise projects", W], ["  ", D], ["●", G]]],
];
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const W_PX = 560, X = 28, KEYW = 8, STEP = 26, TOP = 80;
const H = TOP + rows.length * STEP + 36;

let defs = "", body = "";
rows.forEach(([key, segs], i) => {
  const y = TOP + i * STEP, begin = (0.4 + i * 0.8).toFixed(1);
  defs += `<clipPath id="c${i}"><rect x="20" y="${y - 16}" width="0" height="22"><animate attributeName="width" from="0" to="520" dur="0.7s" begin="${begin}s" fill="freeze"/></rect></clipPath>`;
  const tspans = segs.map(([t, c]) => `<tspan fill="${c}">${esc(t)}</tspan>`).join("");
  body += `<rect x="14" y="${y - 12}" width="3" height="14" rx="1.5" fill="${KEYC[key]}"/>
    <g clip-path="url(#c${i})"><text x="${X}" y="${y}" xml:space="preserve"><tspan fill="${KEYC[key]}" font-weight="700">${key.padEnd(KEYW)}</tspan>${tspans}</text></g>\n    `;
});
const cursorY = TOP + rows.length * STEP;
const cursorBegin = (0.4 + rows.length * 0.8).toFixed(1);

writeFileSync("profile.svg", `<svg xmlns="http://www.w3.org/2000/svg" width="${W_PX}" height="${H}" viewBox="0 0 ${W_PX} ${H}" role="img" aria-label="Z, MrxZeroDay: full-stack developer, backend by nature, main languages PHP and C#">
  <style>text { font-family: 'JetBrains Mono','Fira Code',Consolas,'Courier New',monospace; font-size: 13px; }</style>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d1117"/><stop offset="1" stop-color="#0a1f12"/></linearGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#39ff14"/><stop offset="0.5" stop-color="#56d4dd"/><stop offset="1" stop-color="#b388eb"/></linearGradient>
    <clipPath id="frame"><rect x="5" y="5" width="${W_PX - 10}" height="${H - 10}" rx="10"/></clipPath>
    ${defs}
  </defs>
  <rect x="5" y="5" width="${W_PX - 10}" height="${H - 10}" rx="10" fill="url(#bg)" stroke="#1f3a28" stroke-width="1.5"/>
  <g clip-path="url(#frame)">
    <rect x="5" y="5" width="${W_PX - 10}" height="30" fill="#161b22"/>
    <rect x="5" y="33" width="${W_PX - 10}" height="2" fill="url(#bar)" opacity="0.8"/>
    <circle cx="24" cy="20" r="5" fill="#ff5f56"/><circle cx="42" cy="20" r="5" fill="#ffbd2e"/><circle cx="60" cy="20" r="5" fill="#27c93f"/>
    <text x="${W_PX / 2}" y="24" text-anchor="middle" fill="${D}" font-size="12">z.profile</text>
    <text x="${X}" y="58"><tspan fill="${G}">$</tspan> <tspan fill="${W}">cat z.profile</tspan></text>
    ${body}<text x="${X}" y="${cursorY}" opacity="0"><tspan fill="${G}">$</tspan> <tspan fill="${G}">_</tspan><animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.01;0.5;0.51;1" dur="1s" begin="${cursorBegin}s" repeatCount="indefinite"/></text>
  </g>
</svg>
`);
console.log("profile.svg written");
