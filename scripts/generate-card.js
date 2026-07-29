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
        catch (e) { reject(new Error(`Parse error`)); }
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

function getRank(contributions, stars, repos) {
  const score = contributions + stars * 10 + repos * 5;
  if (score >= 3000) return { rank: 'LEGENDARY', color: '#a78bfa', sub: 'Top 1% of developers' };
  if (score >= 1500) return { rank: 'ELITE', color: '#818cf8', sub: 'Top 5% of developers' };
  if (score >= 500) return { rank: 'GOLD', color: '#fbbf24', sub: 'Top 15% of developers' };
  if (score >= 100) return { rank: 'SILVER', color: '#94a3b8', sub: 'Top 30% of developers' };
  return { rank: 'BRONZE', color: '#d97706', sub: 'Rising developer' };
}

function getLevel(contributions, stars, repos) {
  const xp = contributions + stars * 15 + repos * 8;
  return Math.min(100, Math.floor(xp / 50) + 1);
}

function calculateSkills(stats) {
  const { stars, repos, contributions } = stats;
  return [
    { name: 'Java', value: Math.min(95, 65 + Math.floor(repos * 1.2) + Math.floor(stars * 0.8)) },
    { name: 'Spring Boot', value: Math.min(95, 60 + Math.floor(repos * 1.0) + Math.floor(stars * 0.6)) },
    { name: 'Spring Security', value: Math.min(92, 58 + Math.floor(repos * 0.9) + Math.floor(stars * 0.5)) },
    { name: 'System Design', value: Math.min(90, 55 + Math.floor(contributions * 0.05) + Math.floor(stars * 0.4)) },
    { name: 'REST APIs', value: Math.min(93, 62 + Math.floor(repos * 1.1) + Math.floor(stars * 0.5)) },
    { name: 'Databases', value: Math.min(91, 60 + Math.floor(repos * 0.9) + Math.floor(stars * 0.3)) },
    { name: 'DSA', value: Math.min(88, 52 + Math.floor(contributions * 0.06) + Math.floor(stars * 0.7)) }
  ];
}

