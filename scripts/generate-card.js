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

function getRank(contributions, stars, repos, followers) {
  const score = contributions + stars * 15 + repos * 8 + followers * 5;
  if (score >= 5000) return { rank: 'LEGENDARY', color: '#fbbf24', sub: 'Top 1% of developers' };
  if (score >= 3000) return { rank: 'DIAMOND', color: '#06b6d4', sub: 'Top 2% of developers' };
  if (score >= 1500) return { rank: 'PLATINUM', color: '#94a3b8', sub: 'Top 5% of developers' };
  if (score >= 500) return { rank: 'GOLD', color: '#fbbf24', sub: 'Top 15% of developers' };
  if (score >= 100) return { rank: 'SILVER', color: '#94a3b8', sub: 'Top 30% of developers' };
  return { rank: 'BRONZE', color: '#d97706', sub: 'Rising developer' };
}

function getLevel(contributions, stars, repos, followers) {
  const xp = contributions + stars * 20 + repos * 10 + followers * 8;
  return Math.min(100, Math.floor(xp / 40) + 1);
}

function calculateSkills(stats) {
  const { stars, repos, contributions } = stats;
  return [
    { name: 'Java', value: Math.min(97, 68 + Math.floor(repos * 1.2) + Math.floor(stars * 1.0)) },
    { name: 'Spring Boot', value: Math.min(96, 62 + Math.floor(repos * 1.1) + Math.floor(stars * 0.8)) },
    { name: 'Spring Security', value: Math.min(94, 58 + Math.floor(repos * 0.9) + Math.floor(stars * 0.6)) },
    { name: 'System Design', value: Math.min(92, 55 + Math.floor(contributions * 0.06) + Math.floor(stars * 0.5)) },
    { name: 'REST APIs', value: Math.min(95, 64 + Math.floor(repos * 1.2) + Math.floor(stars * 0.7)) },
    { name: 'Databases', value: Math.min(93, 62 + Math.floor(repos * 1.0) + Math.floor(stars * 0.4)) },
    { name: 'DSA', value: Math.min(90, 52 + Math.floor(contributions * 0.07) + Math.floor(stars * 0.8)) }
  ];
}

