// Generates the decorative text SVGs used by README.md and README.ru.md.
// Run: node scripts/make_art.mjs   (writes assets/art/*.svg and assets/art/*.ru.svg)
import { writeFileSync, mkdirSync } from "node:fs";

const OUT = "assets/art";
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

const STRINGS = {
  en: {
    suffix: "",
    labels: { main: "main", also: "also", tools: "tools", favorites: "favorite tools" },
    cloud: "cloud · occasional",
    occasional: "occasional",
    stackTitle: "ls --all  #  libraries, payments, hosting",
    stackAria: "Libraries, payments, hosting and patterns",
    groups: { laravel: "laravel", ".net": ".net", frontend: "frontend", data: "data", payments: "payments", hosting: "hosting", ops: "ops", cloud: "cloud", clients: "clients", patterns: "patterns" },
    items: {},
    notes: {
      client: "Client work is private, so there are no public repos to link here.",
      private: "Most of my work lives in private repositories, so this profile shows only a small part of it.",
      langs: "Languages are counted per repository (including private ones), not as a measure of skill.",
    },
    footer: "end of transmission",
  },
  ru: {
    suffix: ".ru",
    labels: { main: "основное", also: "ещё", tools: "инструменты", favorites: "любимые инструменты" },
    cloud: "облако · иногда",
    occasional: "иногда",
    stackTitle: "ls --all  #  библиотеки, платежи, хостинг",
    stackAria: "Библиотеки, платежи, хостинг и паттерны",
    groups: { laravel: "laravel", ".net": ".net", frontend: "frontend", data: "данные", payments: "платежи", hosting: "хостинг", ops: "ops", cloud: "облако", clients: "клиенты", patterns: "паттерны" },
    items: { "Custom gateways": "Свои шлюзы", "Background jobs": "Фоновые задачи" },
    notes: {
      client: "Работы для клиентов закрытые, поэтому публичных репозиториев для ссылок нет.",
      private: "Большая часть моей работы в приватных репозиториях, поэтому профиль показывает лишь малую её часть.",
      langs: "Языки считаются по репозиториям (включая приватные) и не отражают уровень навыков.",
    },
    footer: "конец передачи",
  },
};

const COLORS = { laravel: "#ff7a59", ".net": "#6aa9ff", frontend: "#ffd866", data: "#56d4dd", payments: "#ffb454", hosting: "#39ff14", ops: "#c3e88d", clients: "#b388eb", cloud: "#4cc9f0", patterns: "#ff7b72" };
const groups = [
  ["laravel", ["Livewire", "Horizon", "Sanctum", "Passport", "Spatie", "Inertia", "Pest", "PHPUnit"]],
  [".net", ["ASP.NET Core", "Entity Framework", "Dapper", "SignalR", "Blazor", "Quartz.NET", "Hangfire", "JWT Bearer", "Swagger", "xUnit", "Radzen", "MudBlazor", "Blazor-ApexCharts"]],
  ["frontend", ["TypeScript", "Vue", "Nuxt", "Tailwind", "Bootstrap", "Vite", "Alpine.js"]],
  ["data", ["MSSQL", "Elasticsearch", "EPPlus", "NPOI", "OpenXml"]],
  ["payments", ["Stripe", "PayPal", "Visa", "Mastercard", "ArCa", "Evocabank API", "Custom gateways"]],
  ["hosting", ["FASTPANEL", "ISPmanager", "Nginx"]],
  ["ops", ["Supervisor", "Sentry", "GitHub Actions"]],
  ["cloud", ["Cloudflare", "R2", "MinIO", "S3"], true],
  ["clients", ["FileZilla", "WinSCP", "PuTTY", "Termius"]],
  ["patterns", ["Clean Architecture", "Repository Pattern", "Background jobs"]],
];

const gradientLabel = (w, text, color) => {
  const tw = (text.length + 4) * CW, x1 = (w - tw) / 2 - 10, x2 = (w + tw) / 2 + 10;
  return `  <defs><linearGradient id="l" x1="0" x2="1"><stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset="1" stop-color="${color}" stop-opacity="0.6"/></linearGradient>
  <linearGradient id="r" x1="1" x2="0"><stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset="1" stop-color="${color}" stop-opacity="0.6"/></linearGradient></defs>
  <rect x="10" y="13" width="${x1 - 10}" height="1.5" fill="url(#l)"/>
  <rect x="${x2}" y="13" width="${w - 10 - x2}" height="1.5" fill="url(#r)"/>
  <text x="${w / 2}" y="18" text-anchor="middle" fill="${color}">[ ${esc(text)} ]</text>`;
};

