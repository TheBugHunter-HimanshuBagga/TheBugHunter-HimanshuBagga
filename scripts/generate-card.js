const https = require('https');
const fs = require('fs');
const path = require('path');

const GITHUB_USER = 'TheBugHunter-HimanshuBagga';
const OUTPUT_DIR = path.join(__dirname, '..', 'assets');

function fetch(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'DeveloperCardGenerator' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Parse error: ${data.substring(0, 200)}`)); }
      });
    });
    req.on('error', reject);
  });
}

async function fetchContributions(username) {
  const query = `
    query {
      user(login: "${username}") {
        contributionsCollection {
          contributionCalendar {
            totalContributions
          }
        }
        repositories(ownerAffiliations: OWNER) {
          nodes { stargazerCount }
        }
        followers { totalCount }
      }
    }
  `;
  try {
    const data = await fetch(`https://api.github.com/graphql?query=${encodeURIComponent(query)}`);
    if (data.data) return data.data.user;
  } catch (e) {}
  return null;
}

function getRank(contributions, stars) {
  const score = contributions + stars * 10;
  if (score >= 5000) return { rank: 'LEGENDARY', color: ['#c084fc', '#7c3aed'], glow: 'rgba(192,132,252,0.6)' };
  if (score >= 2000) return { rank: 'ELITE', color: ['#818cf8', '#6366f1'], glow: 'rgba(129,140,248,0.5)' };
  if (score >= 500) return { rank: 'GOLD', color: ['#fbbf24', '#f59e0b'], glow: 'rgba(251,191,36,0.4)' };
  if (score >= 100) return { rank: 'SILVER', color: ['#94a3b8', '#64748b'], glow: 'rgba(148,163,184,0.3)' };
  return { rank: 'BRONZE', color: ['#d97706', '#b45309'], glow: 'rgba(217,119,6,0.3)' };
}

function calculateOVR(stats) {
  const { stars, repos, contributions, followers } = stats;
  let base = 45;
  base += Math.min(18, repos * 0.8);
  base += Math.min(15, stars * 2);
  base += Math.min(12, contributions * 0.03);
  base += Math.min(10, followers * 0.5);
  return Math.min(99, Math.round(base));
}

function calculateAttributes(stats) {
  const { stars, repos, contributions } = stats;
  return {
    java: Math.min(99, 68 + Math.floor(repos * 1.2) + Math.floor(stars * 0.8)),
    spring: Math.min(99, 65 + Math.floor(repos * 1.0) + Math.floor(stars * 0.6)),
    system: Math.min(99, 60 + Math.floor(contributions * 0.05) + Math.floor(stars * 0.4)),
    rest: Math.min(99, 62 + Math.floor(repos * 1.1) + Math.floor(stars * 0.5)),
    db: Math.min(99, 64 + Math.floor(repos * 0.9) + Math.floor(stars * 0.3)),
    dsa: Math.min(99, 58 + Math.floor(contributions * 0.06) + Math.floor(stars * 0.7))
  };
}

