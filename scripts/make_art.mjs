// Generates the decorative text SVGs used by README.md (run: node scripts/make_art.mjs).
import { writeFileSync, mkdirSync } from "node:fs";

const OUT = "art";
mkdirSync(OUT, { recursive: true });

const FONT = "'JetBrains Mono','Fira Code',Consolas,'Courier New',monospace";
const CW = 7.8; // approx. glyph width at 13px monospace
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const svg = (w, h, label, body, extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">
  <style>
    text { font-family: ${FONT}; font-size: 13px; }
    .g { fill: #39ff14; } .t { fill: #e6edf3; } .d { fill: #6e7681; } .m { fill: #8b949e; }
    .blink { animation: b 1s steps(1) infinite; } @keyframes b { 50% { opacity: 0; } }
    ${extra}
  </style>
${body}
</svg>
`;
const write = (name, s) => writeFileSync(`${OUT}/${name}.svg`, s);

// 1. section labels: ──── main ────
for (const name of ["main", "also", "tools"]) {
  const w = 320, tw = (name.length + 2) * CW;
  const x1 = (w - tw) / 2 - 10, x2 = (w + tw) / 2 + 10;
  write(`label-${name}`, svg(w, 28, name, `  <defs><linearGradient id="l" x1="0" x2="1"><stop offset="0" stop-color="#39ff14" stop-opacity="0"/><stop offset="1" stop-color="#39ff14" stop-opacity="0.6"/></linearGradient>
  <linearGradient id="r" x1="1" x2="0"><stop offset="0" stop-color="#39ff14" stop-opacity="0"/><stop offset="1" stop-color="#39ff14" stop-opacity="0.6"/></linearGradient></defs>
  <rect x="10" y="13" width="${x1 - 10}" height="1.5" fill="url(#l)"/>
  <rect x="${x2}" y="13" width="${w - 10 - x2}" height="1.5" fill="url(#r)"/>
  <text x="${w / 2}" y="18" text-anchor="middle" class="g">[ ${esc(name)} ]</text>`));
}

// 2. libraries / payments / hosting card
const COLORS = { laravel: "#ff7a59", ".net": "#6aa9ff", data: "#56d4dd", payments: "#ffb454", hosting: "#39ff14", clients: "#b388eb", storage: "#4cc9f0", patterns: "#ff7b72" };
const groups = [
  ["laravel", ["Livewire", "Horizon", "Sanctum", "Passport", "Spatie"]],
  [".net", ["ASP.NET Core", "Blazor", "Quartz.NET", "JWT Bearer", "Swagger", "Radzen", "MudBlazor", "Blazor-ApexCharts"]],
  ["data", ["MSSQL", "EPPlus", "NPOI", "OpenXml"]],
  ["payments", ["Stripe", "PayPal", "Visa", "Mastercard", "ArCa", "Evocabank API", "Custom gateways"]],
  ["hosting", ["FASTPANEL", "ISPmanager", "Nginx"]],
  ["storage", ["Cloudflare", "R2", "MinIO", "S3"]],
  ["clients", ["FileZilla", "WinSCP", "PuTTY", "Termius"]],
  ["patterns", ["Clean Architecture", "Repository Pattern", "Background jobs"]],
];
{
  const W = 760, X0 = 130, MAXX = W - 30, CH = 24, GAP = 8;
  let y = 56, body = "";
  for (const [label, items] of groups) {
    let x = X0, rowY = y;
    const gc = COLORS[label];
    body += `  <text x="28" y="${rowY + 16}" fill="${gc}" font-weight="700">${esc(label)}</text>\n`;
    for (const it of items) {
      const cw = Math.round(it.length * 7.4 + 20);
      if (x + cw > MAXX) { x = X0; rowY += CH + GAP; }
      body += `  <rect x="${x}" y="${rowY}" width="${cw}" height="${CH}" rx="6" fill="${gc}" fill-opacity="0.12" stroke="${gc}" stroke-opacity="0.55" stroke-width="1"/>\n`;
      body += `  <text x="${x + cw / 2}" y="${rowY + 16}" text-anchor="middle" class="t" style="font-size:12px">${esc(it)}</text>\n`;
      x += cw + GAP;
    }
    y = rowY + CH + 16;
  }
  const H = y + 4;
  const frame = `  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d1117"/><stop offset="1" stop-color="#0a1f12"/></linearGradient>
  <clipPath id="f"><rect x="5" y="5" width="${W - 10}" height="${H - 10}" rx="10"/></clipPath></defs>
  <rect x="5" y="5" width="${W - 10}" height="${H - 10}" rx="10" fill="url(#bg)" stroke="#1f3a28" stroke-width="1.5"/>
  <g clip-path="url(#f)">
  <rect x="5" y="5" width="${W - 10}" height="30" fill="#161b22"/>
  <circle cx="24" cy="20" r="5" fill="#ff5f56"/><circle cx="42" cy="20" r="5" fill="#ffbd2e"/><circle cx="60" cy="20" r="5" fill="#27c93f"/>
  <text x="${W / 2}" y="24" text-anchor="middle" class="d" style="font-size:12px">ls --all  #  libraries, payments, hosting</text>
`;
  write("stack-more", svg(W, H, "Libraries, payments, hosting and patterns", frame + body + "  </g>"));
}

// 3. notes (lock icon + text in a dashed card)
const lock = (x, y) => `<g transform="translate(${x} ${y})" fill="none" stroke="#39ff14" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="0" y="7" width="14" height="10" rx="2"/><path d="M3 7V5a4 4 0 0 1 8 0v2"/></g>`;
function note(name, text) {
  const W = Math.round(text.length * CW * 0.92 + 80), H = 44;
  write(name, svg(W, H, text, `  <rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="8" fill="#0d1117" stroke="#1f6b35" stroke-width="1.2" stroke-dasharray="5 4"/>
  ${lock(20, 12)}
  <text x="46" y="26" class="m" style="font-size:12px">${esc(text)}</text>`));
}
note("note-client", "Client work is private, so there are no public repos to link here.");
note("note-private", "Most of my work lives in private repositories, so this profile shows only a small part of it.");

note("note-langs", "Languages are counted per repository (including private ones), not as a measure of skill.");

// 3b. FTP / SSH client tiles (no official icons on skillicons, so drawn in the same tile style)
{
  const tiles = [
    ["FileZilla", "#e34c4c", `<path d="M14 30V18m0 0-5 5m5-5 5 5M34 18v12m0 0-5-5m5 5 5-5" stroke="#e34c4c" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`],
    ["WinSCP", "#4f9dff", `<path d="M10 16h10l3 4h15v14H10z" fill="none" stroke="#4f9dff" stroke-width="2.6" stroke-linejoin="round"/><path d="M19 28h10m0 0-3-3m3 3-3 3" stroke="#4f9dff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`],
    ["PuTTY", "#39ff14", `<rect x="8" y="11" width="32" height="26" rx="4" fill="none" stroke="#39ff14" stroke-width="2.6"/><path d="M14 20l6 5-6 5M24 31h9" stroke="#39ff14" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`],
    ["Termius", "#b388eb", `<rect x="8" y="11" width="32" height="26" rx="6" fill="none" stroke="#b388eb" stroke-width="2.6"/><path d="M17 19h14M24 19v13" stroke="#b388eb" stroke-width="3.2" stroke-linecap="round"/>`],
  ];
  const TW = 48, G = 18, w = tiles.length * TW + (tiles.length - 1) * G + 20, h = 76;
  const body = tiles.map(([name, , glyph], i) => {
    const x = 10 + i * (TW + G);
    return `  <g transform="translate(${x} 4)"><rect width="${TW}" height="${TW}" rx="10" fill="#242938"/>${glyph}</g>\n  <text x="${x + TW / 2}" y="68" text-anchor="middle" class="m" style="font-size:11px">${name}</text>`;
  }).join("\n");
  write("tools-clients", svg(w, h, "FileZilla, WinSCP, PuTTY, Termius", body));
}

// 4. footer
write("footer", svg(560, 56, "end of transmission", `  <defs><linearGradient id="a" x1="0" x2="1"><stop offset="0" stop-color="#39ff14" stop-opacity="0"/><stop offset="0.5" stop-color="#39ff14" stop-opacity="0.7"/><stop offset="1" stop-color="#39ff14" stop-opacity="0"/></linearGradient></defs>
  <rect x="40" y="10" width="480" height="1.5" fill="url(#a)"/>
  <text x="280" y="38" text-anchor="middle" class="g" style="font-size:15px">&gt; end of transmission<tspan class="blink">_</tspan></text>`));

console.log("art/ written");