const lock = (x, y) => `<g transform="translate(${x} ${y})" fill="none" stroke="#39ff14" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="0" y="7" width="14" height="10" rx="2"/><path d="M3 7V5a4 4 0 0 1 8 0v2"/></g>`;

// icon tiles, drawn in the style of skillicons for tools that have no icon there
const TW = 48, TG = 18;
const tileRow = (tiles) => {
  const w = tiles.length * TW + (tiles.length - 1) * TG + 20, h = 76;
  const body = tiles.map(([name, glyph], i) => {
    const x = 10 + i * (TW + TG);
    return `  <g transform="translate(${x} 4)"><rect width="${TW}" height="${TW}" rx="10" fill="#242938"/>${glyph}</g>\n  <text x="${x + TW / 2}" y="68" text-anchor="middle" class="m" style="font-size:11px">${name}</text>`;
  }).join("\n");
  return { w, h, body };
};
const cloudPath = "M14 34a7 7 0 0 1 1-13.9A9 9 0 0 1 32.5 17.5 8 8 0 0 1 34 34z";
const bucket = (c) => `<ellipse cx="24" cy="15" rx="12" ry="4" fill="none" stroke="${c}" stroke-width="2.6"/><path d="M12 15l3 19c0 2 4 4 9 4s9-2 9-4l3-19" fill="none" stroke="${c}" stroke-width="2.6" stroke-linejoin="round"/>`;
const clientTiles = [
  ["FileZilla", `<path d="M14 30V18m0 0-5 5m5-5 5 5M34 18v12m0 0-5-5m5 5 5-5" stroke="#e34c4c" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`],
  ["WinSCP", `<path d="M10 16h10l3 4h15v14H10z" fill="none" stroke="#4f9dff" stroke-width="2.6" stroke-linejoin="round"/><path d="M19 28h10m0 0-3-3m3 3-3 3" stroke="#4f9dff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`],
  ["PuTTY", `<rect x="8" y="11" width="32" height="26" rx="4" fill="none" stroke="#39ff14" stroke-width="2.6"/><path d="M14 20l6 5-6 5M24 31h9" stroke="#39ff14" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`],
  ["Termius", `<rect x="8" y="11" width="32" height="26" rx="6" fill="none" stroke="#b388eb" stroke-width="2.6"/><path d="M17 19h14M24 19v13" stroke="#b388eb" stroke-width="3.2" stroke-linecap="round"/>`],
];
const cloudTiles = [
  ["Cloudflare", `<path d="${cloudPath}" fill="#f6821f" fill-opacity="0.2" stroke="#f6821f" stroke-width="2.8" stroke-linejoin="round"/>`],
  ["R2", `<path d="${cloudPath}" fill="none" stroke="#f6821f" stroke-width="2.6" stroke-linejoin="round"/><text x="24" y="31" text-anchor="middle" fill="#f6821f" style="font-size:12px;font-weight:700">R2</text>`],
  ["MinIO", `<g fill="none" stroke="#e0425f" stroke-width="2.6" stroke-linejoin="round"><rect x="9" y="10" width="30" height="8" rx="2"/><rect x="9" y="20" width="30" height="8" rx="2"/><rect x="9" y="30" width="30" height="8" rx="2"/></g><circle cx="15" cy="14" r="1.6" fill="#e0425f"/><circle cx="15" cy="24" r="1.6" fill="#e0425f"/><circle cx="15" cy="34" r="1.6" fill="#e0425f"/>`],
  ["S3", bucket("#7aa116")],
];

