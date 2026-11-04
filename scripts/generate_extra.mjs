// Renders extra terminal-style cards from real GitHub data:
// weekdays.svg, timeline.svg, badges.svg, recent.svg, now.svg
// Usage: GITHUB_TOKEN=... USERNAME=... node scripts/generate_extra.mjs assets/data
import { readFileSync, writeFileSync } from "node:fs";

const USER = process.env.USERNAME || "MrxZeroDay";
const TOKEN = process.env.GITHUB_TOKEN;
const DIR = process.argv[2] || "assets/data";
const H = { Authorization: `bearer ${TOKEN}`, "User-Agent": "profile-extra" };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
const fmt = (n) => Number(n).toLocaleString("en-US");

async function gql(query, variables = {}) {
  const res = await fetch("https://api.github.com/graphql", { method: "POST", headers: H, body: JSON.stringify({ query, variables }) });
  const p = await res.json();
  if (p.errors) throw new Error(JSON.stringify(p.errors));
  return p.data;
}

// shared terminal window frame
function card(title, height, body, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="${height}" viewBox="0 0 560 ${height}" role="img" aria-label="${esc(label)}">
  <style>
    .mono { font-family: 'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace; }
    .dim { fill: #6e7681; font-size: 11px; }
    .txt { fill: #e6edf3; font-size: 13px; }
    .cap { fill: #8b949e; font-size: 12px; }
    .acc { fill: #39ff14; font-size: 12px; }
    .num { fill: #e6edf3; font-size: 12px; font-weight: 700; }
  </style>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d1117"/><stop offset="1" stop-color="#0a1f12"/></linearGradient>
    <clipPath id="f"><rect x="5" y="5" width="550" height="${height - 10}" rx="10"/></clipPath>
  </defs>
  <rect x="5" y="5" width="550" height="${height - 10}" rx="10" fill="url(#bg)" stroke="#1f3a28" stroke-width="1.5"/>
  <g clip-path="url(#f)">
    <rect x="5" y="5" width="550" height="30" fill="#161b22"/>
    <circle cx="24" cy="20" r="5" fill="#ff5f56"/><circle cx="42" cy="20" r="5" fill="#ffbd2e"/><circle cx="60" cy="20" r="5" fill="#27c93f"/>
    <text x="280" y="24" text-anchor="middle" class="mono dim">${esc(title)}</text>
    ${body}
  </g>
</svg>
`;
}
const out = (name, svg) => writeFileSync(`${DIR}/${name}.svg`, svg);

const user = (await gql(`query($login: String!) { user(login: $login) {
  createdAt
  repositories(ownerAffiliations: OWNER, isFork: false, first: 100) { totalCount nodes { createdAt stargazerCount } }
  merged: pullRequests(states: MERGED) { totalCount }
  contributionsCollection { contributionYears contributionCalendar { totalContributions weeks { contributionDays { date weekday contributionCount } } } }
} }`, { login: USER })).user;
const days = user.contributionsCollection.contributionCalendar.weeks.flatMap((w) => w.contributionDays);

// ---- weekdays: contributions by day of week (last year)
{
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const sums = Array(7).fill(0);
  for (const d of days) sums[d.weekday] += d.contributionCount;
  const order = [1, 2, 3, 4, 5, 6, 0];
  const max = Math.max(1, ...sums);
  const top = order.reduce((a, b) => (sums[b] > sums[a] ? b : a));
  const rows = order.map((w, i) => {
    const y = 52 + i * 24;
    const width = Math.max(4, Math.round((300 * sums[w]) / max));
    return `<text x="28" y="${y + 11}" class="mono cap">${names[w]}</text>
    <rect x="75" y="${y}" width="300" height="14" rx="4" fill="#161b22"/>
    <rect x="75" y="${y}" width="${width}" height="14" rx="4" fill="${w === top ? "#39ff14" : "#1f6b35"}"/>
    <text x="390" y="${y + 11}" class="mono num">${fmt(sums[w])}</text>`;
  });
  out("weekdays", card("activity --by-weekday", 232, rows.join("\n    "), "Contributions by day of the week in the last year"));
}

// ---- timeline: contributions and new repositories per year
{
  const years = user.contributionsCollection.contributionYears.slice(0, 7).reverse();
  const q = years.map((y) => `y${y}: contributionsCollection(from: "${y}-01-01T00:00:00Z", to: "${y}-12-31T23:59:59Z") { contributionCalendar { totalContributions } }`).join("\n");
  const data = (await gql(`query($login: String!) { user(login: $login) { ${q} } }`, { login: USER })).user;
  const totals = years.map((y) => data[`y${y}`].contributionCalendar.totalContributions);
  const repos = years.map((y) => user.repositories.nodes.filter((r) => r.createdAt.startsWith(String(y))).length);
  const max = Math.max(1, ...totals);
  const step = 500 / Math.max(1, years.length);
  const cols = years.map((y, i) => {
    const cx = 40 + step * i + step / 2;
    const h = Math.max(3, Math.round((80 * totals[i]) / max));
    const joined = String(y) === user.createdAt.slice(0, 4);
    return `<rect x="${cx - 14}" y="${150 - h}" width="28" height="${h}" rx="4" fill="${i === years.length - 1 ? "#39ff14" : "#1f6b35"}"/>
    <text x="${cx}" y="${144 - h}" text-anchor="middle" class="mono num">${fmt(totals[i])}</text>
    <circle cx="${cx}" cy="168" r="4" fill="${joined ? "#39ff14" : "#6e7681"}"/>
    <text x="${cx}" y="190" text-anchor="middle" class="mono txt">${y}</text>
    <text x="${cx}" y="206" text-anchor="middle" class="mono dim">${repos[i]} repos</text>`;
  });
  out("timeline", card("git log --by-year", 226, `<line x1="40" y1="168" x2="520" y2="168" stroke="#1f3a28"/>\n    ${cols.join("\n    ")}`, "Contributions and new repositories per year"));
}

// ---- badges: unlocked by real numbers
{
  let run = 0, streakMax = 0;
  for (const d of days) { run = d.contributionCount ? run + 1 : 0; streakMax = Math.max(streakMax, run); }
  const total = user.contributionsCollection.contributionCalendar.totalContributions;
  const stars = user.repositories.nodes.reduce((a, n) => a + n.stargazerCount, 0);
  const age = new Date().getFullYear() - Number(user.createdAt.slice(0, 4));
  const list = [
    ["Veteran", "5+ years", age >= 5],
    ["On fire", "7-day streak", streakMax >= 7],
    ["Marathon", "30-day streak", streakMax >= 30],
    ["Busy bee", "500+ / year", total >= 500],
    ["Maker", "10+ repos", user.repositories.totalCount >= 10],
    ["Shark", "merged PR", user.merged.totalCount >= 1],
    ["Starred", "first star", stars >= 1],
    ["Centurion", "1000+ / year", total >= 1000],
  ];
  const cells = list.map(([name, desc, ok], i) => {
    const x = 24 + (i % 4) * 132, y = 50 + Math.floor(i / 4) * 70;
    return `<g opacity="${ok ? 1 : 0.35}"><rect x="${x}" y="${y}" width="120" height="58" rx="8" fill="#161b22" stroke="${ok ? "#39ff14" : "#1f3a28"}"/>
    <text x="${x + 10}" y="${y + 24}" class="mono txt">${ok ? "✔" : "·"} ${esc(name)}</text>
    <text x="${x + 10}" y="${y + 43}" class="mono dim">${esc(desc)}</text></g>`;
  });
  out("badges", card("achievements --unlocked", 198, cells.join("\n    "), "Achievements unlocked from GitHub activity"));
}

// ---- recent: last pushed public repositories
{
  const r = (await gql(`query($login: String!) { user(login: $login) {
    repositories(privacy: PUBLIC, ownerAffiliations: OWNER, isFork: false, first: 5, orderBy: {field: PUSHED_AT, direction: DESC}) {
      nodes { name description pushedAt primaryLanguage { name color } } } } }`, { login: USER })).user.repositories.nodes;
  const rows = r.map((n, i) => {
    const y = 60 + i * 38;
    return `<circle cx="32" cy="${y - 4}" r="5" fill="${esc(n.primaryLanguage?.color || "#39ff14")}"/>
    <text x="46" y="${y}" class="mono txt">${esc(trunc(n.name, 30))}</text>
    <text x="46" y="${y + 15}" class="mono dim">${esc(trunc(n.description || n.primaryLanguage?.name || "", 52))}</text>
    <text x="530" y="${y}" text-anchor="end" class="mono cap">${(n.pushedAt || "").slice(0, 10)}</text>`;
  });
  const h = 56 + Math.max(1, r.length) * 38 + 8;
  out("recent", card("git log --repos --recent", h, rows.join("\n    ") || `<text x="28" y="62" class="mono cap">no public repositories yet</text>`, "Recently updated public repositories"));
}

// ---- now: edited by hand in data/now.json
{
  const now = JSON.parse(readFileSync("data/now.json", "utf8"));
  const keys = Object.keys(now).filter((k) => now[k]);
  const rows = keys.map((k, i) => {
    const y = 62 + i * 28;
    return `<text x="28" y="${y}" class="mono acc">${esc(k)}</text><text x="140" y="${y}" class="mono txt">${esc(trunc(String(now[k]), 52))}</text>`;
  });
  out("now", card("now.json", 62 + keys.length * 28 + 4, rows.join("\n    "), "What I am doing right now"));
}

console.log("extra cards written");
