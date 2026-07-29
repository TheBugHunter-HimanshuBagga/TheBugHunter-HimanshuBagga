const https = require('https');
const fs = require('fs');
const path = require('path');

const GITHUB_USER = 'TheBugHunter-HimanshuBagga';
const OUTPUT_DIR = path.join(__dirname, '..', 'assets');
const PROFILE_IMAGE = path.join(OUTPUT_DIR, 'image.png');

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
  if (score >= 5000) return { rank: 'LEGENDARY', color: '#fbbf24', glow: 'rgba(251,191,36,0.4)', sub: 'Top 1% of developers' };
  if (score >= 3000) return { rank: 'DIAMOND', color: '#06b6d4', glow: 'rgba(6,182,212,0.4)', sub: 'Top 2% of developers' };
  if (score >= 1500) return { rank: 'PLATINUM', color: '#94a3b8', glow: 'rgba(148,163,184,0.4)', sub: 'Top 5% of developers' };
  if (score >= 500) return { rank: 'GOLD', color: '#fbbf24', glow: 'rgba(251,191,36,0.3)', sub: 'Top 15% of developers' };
  if (score >= 100) return { rank: 'SILVER', color: '#94a3b8', glow: 'rgba(148,163,184,0.3)', sub: 'Top 30% of developers' };
  return { rank: 'BRONZE', color: '#d97706', glow: 'rgba(217,119,6,0.3)', sub: 'Rising developer' };
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
  const { stats, avatarUrl, profileBase64 } = data;
  const level = getLevel(stats.contributions, stats.stars, stats.repos, stats.followers);
  const rank = getRank(stats.contributions, stats.stars, stats.repos, stats.followers);
  const skills = calculateSkills(stats);
  const levelProgress = (level % 10) * 10;

  // Use base64 profile if available, otherwise use GitHub avatar
  const profileSrc = profileBase64 || avatarUrl;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 800" width="420" height="800">
  <defs>
    <!-- Background -->
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#030303"/>
      <stop offset="50%" stop-color="#080808"/>
      <stop offset="100%" stop-color="#030303"/>
    </linearGradient>

    <!-- Gold Gradients -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8B6914"/>
      <stop offset="20%" stop-color="#C9A227"/>
      <stop offset="40%" stop-color="#FFD700"/>
      <stop offset="50%" stop-color="#FFF8DC"/>
      <stop offset="60%" stop-color="#FFD700"/>
      <stop offset="80%" stop-color="#C9A227"/>
      <stop offset="100%" stop-color="#8B6914"/>
    </linearGradient>
    <linearGradient id="goldBar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8B6914"/>
      <stop offset="50%" stop-color="#FFD700"/>
      <stop offset="100%" stop-color="#C9A227"/>
    </linearGradient>
    <linearGradient id="levelBar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8B6914"/>
      <stop offset="100%" stop-color="#FFD700"/>
    </linearGradient>

    <!-- Platinum Ring -->
    <linearGradient id="platinumRing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E8E8E8"/>
      <stop offset="15%" stop-color="#B8B8B8"/>
      <stop offset="30%" stop-color="#FFFFFF"/>
      <stop offset="50%" stop-color="#A0A0A0"/>
      <stop offset="70%" stop-color="#E0E0E0"/>
      <stop offset="85%" stop-color="#C8C8C8"/>
      <stop offset="100%" stop-color="#909090"/>
    </linearGradient>

    <!-- Portrait Gradient -->
    <linearGradient id="portraitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(3,3,3,0)"/>
      <stop offset="40%" stop-color="rgba(3,3,3,0.3)"/>
      <stop offset="70%" stop-color="rgba(3,3,3,0.8)"/>
      <stop offset="100%" stop-color="#030303"/>
    </linearGradient>

    <!-- Radial Light Behind Portrait -->
    <radialGradient id="portraitLight" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="rgba(255,215,0,0.12)"/>
      <stop offset="50%" stop-color="rgba(255,215,0,0.04)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>

    <!-- Filters -->
    <filter id="goldGlow">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feFlood flood-color="#FFD700" flood-opacity="0.4"/>
      <feComposite in2="blur" operator="in"/>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="portraitGlow">
      <feGaussianBlur stdDeviation="25" result="blur"/>
      <feFlood flood-color="#FFD700" flood-opacity="0.3"/>
      <feComposite in2="blur" operator="in"/>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="softGlow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="textGlow">
      <feGaussianBlur stdDeviation="1" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="rgba(0,0,0,0.5)"/>
    </filter>

    <!-- Clip Paths -->
    <clipPath id="avatarClip">
      <circle cx="210" cy="215" r="105"/>
    </clipPath>
    <clipPath id="portraitClip">
      <rect x="0" y="0" width="420" height="420" rx="28"/>
    </clipPath>
    <clipPath id="cardClip">
      <rect width="420" height="800" rx="28"/>
    </clipPath>
  </defs>

  <!-- Card -->
  <g clip-path="url(#cardClip)">
    <rect width="420" height="800" fill="url(#bg)"/>

    <!-- Subtle texture -->
    <pattern id="texture" width="100" height="100" patternUnits="userSpaceOnUse">
      <circle cx="50" cy="50" r="0.5" fill="rgba(255,215,0,0.008)"/>
    </pattern>
    <rect width="420" height="800" fill="url(#texture)"/>

    <!-- Portrait Area Background Light -->
    <rect x="0" y="0" width="420" height="420" fill="url(#portraitLight)"/>

    <!-- Portrait Area -->
    <clipPath id="portraitArea">
      <rect x="0" y="0" width="420" height="420" rx="28"/>
    </clipPath>
    <g clip-path="url(#portraitArea)">
      <!-- Profile Image -->
      <image href="${profileSrc}" x="60" y="55" width="300" height="320" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice"/>

      <!-- Portrait Fade Overlay -->
      <rect width="420" height="420" fill="url(#portraitGrad)"/>
    </g>

    <!-- Portrait Outer Glow -->
    <circle cx="210" cy="215" r="115" fill="none" stroke="url(#goldGrad)" stroke-width="2" opacity="0.25" filter="url(#portraitGlow)"/>

    <!-- Platinum Ring Layer 1 (Outer) -->
    <circle cx="210" cy="215" r="112" fill="none" stroke="url(#platinumRing)" stroke-width="3" opacity="0.4"/>

    <!-- Platinum Ring Layer 2 (Main) -->
    <circle cx="210" cy="215" r="108" fill="none" stroke="url(#goldGrad)" stroke-width="2.5" opacity="0.9"/>

    <!-- Platinum Ring Layer 3 (Inner) -->
    <circle cx="210" cy="215" r="105" fill="none" stroke="url(#platinumRing)" stroke-width="1" opacity="0.6"/>

    <!-- Ring Highlight -->
    <circle cx="210" cy="215" r="110" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="40 280" stroke-dashoffset="-60"/>

    <!-- Header -->
    <!-- Rank Badge -->
    <g transform="translate(24, 32)">
      <rect width="90" height="30" rx="15" fill="rgba(255,215,0,0.06)" stroke="url(#goldGrad)" stroke-width="0.8"/>
      <text x="45" y="20" font-family="system-ui, -apple-system, 'SF Pro Display', sans-serif" font-size="11" font-weight="700" fill="${rank.color}" text-anchor="middle" letter-spacing="2">${rank.rank}</text>
    </g>

    <!-- Country & GitHub -->
    <g transform="translate(290, 34)">
      <text x="0" y="18" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="500" fill="white">🇮🇳</text>
      <text x="28" y="18" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="500" fill="rgba(255,255,255,0.6)" letter-spacing="0.5">INDIA</text>
    </g>
    <g transform="translate(360, 34)">
      <circle cx="14" cy="14" r="14" fill="rgba(255,215,0,0.04)" stroke="rgba(255,215,0,0.12)" stroke-width="0.5"/>
      <path d="M14 4C9.58 4 6 7.58 6 12c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0022 12c0-4.42-3.58-8-8-8z" fill="rgba(255,255,255,0.5)" transform="translate(0,0) scale(0.85)"/>
    </g>

    <!-- Name -->
    <text x="210" y="440" font-family="system-ui, -apple-system, 'SF Pro Display', sans-serif" font-size="36" font-weight="800" fill="white" text-anchor="middle" letter-spacing="1.5" filter="url(#textGlow)">HIMANSHU BAGGA</text>

    <!-- Role -->
    <text x="210" y="468" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="600" fill="url(#goldGrad)" text-anchor="middle" letter-spacing="4">JAVA BACKEND DEVELOPER</text>

    <!-- Subtitle -->
    <text x="210" y="492" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="rgba(255,255,255,0.28)" text-anchor="middle" font-style="italic">Building scalable backend systems.</text>

    <!-- Level Section -->
    <g transform="translate(35, 520)">
      <text x="0" y="14" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="rgba(255,215,0,0.5)" letter-spacing="2.5" font-weight="600">DEVELOPER LEVEL</text>
      <text x="350" y="14" font-family="system-ui, -apple-system, 'SF Pro Display', sans-serif" font-size="24" font-weight="800" fill="white" text-anchor="end" filter="url(#textGlow)">LEVEL ${level}</text>

      <!-- Level Bar -->
      <rect x="0" y="26" width="350" height="6" rx="3" fill="rgba(255,215,0,0.05)"/>
      <rect x="0" y="26" width="${levelProgress * 3.5}" height="6" rx="3" fill="url(#levelBar)" filter="url(#softGlow)"/>

      <text x="0" y="48" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="rgba(255,255,255,0.22)">${rank.sub}</text>
    </g>

    <!-- Stats Section -->
    <g transform="translate(35, 588)">
      <line x1="0" y1="0" x2="350" y2="0" stroke="rgba(255,215,0,0.06)" stroke-width="0.5"/>

      <!-- Stats Row 1 -->
      <g transform="translate(0, 18)">
        <g>
          <rect x="0" y="0" width="105" height="48" rx="12" fill="rgba(255,215,0,0.025)" stroke="rgba(255,215,0,0.06)" stroke-width="0.5"/>
          <text x="52" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#fbbf24" text-anchor="middle">⭐ ${stats.stars}</text>
          <text x="52" y="40" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="rgba(255,255,255,0.3)" text-anchor="middle" letter-spacing="1">STARS</text>
        </g>
        <g transform="translate(115, 0)">
          <rect x="0" y="0" width="105" height="48" rx="12" fill="rgba(255,215,0,0.025)" stroke="rgba(255,215,0,0.06)" stroke-width="0.5"/>
          <text x="52" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#daa520" text-anchor="middle">📦 ${stats.repos}</text>
          <text x="52" y="40" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="rgba(255,255,255,0.3)" text-anchor="middle" letter-spacing="1">REPOS</text>
        </g>
        <g transform="translate(230, 0)">
          <rect x="0" y="0" width="120" height="48" rx="12" fill="rgba(255,215,0,0.025)" stroke="rgba(255,215,0,0.06)" stroke-width="0.5"/>
          <text x="60" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#22c55e" text-anchor="middle">📈 ${stats.contributions}</text>
          <text x="60" y="40" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="rgba(255,255,255,0.3)" text-anchor="middle" letter-spacing="1">CONTRIBUTIONS</text>
        </g>
      </g>

      <!-- Stats Row 2 -->
      <g transform="translate(0, 76)">
        <g>
          <rect x="0" y="0" width="105" height="48" rx="12" fill="rgba(255,215,0,0.025)" stroke="rgba(255,215,0,0.06)" stroke-width="0.5"/>
          <text x="52" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#ef4444" text-anchor="middle">🔥 ${stats.streak}</text>
          <text x="52" y="40" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="rgba(255,255,255,0.3)" text-anchor="middle" letter-spacing="1">STREAK</text>
        </g>
        <g transform="translate(115, 0)">
          <rect x="0" y="0" width="105" height="48" rx="12" fill="rgba(255,215,0,0.025)" stroke="rgba(255,215,0,0.06)" stroke-width="0.5"/>
          <text x="52" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#a78bfa" text-anchor="middle">👥 ${stats.followers}</text>
          <text x="52" y="40" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="rgba(255,255,255,0.3)" text-anchor="middle" letter-spacing="1">FOLLOWERS</text>
        </g>
        <g transform="translate(230, 0)">
          <rect x="0" y="0" width="120" height="48" rx="12" fill="rgba(255,215,0,0.025)" stroke="rgba(255,215,0,0.06)" stroke-width="0.5"/>
          <text x="60" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#06b6d4" text-anchor="middle">💼 2</text>
          <text x="60" y="40" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="rgba(255,255,255,0.3)" text-anchor="middle" letter-spacing="1">INTERNSHIPS</text>
        </g>
      </g>
    </g>

    <!-- Skills Section -->
    <g transform="translate(35, 690)">
      <line x1="0" y1="0" x2="350" y2="0" stroke="rgba(255,215,0,0.06)" stroke-width="0.5"/>

      <text x="0" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="rgba(255,215,0,0.5)" letter-spacing="2.5" font-weight="600">CORE EXPERTISE</text>

      ${skills.map((skill, i) => `
      <g transform="translate(0, ${38 + i * 28})">
        <text x="0" y="10" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="rgba(255,255,255,0.55)" letter-spacing="0.5">${skill.name}</text>
        <rect x="130" y="0" width="190" height="8" rx="4" fill="rgba(255,215,0,0.035)"/>
        <rect x="130" y="0" width="${skill.value * 1.9}" height="8" rx="4" fill="url(#goldBar)" opacity="0.75"/>
        <text x="330" y="10" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="rgba(255,215,0,0.65)" text-anchor="end">${skill.value}</text>
      </g>
      `).join('')}
    </g>

    <!-- Achievements -->
    <g transform="translate(35, 748)">
      <line x1="0" y1="0" x2="350" y2="0" stroke="rgba(255,215,0,0.06)" stroke-width="0.5"/>

      <g transform="translate(0, 14)">
        <!-- Medal 1 -->
        <g>
          <circle cx="18" cy="18" r="18" fill="rgba(251,191,36,0.05)" stroke="rgba(251,191,36,0.18)" stroke-width="0.5"/>
          <text x="18" y="23" font-family="system-ui, sans-serif" font-size="14" text-anchor="middle">🏆</text>
          <text x="44" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="9" fill="rgba(255,215,0,0.65)">Research Paper</text>
        </g>
        <!-- Medal 2 -->
        <g transform="translate(130, 0)">
          <circle cx="18" cy="18" r="18" fill="rgba(99,102,241,0.05)" stroke="rgba(99,102,241,0.18)" stroke-width="0.5"/>
          <text x="18" y="23" font-family="system-ui, sans-serif" font-size="14" text-anchor="middle">🌍</text>
          <text x="44" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="9" fill="rgba(129,140,248,0.65)">Microsoft</text>
        </g>
        <!-- Medal 3 -->
        <g transform="translate(245, 0)">
          <circle cx="18" cy="18" r="18" fill="rgba(99,102,241,0.05)" stroke="rgba(99,102,241,0.18)" stroke-width="0.5"/>
          <text x="18" y="23" font-family="system-ui, sans-serif" font-size="14" text-anchor="middle">🌍</text>
          <text x="44" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="9" fill="rgba(129,140,248,0.65)">SAP</text>
        </g>
      </g>

      <g transform="translate(0, 56)">
        <!-- Medal 4 -->
        <g>
          <circle cx="18" cy="18" r="18" fill="rgba(6,182,212,0.05)" stroke="rgba(6,182,212,0.18)" stroke-width="0.5"/>
          <text x="18" y="23" font-family="system-ui, sans-serif" font-size="14" text-anchor="middle">☁️</text>
          <text x="44" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="9" fill="rgba(6,182,212,0.65)">Oracle AI</text>
        </g>
        <!-- Medal 5 -->
        <g transform="translate(130, 0)">
          <circle cx="18" cy="18" r="18" fill="rgba(34,197,94,0.05)" stroke="rgba(34,197,94,0.18)" stroke-width="0.5"/>
          <text x="18" y="23" font-family="system-ui, sans-serif" font-size="14" text-anchor="middle">💼</text>
          <text x="44" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="9" fill="rgba(34,197,94,0.65)">Sentinel Layer</text>
        </g>
        <!-- Medal 6 -->
        <g transform="translate(245, 0)">
          <circle cx="18" cy="18" r="18" fill="rgba(34,197,94,0.05)" stroke="rgba(34,197,94,0.18)" stroke-width="0.5"/>
          <text x="18" y="23" font-family="system-ui, sans-serif" font-size="14" text-anchor="middle">💼</text>
          <text x="44" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="9" fill="rgba(34,197,94,0.65)">Judge India</text>
        </g>
      </g>
    </g>

    <!-- Footer -->
    <text x="210" y="793" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="rgba(255,255,255,0.1)" text-anchor="middle" letter-spacing="0.5">Auto-generated from GitHub stats • ${new Date().toISOString().split('T')[0]}</text>
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
  
  // Read profile image and convert to base64
  let profileBase64 = null;
  if (fs.existsSync(PROFILE_IMAGE)) {
    const imageBuffer = fs.readFileSync(PROFILE_IMAGE);
    const ext = path.extname(PROFILE_IMAGE).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
    profileBase64 = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
    console.log('Profile image loaded and converted to base64');
  } else {
    console.log('Using GitHub avatar');
  }

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const svg = generateSVG({ stats, avatarUrl: user.avatar_url, profileBase64 });
  const outputPath = path.join(OUTPUT_DIR, 'developer-card.svg');
  fs.writeFileSync(outputPath, svg);
  console.log(`Card generated: ${outputPath}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
