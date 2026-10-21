// Renders an isometric 3D contribution calendar from real GitHub data.
// Usage: GITHUB_TOKEN=... USERNAME=... node scripts/generate_contrib3d.mjs contrib-3d.svg
import { writeFileSync } from "node:fs";

const USER = process.env.USERNAME || "MrxZeroDay";
const TOKEN = process.env.GITHUB_TOKEN;
const OUT = process.argv[2] || "contrib-3d.svg";

const QUERY = `query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar {
  totalContributions weeks { contributionDays { contributionCount date weekday } } } } } }`;

const res = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: { Authorization: `bearer ${TOKEN}`, "User-Agent": "profile-3d" },
  body: JSON.stringify({ query: QUERY, variables: { login: USER } }),
});
const payload = await res.json();
if (payload.errors) throw new Error(JSON.stringify(payload.errors));
const cal = payload.data.user.contributionsCollection.contributionCalendar;
const weeks = cal.weeks;

// ---- stats from real data
const days = weeks.flatMap((w) => w.contributionDays);
const max = Math.max(1, ...days.map((d) => d.contributionCount));
const best = days.reduce((a, b) => (b.contributionCount > a.contributionCount ? b : a));
let longest = 0, run = 0;
for (const d of days) { run = d.contributionCount > 0 ? run + 1 : 0; longest = Math.max(longest, run); }
let current = 0;
for (let i = days.length - 1; i >= 0; i--) {
  if (days[i].contributionCount > 0) current++;
  else if (i !== days.length - 1) break; // today may still be empty
}
const fmt = (n) => n.toLocaleString("en-US");

// ---- geometry
const A = 13.5, B = 7.8, K = 0.86, HMAX = 100;
const W = 900, CHROME = 34;
const oy = CHROME + HMAX + 36;
const ox = (W - (weeks.length + 6) * A) / 2 + 6 * A;
const H = Math.round(oy + (weeks.length + 6) * B + 96);

const shade = (hex, f) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v * f));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};
const LIGHT = process.env.THEME === "light";
const PALETTE = LIGHT ? ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"] : ["#1b2430", "#0f6b2a", "#17a336", "#2fd94a", "#39ff14"];
const [SHADE_L, SHADE_R] = LIGHT ? [0.86, 0.72] : [0.68, 0.46];
const nonzero = days.map((d) => d.contributionCount).filter((c) => c > 0).sort((a, b) => a - b);
const q = (p) => nonzero[Math.min(nonzero.length - 1, Math.floor(p * nonzero.length))] || 1;
const cuts = [q(0.25), q(0.5), q(0.75)];
const level = (c) => (c === 0 ? 0 : c <= cuts[0] ? 1 : c <= cuts[1] ? 2 : c <= cuts[2] ? 3 : 4);
const pts = (arr) => arr.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

const bars = [];
weeks.forEach((week, w) => {
  week.contributionDays.forEach((day) => {
    const d = day.weekday;
    const c = day.contributionCount;
    const h = c === 0 ? 1.5 : Math.max(5, Math.sqrt(c / max) * HMAX);
    const cx = ox + (w - d) * A, cy = oy + (w + d) * B;
    const t = [cx, cy - B * K], r = [cx + A * K, cy], bo = [cx, cy + B * K], l = [cx - A * K, cy];
    const up = (p) => [p[0], p[1] - h];
    const col = PALETTE[level(c)];
    bars.push({
      order: w + d,
      svg: `<g class="b" style="animation-delay:${(w * 0.025).toFixed(2)}s"><title>${day.date}: ${c}</title>`
        + `<polygon points="${pts([l, bo, up(bo), up(l)])}" fill="${shade(col, SHADE_L)}"/>`
        + `<polygon points="${pts([bo, r, up(r), up(bo)])}" fill="${shade(col, SHADE_R)}"/>`
        + `<polygon points="${pts([up(t), up(r), up(bo), up(l)])}" fill="${col}"/></g>`,
    });
  });
});
bars.sort((x, y) => x.order - y.order);

const first = days[0].date, last = days[days.length - 1].date;
const legendX = W - 30 - (40 + 5 * 18 + 36), legendY = H - 22;
const legend = PALETTE.map((c, i) => `<rect x="${legendX + 40 + i * 18}" y="${legendY - 10}" width="12" height="12" rx="3" fill="${c}"/>`).join("");

const stat = (x, value, label) => `<text x="${x}" y="${H - 52}" class="num">${value}</text><text x="${x}" y="${H - 34}" class="cap">${label}</text>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${USER}: ${fmt(cal.totalContributions)} contributions in the last year">
  <style>
    text { font-family: 'JetBrains Mono','Fira Code',Consolas,'Courier New',monospace; }
    .dim { fill: #6e7681; font-size: 12px; } .big { fill: #39ff14; font-size: 46px; font-weight: 700; }
    .cap { fill: #8b949e; font-size: 11px; } .num { fill: #e6edf3; font-size: 18px; font-weight: 700; }
    .b { animation: rise 0.7s ease-out both; }
    @keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
  </style>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d1117"/><stop offset="1" stop-color="#0a1f12"/></linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.7" r="0.6"><stop offset="0" stop-color="#39ff14" stop-opacity="0.10"/><stop offset="1" stop-color="#39ff14" stop-opacity="0"/></radialGradient>
    <clipPath id="f"><rect x="5" y="5" width="${W - 10}" height="${H - 10}" rx="10"/></clipPath>
  </defs>
  <rect x="5" y="5" width="${W - 10}" height="${H - 10}" rx="10" fill="url(#bg)" stroke="#1f3a28" stroke-width="1.5"/>
  <g clip-path="url(#f)">
    <rect x="5" y="${H * 0.25}" width="${W - 10}" height="${H * 0.75}" fill="url(#glow)"/>
    <rect x="5" y="5" width="${W - 10}" height="30" fill="#161b22"/>
    <circle cx="24" cy="20" r="5" fill="#ff5f56"/><circle cx="42" cy="20" r="5" fill="#ffbd2e"/><circle cx="60" cy="20" r="5" fill="#27c93f"/>
    <text x="${W / 2}" y="24" text-anchor="middle" class="dim">git log --graph --year</text>
    <text x="${W - 30}" y="86" text-anchor="end" class="big">${fmt(cal.totalContributions)}</text>
    <text x="${W - 30}" y="108" text-anchor="end" class="cap">contributions in the last year</text>
    <text x="${W - 30}" y="124" text-anchor="end" class="cap">${first} → ${last}</text>
    ${bars.map((b) => b.svg).join("\n    ")}
    ${stat(28, fmt(best.contributionCount), "best day · " + best.date)}
    ${stat(250, longest + " days", "longest streak")}
    ${stat(400, current + " days", "current streak")}
    <text x="${legendX}" y="${legendY}" class="cap">less</text>${legend}<text x="${legendX + 40 + 5 * 18 + 6}" y="${legendY}" class="cap">more</text>
  </g>
</svg>
`;
writeFileSync(OUT, svg);
console.log(`wrote ${OUT}: ${bars.length} bars, ${fmt(cal.totalContributions)} contributions`);
