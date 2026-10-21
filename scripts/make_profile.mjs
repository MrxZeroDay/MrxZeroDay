// Renders profile.svg / profile.ru.svg: the animated, syntax-coloured `cat z.profile` terminal.
import { writeFileSync } from "node:fs";

const G = "#39ff14", W = "#e6edf3", D = "#6e7681";
const AMBER = "#ffb454", CYAN = "#56d4dd", VIOLET = "#b388eb", BLUE = "#6aa9ff", RED = "#ff7b72";
const KEYC = { name: G, main: "#8892d8", class: BLUE, craft: AMBER, creed: RED, loop: CYAN, now: VIOLET };

const CONTENT = {
  en: {
    suffix: "",
    aria: "Z, MrxZeroDay: full-stack developer, backend by nature, main languages PHP and C#",
    rows: [
      ["name", [["Z", W], ["  //  ", D], ["MrxZeroDay", G]]],
      ["main", [["PHP", "#8892d8"], ["  ·  ", D], ["C#", VIOLET]]],
      ["class", [["full-stack", BLUE], [", ", D], ["backend", G], [" by nature", W]]],
      ["craft", [["payment flows", AMBER], [" · ", D], ["dashboards", CYAN], [" · ", D], ["Excel pipelines", G]]],
      ["creed", [["clean APIs", G], [" over ", D], ["messy frontends", RED]]],
      ["loop", [["learn", CYAN], [" → ", D], ["build", AMBER], [" → ", D], ["ship", G], [" → ", D], ["refactor", VIOLET]]],
      ["now", [["private enterprise projects", W], ["  ", D], ["●", G]]],
    ],
  },
  ru: {
    suffix: ".ru",
    aria: "Z, MrxZeroDay: full-stack разработчик, backend по призванию, основные языки PHP и C#",
    rows: [
      ["name", [["Z", W], ["  //  ", D], ["MrxZeroDay", G]]],
      ["main", [["PHP", "#8892d8"], ["  ·  ", D], ["C#", VIOLET]]],
      ["class", [["full-stack", BLUE], [", ", D], ["backend", G], [" по призванию", W]]],
      ["craft", [["платёжные потоки", AMBER], [" · ", D], ["дашборды", CYAN], [" · ", D], ["Excel-пайплайны", G]]],
      ["creed", [["чистые API", G], [" вместо ", D], ["грязных фронтендов", RED]]],
      ["loop", [["учусь", CYAN], [" → ", D], ["строю", AMBER], [" → ", D], ["выпускаю", G], [" → ", D], ["рефакторю", VIOLET]]],
      ["now", [["частные корпоративные проекты", W], ["  ", D], ["●", G]]],
    ],
  },
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const W_PX = 560, X = 28, KEYW = 8, STEP = 26, TOP = 80;

function render({ suffix, aria, rows }) {
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

  writeFileSync(`assets/core/profile${suffix}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${W_PX}" height="${H}" viewBox="0 0 ${W_PX} ${H}" role="img" aria-label="${esc(aria)}">
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
}

for (const lang of Object.values(CONTENT)) render(lang);
console.log("profile.svg, profile.ru.svg written");