function generateSVG(data) {
  const { stats, avatarUrl } = data;
  const ovr = calculateOVR(stats);
  const rank = getRank(stats.contributions, stats.stars);
  const attr = calculateAttributes(stats);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 500" width="350" height="500">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0e1a"/>
      <stop offset="50%" stop-color="#111827"/>
      <stop offset="100%" stop-color="#0a0e1a"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${rank.color[0]}"/>
      <stop offset="100%" stop-color="${rank.color[1]}"/>
    </linearGradient>
    <linearGradient id="portraitOverlay" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(10,14,26,0)" />
      <stop offset="70%" stop-color="rgba(10,14,26,0.85)"/>
      <stop offset="100%" stop-color="#0a0e1a"/>
    </linearGradient>
    <linearGradient id="medalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(251,191,36,0.2)"/>
      <stop offset="100%" stop-color="rgba(245,158,11,0.05)"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="portraitGlow">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="portraitClip">
      <rect x="0" y="0" width="350" height="210" rx="20"/>
    </clipPath>
    <clipPath id="avatarClip">
      <circle cx="175" cy="100" r="52"/>
    </clipPath>
    <clipPath id="cardClip">
      <rect width="350" height="500" rx="20"/>
    </clipPath>
    <mask id="portraitMask">
      <rect width="350" height="500" fill="white"/>
      <rect x="0" y="0" width="350" height="210" fill="white"/>
    </mask>
  </defs>

  <!-- Card -->
  <g clip-path="url(#cardClip)">
    <rect width="350" height="500" fill="url(#bg)"/>

    <!-- Portrait Area -->
    <g clip-path="url(#portraitClip)">
      <image href="${avatarUrl}" x="-25" y="0" width="400" height="210" preserveAspectRatio="xMidYMid slice"/>
      <rect width="350" height="210" fill="url(#portraitOverlay)"/>
    </g>

    <!-- Portrait Border -->
    <rect x="0.5" y="0.5" width="349" height="209" rx="20" fill="none" stroke="url(#accent)" stroke-width="1" opacity="0.5"/>

    <!-- Rank Badge - Top Right -->
    <g transform="translate(290, 15)">
      <rect width="50" height="22" rx="11" fill="url(#accent)" opacity="0.9"/>
      <text x="25" y="15" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="white" text-anchor="middle">${rank.rank}</text>
    </g>

    <!-- Country Flag -->
    <text x="15" y="25" font-family="Arial, sans-serif" font-size="14">🇮🇳</text>

    <!-- GitHub Icon -->
    <g transform="translate(320, 12)">
      <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.1)"/>
      <text x="10" y="14" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle">G</text>
    </g>

    <!-- Avatar Ring -->
    <circle cx="175" cy="100" r="56" fill="none" stroke="url(#accent)" stroke-width="2" opacity="0.6" filter="url(#portraitGlow)"/>
    <circle cx="175" cy="100" r="54" fill="none" stroke="url(#accent)" stroke-width="1.5"/>

    <!-- Avatar -->
    <image href="${avatarUrl}" x="123" y="48" width="104" height="104" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice"/>

    <!-- OVR Badge -->
    <g transform="translate(15, 55)">
      <rect width="52" height="52" rx="12" fill="#0a0e1a" stroke="url(#accent)" stroke-width="2"/>
      <text x="26" y="32" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle">${ovr}</text>
      <text x="26" y="45" font-family="Arial, sans-serif" font-size="7" fill="rgba(255,255,255,0.6)" text-anchor="middle">OVR</text>
    </g>

    <!-- Name -->
    <text x="175" y="185" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="white" text-anchor="middle" letter-spacing="2">HIMANSHU BAGGA</text>

    <!-- Role -->
    <text x="175" y="205" font-family="Arial, sans-serif" font-size="10" fill="rgba(255,255,255,0.5)" text-anchor="middle" letter-spacing="1">JAVA BACKEND DEVELOPER</text>

    <!-- Stats Section -->
    <g transform="translate(0, 225)">
      <!-- Divider -->
      <line x1="30" y1="0" x2="320" y2="0" stroke="url(#accent)" stroke-width="0.5" opacity="0.3"/>

      <!-- Stats Grid -->
      <g transform="translate(0, 15)">
        <!-- Row 1 -->
        <g>
          <rect x="30" y="0" width="90" height="36" rx="8" fill="rgba(99,102,241,0.06)" stroke="rgba(99,102,241,0.12)" stroke-width="0.5"/>
          <text x="75" y="15" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#fbbf24" text-anchor="middle">⭐ ${stats.stars}</text>
          <text x="75" y="28" font-family="Arial, sans-serif" font-size="7" fill="rgba(255,255,255,0.4)" text-anchor="middle">STARS</text>
        </g>
        <g>
          <rect x="130" y="0" width="90" height="36" rx="8" fill="rgba(99,102,241,0.06)" stroke="rgba(99,102,241,0.12)" stroke-width="0.5"/>
          <text x="175" y="15" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#6366f1" text-anchor="middle">📦 ${stats.repos}</text>
          <text x="175" y="28" font-family="Arial, sans-serif" font-size="7" fill="rgba(255,255,255,0.4)" text-anchor="middle">REPOS</text>
        </g>
        <g>
          <rect x="230" y="0" width="90" height="36" rx="8" fill="rgba(99,102,241,0.06)" stroke="rgba(99,102,241,0.12)" stroke-width="0.5"/>
          <text x="275" y="15" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ef4444" text-anchor="middle">🔥 ${stats.streak}</text>
          <text x="275" y="28" font-family="Arial, sans-serif" font-size="7" fill="rgba(255,255,255,0.4)" text-anchor="middle">STREAK</text>
        </g>
      </g>

      <!-- Row 2 -->
      <g transform="translate(0, 48)">
        <g>
          <rect x="30" y="0" width="90" height="36" rx="8" fill="rgba(99,102,241,0.06)" stroke="rgba(99,102,241,0.12)" stroke-width="0.5"/>
          <text x="75" y="15" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#22c55e" text-anchor="middle">📈 ${stats.contributions}</text>
          <text x="75" y="28" font-family="Arial, sans-serif" font-size="7" fill="rgba(255,255,255,0.4)" text-anchor="middle">CONTRIBUTIONS</text>
        </g>
        <g>
          <rect x="130" y="0" width="90" height="36" rx="8" fill="rgba(99,102,241,0.06)" stroke="rgba(99,102,241,0.12)" stroke-width="0.5"/>
          <text x="175" y="15" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#8b5cf6" text-anchor="middle">👥 ${stats.followers}</text>
          <text x="175" y="28" font-family="Arial, sans-serif" font-size="7" fill="rgba(255,255,255,0.4)" text-anchor="middle">FOLLOWERS</text>
        </g>
        <g>
          <rect x="230" y="0" width="90" height="36" rx="8" fill="rgba(99,102,241,0.06)" stroke="rgba(99,102,241,0.12)" stroke-width="0.5"/>
          <text x="275" y="15" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#06b6d4" text-anchor="middle">💼 2</text>
          <text x="275" y="28" font-family="Arial, sans-serif" font-size="7" fill="rgba(255,255,255,0.4)" text-anchor="middle">INTERNSHIPS</text>
        </g>
      </g>
    </g>

    <!-- Attributes Section -->
    <g transform="translate(0, 340)">
      <line x1="30" y1="0" x2="320" y2="0" stroke="url(#accent)" stroke-width="0.5" opacity="0.3"/>

      <text x="175" y="18" font-family="Arial, sans-serif" font-size="8" fill="rgba(255,255,255,0.4)" text-anchor="middle" letter-spacing="2">SKILLS</text>

      <!-- Attribute Bars -->
      <g transform="translate(30, 28)">
        <!-- Java -->
        <g>
          <text x="0" y="8" font-family="Arial, sans-serif" font-size="9" fill="rgba(255,255,255,0.7)">Java</text>
          <rect x="80" y="0" width="210" height="10" rx="5" fill="rgba(255,255,255,0.05)"/>
          <rect x="80" y="0" width="${attr.java * 2.1}" height="10" rx="5" fill="url(#accent)" opacity="0.8"/>
          <text x="300" y="9" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="${rank.color[0]}" text-anchor="end">${attr.java}</text>
        </g>
        <!-- Spring Boot -->
        <g transform="translate(0, 18)">
          <text x="0" y="8" font-family="Arial, sans-serif" font-size="9" fill="rgba(255,255,255,0.7)">Spring Boot</text>
          <rect x="80" y="0" width="210" height="10" rx="5" fill="rgba(255,255,255,0.05)"/>
          <rect x="80" y="0" width="${attr.spring * 2.1}" height="10" rx="5" fill="url(#accent)" opacity="0.8"/>
          <text x="300" y="9" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="${rank.color[0]}" text-anchor="end">${attr.spring}</text>
        </g>
        <!-- System Design -->
        <g transform="translate(0, 36)">
          <text x="0" y="8" font-family="Arial, sans-serif" font-size="9" fill="rgba(255,255,255,0.7)">System Design</text>
          <rect x="80" y="0" width="210" height="10" rx="5" fill="rgba(255,255,255,0.05)"/>
          <rect x="80" y="0" width="${attr.system * 2.1}" height="10" rx="5" fill="url(#accent)" opacity="0.8"/>
          <text x="300" y="9" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="${rank.color[0]}" text-anchor="end">${attr.system}</text>
        </g>
        <!-- REST APIs -->
        <g transform="translate(0, 54)">
          <text x="0" y="8" font-family="Arial, sans-serif" font-size="9" fill="rgba(255,255,255,0.7)">REST APIs</text>
          <rect x="80" y="0" width="210" height="10" rx="5" fill="rgba(255,255,255,0.05)"/>
          <rect x="80" y="0" width="${attr.rest * 2.1}" height="10" rx="5" fill="url(#accent)" opacity="0.8"/>
          <text x="300" y="9" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="${rank.color[0]}" text-anchor="end">${attr.rest}</text>
        </g>
        <!-- Databases -->
        <g transform="translate(0, 72)">
          <text x="0" y="8" font-family="Arial, sans-serif" font-size="9" fill="rgba(255,255,255,0.7)">Databases</text>
          <rect x="80" y="0" width="210" height="10" rx="5" fill="rgba(255,255,255,0.05)"/>
          <rect x="80" y="0" width="${attr.db * 2.1}" height="10" rx="5" fill="url(#accent)" opacity="0.8"/>
          <text x="300" y="9" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="${rank.color[0]}" text-anchor="end">${attr.db}</text>
        </g>
        <!-- DSA -->
        <g transform="translate(0, 90)">
          <text x="0" y="8" font-family="Arial, sans-serif" font-size="9" fill="rgba(255,255,255,0.7)">DSA</text>
          <rect x="80" y="0" width="210" height="10" rx="5" fill="rgba(255,255,255,0.05)"/>
          <rect x="80" y="0" width="${attr.dsa * 2.1}" height="10" rx="5" fill="url(#accent)" opacity="0.8"/>
          <text x="300" y="9" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="${rank.color[0]}" text-anchor="end">${attr.dsa}</text>
        </g>
      </g>
    </g>

    <!-- Achievements Section -->
    <g transform="translate(0, 460)">
      <line x1="30" y1="-8" x2="320" y2="-8" stroke="url(#accent)" stroke-width="0.5" opacity="0.3"/>

      <!-- Medal Row 1 -->
      <g transform="translate(30, 0)">
        <!-- Research Paper -->
        <g>
          <circle cx="22" cy="11" r="11" fill="url(#medalGrad)" stroke="rgba(251,191,36,0.4)" stroke-width="1"/>
          <text x="22" y="15" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">🏆</text>
          <text x="40" y="14" font-family="Arial, sans-serif" font-size="7" fill="rgba(255,255,255,0.6)">Research</text>
        </g>
        <!-- Microsoft -->
        <g transform="translate(90, 0)">
          <circle cx="22" cy="11" r="11" fill="url(#medalGrad)" stroke="rgba(99,102,241,0.4)" stroke-width="1"/>
          <text x="22" y="15" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">🌍</text>
          <text x="40" y="14" font-family="Arial, sans-serif" font-size="7" fill="rgba(255,255,255,0.6)">Microsoft</text>
        </g>
        <!-- SAP -->
        <g transform="translate(180, 0)">
          <circle cx="22" cy="11" r="11" fill="url(#medalGrad)" stroke="rgba(99,102,241,0.4)" stroke-width="1"/>
          <text x="22" y="15" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">🌍</text>
          <text x="40" y="14" font-family="Arial, sans-serif" font-size="7" fill="rgba(255,255,255,0.6)">SAP</text>
        </g>
      </g>

      <!-- Medal Row 2 -->
      <g transform="translate(30, 28)">
        <!-- OCI -->
        <g>
          <circle cx="22" cy="11" r="11" fill="url(#medalGrad)" stroke="rgba(6,182,212,0.4)" stroke-width="1"/>
          <text x="22" y="15" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">☁️</text>
          <text x="40" y="14" font-family="Arial, sans-serif" font-size="7" fill="rgba(255,255,255,0.6)">Oracle AI</text>
        </g>
        <!-- Judge India -->
        <g transform="translate(90, 0)">
          <circle cx="22" cy="11" r="11" fill="url(#medalGrad)" stroke="rgba(34,197,94,0.4)" stroke-width="1"/>
          <text x="22" y="15" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">💼</text>
          <text x="40" y="14" font-family="Arial, sans-serif" font-size="7" fill="rgba(255,255,255,0.6)">Judge India</text>
        </g>
        <!-- Sentinel Layer -->
        <g transform="translate(180, 0)">
          <circle cx="22" cy="11" r="11" fill="url(#medalGrad)" stroke="rgba(34,197,94,0.4)" stroke-width="1"/>
          <text x="22" y="15" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">💼</text>
          <text x="40" y="14" font-family="Arial, sans-serif" font-size="7" fill="rgba(255,255,255,0.6)">Sentinel Layer</text>
        </g>
      </g>
    </g>

    <!-- Footer -->
    <text x="175" y="493" font-family="Arial, sans-serif" font-size="7" fill="rgba(255,255,255,0.2)" text-anchor="middle">Auto-generated from GitHub • ${new Date().toISOString().split('T')[0]}</text>
  </g>
</svg>`;
}

async function main() {
  console.log('Fetching GitHub data...');

  const user = await fetch(`https://api.github.com/users/${GITHUB_USER}`);
  const repos = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100`);

  let totalStars = 0;
  if (Array.isArray(repos)) {
    totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  }

  let contributions = 0;
  let followers = user.followers || 0;

  try {
    const ghData = await fetchContributions(GITHUB_USER);
    if (ghData) {
      contributions = ghData.contributionsCollection.contributionCalendar.totalContributions;
      followers = ghData.followers.totalCount;
      totalStars = ghData.repositories.nodes.reduce((sum, r) => sum + r.stargazerCount, 0);
    }
  } catch (e) {}

  const stats = {
    stars: totalStars,
    repos: user.public_repos || 0,
    streak: 0,
    contributions,
    followers
  };

  console.log('Stats:', stats);

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const svg = generateSVG({ stats, avatarUrl: user.avatar_url });
  const outputPath = path.join(OUTPUT_DIR, 'developer-card.svg');
  fs.writeFileSync(outputPath, svg);
  console.log(`Card generated: ${outputPath}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