function generateSVG(data) {
  const { stats } = data;
  const level = getLevel(stats.contributions, stats.stars, stats.repos, stats.followers);
  const rank = getRank(stats.contributions, stats.stars, stats.repos, stats.followers);
  const skills = calculateSkills(stats);
  const levelProgress = (level % 10) * 10;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 680" width="400" height="680">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#030303"/>
      <stop offset="50%" stop-color="#080808"/>
      <stop offset="100%" stop-color="#030303"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8B6914"/>
      <stop offset="25%" stop-color="#C9A227"/>
      <stop offset="50%" stop-color="#FFD700"/>
      <stop offset="75%" stop-color="#C9A227"/>
      <stop offset="100%" stop-color="#8B6914"/>
    </linearGradient>
    <linearGradient id="goldBar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8B6914"/>
      <stop offset="50%" stop-color="#FFD700"/>
      <stop offset="100%" stop-color="#C9A227"/>
    </linearGradient>
    <clipPath id="cardClip">
      <rect width="400" height="680" rx="20"/>
    </clipPath>
  </defs>

  <g clip-path="url(#cardClip)">
    <rect width="400" height="680" fill="url(#bg)"/>

    <!-- Header -->
    <g transform="translate(24, 24)">
      <rect width="80" height="26" rx="13" fill="rgba(255,215,0,0.06)" stroke="url(#goldGrad)" stroke-width="0.7"/>
      <text x="40" y="17" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="${rank.color}" text-anchor="middle" letter-spacing="1.5">${rank.rank}</text>
    </g>

    <g transform="translate(290, 26)">
      <text x="0" y="16" font-family="system-ui, sans-serif" font-size="14">🇮🇳</text>
      <text x="22" y="16" font-family="system-ui, sans-serif" font-size="10" fill="rgba(255,255,255,0.6)">INDIA</text>
    </g>

    <!-- Name & Role -->
    <text x="200" y="85" font-family="system-ui, sans-serif" font-size="30" font-weight="800" fill="white" text-anchor="middle" letter-spacing="1">HIMANSHU BAGGA</text>
    <text x="200" y="110" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="url(#goldGrad)" text-anchor="middle" letter-spacing="3">JAVA BACKEND DEVELOPER</text>
    <text x="200" y="130" font-family="system-ui, sans-serif" font-size="10" fill="rgba(255,255,255,0.25)" text-anchor="middle" font-style="italic">Building scalable backend systems.</text>

    <!-- Divider -->
    <line x1="30" y1="150" x2="370" y2="150" stroke="rgba(255,215,0,0.08)" stroke-width="0.5"/>

    <!-- Level -->
    <g transform="translate(30, 165)">
      <text x="0" y="10" font-family="system-ui, sans-serif" font-size="9" fill="rgba(255,215,0,0.5)" letter-spacing="2" font-weight="600">DEVELOPER LEVEL</text>
      <text x="340" y="10" font-family="system-ui, sans-serif" font-size="20" font-weight="800" fill="white" text-anchor="end">LEVEL ${level}</text>
      <rect x="0" y="18" width="340" height="4" rx="2" fill="rgba(255,215,0,0.05)"/>
      <rect x="0" y="18" width="${levelProgress * 3.4}" height="4" rx="2" fill="url(#goldBar)"/>
      <text x="0" y="36" font-family="system-ui, sans-serif" font-size="8" fill="rgba(255,255,255,0.2)">${rank.sub}</text>
    </g>

    <!-- Stats -->
    <g transform="translate(30, 225)">
      <line x1="0" y1="0" x2="340" y2="0" stroke="rgba(255,215,0,0.06)" stroke-width="0.5"/>

      <!-- Row 1 -->
      <g transform="translate(0, 12)">
        <rect x="0" y="0" width="105" height="44" rx="10" fill="rgba(255,215,0,0.025)" stroke="rgba(255,215,0,0.06)" stroke-width="0.5"/>
        <text x="52" y="20" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#fbbf24" text-anchor="middle">⭐ ${stats.stars}</text>
        <text x="52" y="36" font-family="system-ui, sans-serif" font-size="7" fill="rgba(255,255,255,0.3)" text-anchor="middle" letter-spacing="1">STARS</text>

        <rect x="115" y="0" width="105" height="44" rx="10" fill="rgba(255,215,0,0.025)" stroke="rgba(255,215,0,0.06)" stroke-width="0.5"/>
        <text x="167" y="20" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#daa520" text-anchor="middle">📦 ${stats.repos}</text>
        <text x="167" y="36" font-family="system-ui, sans-serif" font-size="7" fill="rgba(255,255,255,0.3)" text-anchor="middle" letter-spacing="1">REPOS</text>

        <rect x="230" y="0" width="110" height="44" rx="10" fill="rgba(255,215,0,0.025)" stroke="rgba(255,215,0,0.06)" stroke-width="0.5"/>
        <text x="285" y="20" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#22c55e" text-anchor="middle">📈 500+</text>
        <text x="285" y="36" font-family="system-ui, sans-serif" font-size="7" fill="rgba(255,255,255,0.3)" text-anchor="middle" letter-spacing="1">CONTRIBUTIONS</text>
      </g>

      <!-- Row 2 -->
      <g transform="translate(0, 64)">
        <rect x="0" y="0" width="105" height="44" rx="10" fill="rgba(255,215,0,0.025)" stroke="rgba(255,215,0,0.06)" stroke-width="0.5"/>
        <text x="52" y="20" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#ef4444" text-anchor="middle">🔥 30</text>
        <text x="52" y="36" font-family="system-ui, sans-serif" font-size="7" fill="rgba(255,255,255,0.3)" text-anchor="middle" letter-spacing="1">STREAK</text>

        <rect x="115" y="0" width="105" height="44" rx="10" fill="rgba(255,215,0,0.025)" stroke="rgba(255,215,0,0.06)" stroke-width="0.5"/>
        <text x="167" y="20" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#a78bfa" text-anchor="middle">👥 ${stats.followers}</text>
        <text x="167" y="36" font-family="system-ui, sans-serif" font-size="7" fill="rgba(255,255,255,0.3)" text-anchor="middle" letter-spacing="1">FOLLOWERS</text>

        <rect x="230" y="0" width="110" height="44" rx="10" fill="rgba(255,215,0,0.025)" stroke="rgba(255,215,0,0.06)" stroke-width="0.5"/>
        <text x="285" y="20" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#06b6d4" text-anchor="middle">💼 2</text>
        <text x="285" y="36" font-family="system-ui, sans-serif" font-size="7" fill="rgba(255,255,255,0.3)" text-anchor="middle" letter-spacing="1">INTERNSHIPS</text>
      </g>
    </g>

    <!-- Skills -->
    <g transform="translate(30, 355)">
      <line x1="0" y1="0" x2="340" y2="0" stroke="rgba(255,215,0,0.06)" stroke-width="0.5"/>
      <text x="0" y="18" font-family="system-ui, sans-serif" font-size="9" fill="rgba(255,215,0,0.5)" letter-spacing="2" font-weight="600">CORE EXPERTISE</text>

      ${skills.map((skill, i) => `
      <g transform="translate(0, ${32 + i * 26})">
        <text x="0" y="9" font-family="system-ui, sans-serif" font-size="10" fill="rgba(255,255,255,0.55)">${skill.name}</text>
        <rect x="120" y="0" width="190" height="7" rx="3.5" fill="rgba(255,215,0,0.04)"/>
        <rect x="120" y="0" width="${skill.value * 1.9}" height="7" rx="3.5" fill="url(#goldBar)" opacity="0.7"/>
        <text x="320" y="9" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="rgba(255,215,0,0.65)" text-anchor="end">${skill.value}</text>
      </g>
      `).join('')}
    </g>

    <!-- Achievements -->
    <g transform="translate(30, 565)">
      <line x1="0" y1="0" x2="340" y2="0" stroke="rgba(255,215,0,0.06)" stroke-width="0.5"/>
      <text x="0" y="18" font-family="system-ui, sans-serif" font-size="9" fill="rgba(255,215,0,0.5)" letter-spacing="2" font-weight="600">ACHIEVEMENTS</text>

      <g transform="translate(0, 30)">
        <circle cx="16" cy="16" r="16" fill="rgba(251,191,36,0.05)" stroke="rgba(251,191,36,0.15)" stroke-width="0.5"/>
        <text x="16" y="21" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">🏆</text>
        <text x="40" y="20" font-family="system-ui, sans-serif" font-size="8" fill="rgba(255,215,0,0.6)">Research Paper</text>

        <circle cx="146" cy="16" r="16" fill="rgba(99,102,241,0.05)" stroke="rgba(99,102,241,0.15)" stroke-width="0.5"/>
        <text x="146" y="21" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">🌍</text>
        <text x="170" y="20" font-family="system-ui, sans-serif" font-size="8" fill="rgba(129,140,248,0.6)">Microsoft</text>

        <circle cx="260" cy="16" r="16" fill="rgba(99,102,241,0.05)" stroke="rgba(99,102,241,0.15)" stroke-width="0.5"/>
        <text x="260" y="21" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">🌍</text>
        <text x="284" y="20" font-family="system-ui, sans-serif" font-size="8" fill="rgba(129,140,248,0.6)">SAP</text>
      </g>

      <g transform="translate(0, 62)">
        <circle cx="16" cy="16" r="16" fill="rgba(6,182,212,0.05)" stroke="rgba(6,182,212,0.15)" stroke-width="0.5"/>
        <text x="16" y="21" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">☁️</text>
        <text x="40" y="20" font-family="system-ui, sans-serif" font-size="8" fill="rgba(6,182,212,0.6)">Oracle AI</text>

        <circle cx="146" cy="16" r="16" fill="rgba(34,197,94,0.05)" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>
        <text x="146" y="21" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">💼</text>
        <text x="170" y="20" font-family="system-ui, sans-serif" font-size="8" fill="rgba(34,197,94,0.6)">Sentinel</text>

        <circle cx="260" cy="16" r="16" fill="rgba(34,197,94,0.05)" stroke="rgba(34,197,94,0.15)" stroke-width="0.5"/>
        <text x="260" y="21" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">💼</text>
        <text x="284" y="20" font-family="system-ui, sans-serif" font-size="8" fill="rgba(34,197,94,0.6)">Judge</text>
      </g>
    </g>

    <!-- Footer -->
    <text x="200" y="670" font-family="system-ui, sans-serif" font-size="7" fill="rgba(255,255,255,0.1)" text-anchor="middle">Auto-generated from GitHub stats • ${new Date().toISOString().split('T')[0]}</text>
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
    streak: 30,
    contributions,
    followers
  };

  console.log('Stats:', stats);

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const svg = generateSVG({ stats });
  const outputPath = path.join(OUTPUT_DIR, 'developer-card.svg');
  fs.writeFileSync(outputPath, svg);
  console.log(`Card generated: ${outputPath}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