for (const S of Object.values(STRINGS)) {
  const write = (name, s) => writeFileSync(`${OUT}/${name}${S.suffix}.svg`, s);

  // 1. section labels: ──── main ────
  for (const key of ["main", "also", "tools", "favorites"]) {
    write(`label-${key}`, svg(320, 28, S.labels[key], gradientLabel(320, S.labels[key], "#39ff14")));
  }
  write("label-cloud", svg(320, 28, S.cloud, gradientLabel(320, S.cloud, "#4cc9f0")));

  // 2. libraries / payments / hosting card
  {
    const W = 760, X0 = 130, MAXX = W - 30, CH = 24, GAP = 8;
    let y = 56, body = "";
    for (const [key, items, occasional] of groups) {
      let x = X0, rowY = y;
      const gc = COLORS[key];
      body += `  <text x="28" y="${rowY + 16}" fill="${gc}" font-weight="700">${esc(S.groups[key])}</text>\n`;
      if (occasional) body += `  <text x="28" y="${rowY + 31}" fill="${gc}" fill-opacity="0.7" style="font-size:10px;font-style:italic">${esc(S.occasional)}</text>\n`;
      for (const raw of items) {
        const it = S.items[raw] ?? raw;
        const cw = Math.round(it.length * 7.4 + 20);
        if (x + cw > MAXX) { x = X0; rowY += CH + GAP; }
        body += `  <rect x="${x}" y="${rowY}" width="${cw}" height="${CH}" rx="6" fill="${gc}" fill-opacity="0.12" stroke="${gc}" stroke-opacity="0.55" stroke-width="1"/>\n`;
        body += `  <text x="${x + cw / 2}" y="${rowY + 16}" text-anchor="middle" class="t" style="font-size:12px">${esc(it)}</text>\n`;
        x += cw + GAP;
      }
      y = rowY + CH + (occasional ? 24 : 16);
    }
    const H = y + 4;
    const frame = `  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d1117"/><stop offset="1" stop-color="#0a1f12"/></linearGradient>
  <clipPath id="f"><rect x="5" y="5" width="${W - 10}" height="${H - 10}" rx="10"/></clipPath></defs>
  <rect x="5" y="5" width="${W - 10}" height="${H - 10}" rx="10" fill="url(#bg)" stroke="#1f3a28" stroke-width="1.5"/>
  <g clip-path="url(#f)">
  <rect x="5" y="5" width="${W - 10}" height="30" fill="#161b22"/>
  <circle cx="24" cy="20" r="5" fill="#ff5f56"/><circle cx="42" cy="20" r="5" fill="#ffbd2e"/><circle cx="60" cy="20" r="5" fill="#27c93f"/>
  <text x="${W / 2}" y="24" text-anchor="middle" class="d" style="font-size:12px">${esc(S.stackTitle)}</text>
`;
    write("stack-more", svg(W, H, S.stackAria, frame + body + "  </g>"));
  }

  // 3. notes (lock icon + text in a dashed card)
  for (const [name, text] of Object.entries(S.notes)) {
    const W = Math.round(text.length * CW * 0.92 + 80), H = 44;
    write(`note-${name}`, svg(W, H, text, `  <rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="8" fill="#0d1117" stroke="#1f6b35" stroke-width="1.2" stroke-dasharray="5 4"/>
  ${lock(20, 12)}
  <text x="46" y="26" class="m" style="font-size:12px">${esc(text)}</text>`));
  }

  // 4. icon tiles
  for (const [name, tiles, label] of [["tools-clients", clientTiles, "FileZilla, WinSCP, PuTTY, Termius"], ["tools-cloud", cloudTiles, "Cloudflare, R2, MinIO, S3"]]) {
    const { w, h, body } = tileRow(tiles);
    write(name, svg(w, h, label, body));
  }

  // 5. footer
  write("footer", svg(560, 56, S.footer, `  <defs><linearGradient id="a" x1="0" x2="1"><stop offset="0" stop-color="#39ff14" stop-opacity="0"/><stop offset="0.5" stop-color="#39ff14" stop-opacity="0.7"/><stop offset="1" stop-color="#39ff14" stop-opacity="0"/></linearGradient></defs>
  <rect x="40" y="10" width="480" height="1.5" fill="url(#a)"/>
  <text x="280" y="38" text-anchor="middle" class="g" style="font-size:15px">&gt; ${esc(S.footer)}<tspan class="blink">_</tspan></text>`));
}

console.log("assets/art written");