function generateSVG(data) {
  const { stats, avatarUrl } = data;
  const level = getLevel(stats.contributions, stats.stars, stats.repos);
  const rank = getRank(stats.contributions, stats.stars, stats.repos);
  const skills = calculateSkills(stats);

  const levelProgress = (level % 10) * 10;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 580" width="380" height="580">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#09090b"/>
      <stop offset="50%" stop-color="#111113"/>
      <stop offset="100%" stop-color="#09090b"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
    <linearGradient id="portraitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(9,9,11,0)"/>
      <stop offset="60%" stop-color="rgba(9,9,11,0.7)"/>
      <stop offset="100%" stop-color="#09090b"/>
    </linearGradient>
    <linearGradient id="barBg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.03)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.03)"/>
    </linearGradient>
    <linearGradient id="levelBar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#a78bfa"/>
    </linearGradient>
    <filter id="portraitGlow">
      <feGaussianBlur stdDeviation="20" result="blur"/>
      <feFlood flood-color="#6366f1" flood-opacity="0.3"/>
      <feComposite in2="blur" operator="in"/>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="softGlow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="avatarClip">
      <circle cx="190" cy="175" r="75"/>
    </clipPath>
    <clipPath id="cardClip">
      <rect width="380" height="580" rx="24"/>
    </clipPath>
  </defs>

  <!-- Card Background -->
  <g clip-path="url(#cardClip)">
    <rect width="380" height="580" fill="url(#bg)"/>

    <!-- Subtle grid pattern -->
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.015)" stroke-width="1"/>
    </pattern>
    <rect width="380" height="580" fill="url(#grid)"/>

    <!-- Portrait Area -->
    <clipPath id="portraitArea">
      <rect x="0" y="0" width="380" height="300" rx="24"/>
    </clipPath>
    <g clip-path="url(#portraitArea)">
      <image href="${avatarUrl}" x="115" y="75" width="150" height="150" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice"/>
      <rect x="0" y="0" width="380" height="300" fill="url(#portraitGrad)"/>
    </g>

    <!-- Portrait Glow -->
    <circle cx="190" cy="175" r="78" fill="none" stroke="url(#accentGrad)" stroke-width="1.5" opacity="0.4" filter="url(#portraitGlow)"/>

    <!-- Avatar Border -->
    <circle cx="190" cy="175" r="77" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>

    <!-- Header -->
    <!-- Rank Badge -->
    <g transform="translate(20, 20)">
      <rect width="70" height="24" rx="12" fill="rgba(255,255,255,0.06)" stroke="${rank.color}" stroke-width="0.5"/>
      <text x="35" y="16" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="600" fill="${rank.color}" text-anchor="middle" letter-spacing="1">${rank.rank}</text>
    </g>

    <!-- Country -->
    <g transform="translate(295, 20)">
      <text x="0" y="17" font-family="system-ui, -apple-system, sans-serif" font-size="14">🇮🇳</text>
    </g>

    <!-- GitHub Icon -->
    <g transform="translate(335, 22)">
      <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.06)"/>
      <path d="M10 2C5.58 2 2 5.58 2 10c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0018 10c0-4.42-3.58-8-8-8z" fill="rgba(255,255,255,0.7)" transform="translate(1,1) scale(0.9)"/>
    </g>

    <!-- Name -->
    <text x="190" y="330" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700" fill="white" text-anchor="middle" letter-spacing="0.5">HIMANSHU BAGGA</text>

    <!-- Role -->
    <text x="190" y="352" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="rgba(255,255,255,0.4)" text-anchor="middle" letter-spacing="2">JAVA BACKEND DEVELOPER</text>

    <!-- Subtitle -->
    <text x="190" y="372" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="rgba(255,255,255,0.25)" text-anchor="middle" font-style="italic">Building scalable backend systems.</text>

    <!-- Level Section -->
    <g transform="translate(20, 395)">
      <text x="0" y="12" font-family="system-ui, -apple-system, sans-serif" font-size="9" fill="rgba(255,255,255,0.3)" letter-spacing="2">DEVELOPER LEVEL</text>
      <text x="340" y="12" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="white" text-anchor="end">LEVEL ${level}</text>

      <!-- Level Bar -->
      <rect x="0" y="20" width="340" height="4" rx="2" fill="rgba(255,255,255,0.04)"/>
      <rect x="0" y="20" width="${levelProgress * 3.4}" height="4" rx="2" fill="url(#levelBar)"/>
      <circle cx="${levelProgress * 3.4}" cy="22" r="3" fill="#a78bfa" filter="url(#softGlow)"/>

      <text x="0" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="9" fill="rgba(255,255,255,0.2)">${rank.sub}</text>
    </g>

    <!-- Stats Section -->
    <g transform="translate(20, 448)">
      <line x1="0" y1="0" x2="340" y2="0" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>

      <!-- Stats Grid -->
      <g transform="translate(0, 14)">
        <g>
          <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="#fbbf24">⭐ ${stats.stars}</text>
          <text x="0" y="14" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="rgba(255,255,255,0.3)" letter-spacing="1">STARS</text>
        </g>
        <g transform="translate(85, 0)">
          <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="#818cf8">📦 ${stats.repos}</text>
          <text x="0" y="14" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="rgba(255,255,255,0.3)" letter-spacing="1">REPOS</text>
        </g>
        <g transform="translate(175, 0)">
          <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="#22c55e">📈 ${stats.contributions}</text>
          <text x="0" y="14" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="rgba(255,255,255,0.3)" letter-spacing="1">CONTRIBUTIONS</text>
        </g>
        <g transform="translate(280, 0)">
          <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="#ef4444">🔥 ${stats.streak}</text>
          <text x="0" y="14" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="rgba(255,255,255,0.3)" letter-spacing="1">STREAK</text>
        </g>
      </g>

      <g transform="translate(0, 46)">
        <g>
          <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="#a78bfa">👥 ${stats.followers}</text>
          <text x="0" y="14" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="rgba(255,255,255,0.3)" letter-spacing="1">FOLLOWERS</text>
        </g>
        <g transform="translate(85, 0)">
          <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="#06b6d4">💼 2</text>
          <text x="0" y="14" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="rgba(255,255,255,0.3)" letter-spacing="1">INTERNSHIPS</text>
        </g>
      </g>
    </g>

    <!-- Skills Section -->
    <g transform="translate(20, 520)">
      <line x1="0" y1="-10" x2="340" y2="-10" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>

      ${skills.map((skill, i) => `
      <g transform="translate(0, ${i * 22})">
        <text x="0" y="8" font-family="system-ui, -apple-system, sans-serif" font-size="9" fill="rgba(255,255,255,0.5)" letter-spacing="0.5">${skill.name}</text>
        <rect x="100" y="0" width="200" height="6" rx="3" fill="rgba(255,255,255,0.03)"/>
        <rect x="100" y="0" width="${skill.value * 2}" height="6" rx="3" fill="url(#accentGrad)" opacity="0.7"/>
        <text x="310" y="8" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="600" fill="rgba(255,255,255,0.6)" text-anchor="end">${skill.value}</text>
      </g>
      `).join('')}
    </g>

    <!-- Achievements -->
    <g transform="translate(20, 558)">
      <line x1="0" y1="-8" x2="340" y2="-8" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>

      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="52" height="20" rx="10" fill="rgba(251,191,36,0.08)" stroke="rgba(251,191,36,0.2)" stroke-width="0.5"/>
        <text x="26" y="14" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="rgba(251,191,36,0.8)" text-anchor="middle">Research</text>
      </g>
      <g transform="translate(60, 0)">
        <rect x="0" y="0" width="52" height="20" rx="10" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.2)" stroke-width="0.5"/>
        <text x="26" y="14" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="rgba(99,102,241,0.8)" text-anchor="middle">Microsoft</text>
      </g>
      <g transform="translate(120, 0)">
        <rect x="0" y="0" width="40" height="20" rx="10" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.2)" stroke-width="0.5"/>
        <text x="20" y="14" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="rgba(99,102,241,0.8)" text-anchor="middle">SAP</text>
      </g>
      <g transform="translate(168, 0)">
        <rect x="0" y="0" width="52" height="20" rx="10" fill="rgba(6,182,212,0.08)" stroke="rgba(6,182,212,0.2)" stroke-width="0.5"/>
        <text x="26" y="14" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="rgba(6,182,212,0.8)" text-anchor="middle">Oracle AI</text>
      </g>
      <g transform="translate(228, 0)">
        <rect x="0" y="0" width="52" height="20" rx="10" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>
        <text x="26" y="14" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="rgba(34,197,94,0.8)" text-anchor="middle">Sentinel</text>
      </g>
      <g transform="translate(288, 0)">
        <rect x="0" y="0" width="52" height="20" rx="10" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" stroke-width="0.5"/>
        <text x="26" y="14" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="rgba(34,197,94,0.8)" text-anchor="middle">Judge</text>
      </g>
    </g>

    <!-- Footer -->
    <text x="190" y="575" font-family="system-ui, -apple-system, sans-serif" font-size="7" fill="rgba(255,255,255,0.15)" text-anchor="middle">Auto-generated from GitHub stats • ${new Date().toISOString().split('T')[0]}</text>
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
