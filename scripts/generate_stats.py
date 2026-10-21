"""Render stats.svg: a terminal-style profile card built from real GitHub data."""
import json
import os
import sys
import urllib.request
from html import escape

USER = os.environ.get("USERNAME", "MrxZeroDay")
TOKEN = os.environ["GITHUB_TOKEN"]
OUT = sys.argv[1] if len(sys.argv) > 1 else "stats.svg"

QUERY = """
query($login: String!) {
  user(login: $login) {
    createdAt
    followers { totalCount }
    repositories(ownerAffiliations: OWNER, isFork: false, first: 100) {
      totalCount
      nodes { stargazerCount }
    }
    contributionsCollection {
      totalCommitContributions
      totalIssueContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      contributionCalendar { totalContributions }
    }
  }
}
"""


def fetch():
    req = urllib.request.Request(
        "https://api.github.com/graphql",
        data=json.dumps({"query": QUERY, "variables": {"login": USER}}).encode(),
        headers={"Authorization": f"bearer {TOKEN}", "User-Agent": "profile-stats"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        payload = json.load(resp)
    if "errors" in payload:
        raise SystemExit(payload["errors"])
    return payload["data"]["user"]


def render(u):
    cc = u["contributionsCollection"]
    stars = sum(n["stargazerCount"] for n in u["repositories"]["nodes"])
    since = u["createdAt"][:4]
    cells = [
        ("commits", cc["totalCommitContributions"]),
        ("pull requests", cc["totalPullRequestContributions"]),
        ("issues", cc["totalIssueContributions"]),
        ("reviews", cc["totalPullRequestReviewContributions"]),
        ("repositories", u["repositories"]["totalCount"]),
        ("stars", stars),
    ]
    grid = []
    for i, (label, value) in enumerate(cells):
        x = 300 + (i % 2) * 125
        y = 78 + (i // 2) * 50
        grid.append(
            f'<text x="{x}" y="{y}" class="mono num">{value:,}</text>'
            f'<text x="{x}" y="{y + 16}" class="mono lab">{escape(label)}</text>'
        )
    total = cc["contributionCalendar"]["totalContributions"]
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="560" height="220" viewBox="0 0 560 220" role="img" aria-label="{escape(USER)}: {total:,} contributions in the last year">
  <style>
    .mono {{ font-family: 'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace; }}
    .dim {{ fill: #6e7681; font-size: 12px; }}
    .big {{ fill: #39ff14; font-size: 52px; font-weight: 700; }}
    .cap {{ fill: #8b949e; font-size: 12px; }}
    .num {{ fill: #e6edf3; font-size: 20px; font-weight: 700; }}
    .lab {{ fill: #39ff14; font-size: 11px; opacity: 0.85; }}
    .pulse {{ animation: p 2s ease-in-out infinite; }}
    @keyframes p {{ 50% {{ opacity: 0.35; }} }}
  </style>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d1117"/><stop offset="1" stop-color="#0a1f12"/></linearGradient>
    <clipPath id="f"><rect x="5" y="5" width="550" height="210" rx="10"/></clipPath>
  </defs>
  <rect x="5" y="5" width="550" height="210" rx="10" fill="url(#bg)" stroke="#1f3a28" stroke-width="1.5"/>
  <g clip-path="url(#f)">
    <rect x="5" y="5" width="550" height="30" fill="#161b22"/>
    <circle cx="24" cy="20" r="5" fill="#ff5f56"/><circle cx="42" cy="20" r="5" fill="#ffbd2e"/><circle cx="60" cy="20" r="5" fill="#27c93f"/>
    <text x="280" y="24" text-anchor="middle" class="mono dim">gh stats --year</text>
    <text x="28" y="68" class="mono dim">{escape(USER)} · since {since}</text>
    <text x="28" y="130" class="mono big">{total:,}</text>
    <text x="28" y="154" class="mono cap">contributions</text>
    <text x="28" y="171" class="mono cap">in the last year</text>
    <line x1="270" y1="55" x2="270" y2="190" stroke="#1f3a28"/>
    {"".join(grid)}
    <circle class="pulse" cx="534" cy="196" r="4" fill="#39ff14"/>
    <text x="522" y="200" text-anchor="end" class="mono dim">followers {u["followers"]["totalCount"]:,}</text>
  </g>
</svg>
"""


if __name__ == "__main__":
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(render(fetch()))
