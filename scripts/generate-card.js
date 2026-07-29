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
        repositories { totalCount }
        repositories(ownerAffiliations: OWNER) {
          nodes { stargazerCount, forkCount, pullRequests { totalCount }, issues { totalCount } }
        }
        followers { totalCount }
        pullRequests { totalCount }
        issues { totalCount }
      }
    }
  `;
  try {
    const data = await fetch(`https://api.github.com/graphql?query=${encodeURIComponent(query)}`);
    if (data.data) return data.data.user;
  } catch (e) {}
  return null;
}

function calculateAttributes(stats) {
  const { stars, repos, prs, issues, contributions, followers } = stats;
  const java = Math.min(99, 70 + Math.floor(repos * 1.5) + Math.floor(stars * 0.5));
  const api = Math.min(99, 65 + Math.floor(prs * 2) + Math.floor(repos * 1));
  const dsa = Math.min(99, 60 + Math.floor(contributions * 0.08) + Math.floor(stars * 1));
  const db = Math.min(99, 65 + Math.floor(repos * 1.2) + Math.floor(stars * 0.3));
  const sys = Math.min(99, 60 + Math.floor(contributions * 0.06) + Math.floor(followers * 0.5));
  const dev = Math.min(99, 68 + Math.floor(repos * 1.3) + Math.floor(contributions * 0.04));
  return { java, api, dsa, db, sys, dev };
}

function calculateOVR(stats) {
  const { stars, repos, prs, contributions, followers } = stats;
  let base = 50;
  base += Math.min(15, repos * 1.5);
  base += Math.min(15, stars * 0.8);
  base += Math.min(10, contributions * 0.02);
  base += Math.min(5, followers * 0.3);
  base += Math.min(5, prs * 2);
  return Math.min(99, Math.round(base));
}

function getCardTier(ovr) {
  if (ovr >= 90) return { tier: 'LEGENDARY', gradient: ['#c084fc', '#7c3aed', '#4c1d95'], border: '#c084fc', glow: 'rgba(192,132,252,0.6)' };
  if (ovr >= 80) return { tier: 'ELITE', gradient: ['#818cf8', '#6366f1', '#4338ca'], border: '#818cf8', glow: 'rgba(129,140,248,0.5)' };
  return { tier: 'GOLD', gradient: ['#fbbf24', '#f59e0b', '#d97706'], border: '#fbbf24', glow: 'rgba(251,191,36,0.4)' };
}

function generateSVG(data) {
  const { user, stats, avatarUrl } = data;
  const attributes = calculateAttributes(stats);
  const ovr = calculateOVR(stats);
  const tier = getCardTier(ovr);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 620" width="420" height="620">
  <defs>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d1117"/>
      <stop offset="50%" stop-color="#161b22"/>
      <stop offset="100%" stop-color="#0d1117"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${tier.gradient[0]}"/>
      <stop offset="50%" stop-color="${tier.gradient[1]}"/>
      <stop offset="100%" stop-color="${tier.gradient[2]}"/>
    </linearGradient>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(99,102,241,0.15)"/>
      <stop offset="100%" stop-color="rgba(139,92,246,0.05)"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="softGlow">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <clipPath id="avatarClip">
      <circle cx="210" cy="170" r="70"/>
    </clipPath>
    <clipPath id="cardClip">
      <rect x="0" y="0" width="420" height="620" rx="24" ry="24"/>
    </clipPath>
  </defs>

  <!-- Card Background -->
  <g clip-path="url(#cardClip)">
    <rect width="420" height="620" fill="url(#cardBg)"/>

    <!-- Decorative Elements -->
    <circle cx="380" cy="80" r="120" fill="rgba(99,102,241,0.03)"/>
    <circle cx="40" cy="540" r="100" fill="rgba(139,92,246,0.03)"/>

    <!-- Header Accent -->
    <rect x="20" y="15" width="380" height="100" rx="16" fill="url(#headerGrad)"/>

    <!-- Tier Badge -->
    <rect x="24" y="19" width="80" height="28" rx="14" fill="url(#accentGrad)" opacity="0.9"/>
    <text x="64" y="38" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="white" text-anchor="middle">${tier.tier}</text>

    <!-- Country & Club -->
    <text x="396" y="38" font-family="Arial, sans-serif" font-size="13" fill="rgba(255,255,255,0.7)" text-anchor="end">🇮🇳 INDIA</text>
    <text x="396" y="56" font-family="Arial, sans-serif" font-size="11" fill="rgba(255,255,255,0.5)" text-anchor="end">GITHUB</text>

    <!-- Player Name -->
    <text x="24" y="85" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="white">HIMANSHU</text>
    <text x="24" y="108" font-family="Arial, sans-serif" font-size="22" fill="rgba(255,255,255,0.8)">BAGGA</text>

    <!-- Position -->
    <text x="396" y="90" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="${tier.gradient[0]}" text-anchor="end">JAVA BACKEND</text>
    <text x="396" y="108" font-family="Arial, sans-serif" font-size="11" fill="rgba(255,255,255,0.5)" text-anchor="end">DEVELOPER</text>

    <!-- Avatar Glow -->
    <circle cx="210" cy="170" r="74" fill="none" stroke="${tier.border}" stroke-width="3" opacity="0.6" filter="url(#softGlow)"/>
    <circle cx="210" cy="170" r="72" fill="none" stroke="url(#accentGrad)" stroke-width="2"/>

    <!-- Avatar -->
    <image href="${avatarUrl}" x="140" y="100" width="140" height="140" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice"/>

    <!-- OVR Badge -->
    <circle cx="210" cy="170" r="28" fill="url(#accentGrad)" filter="url(#glow)"/>
    <circle cx="210" cy="170" r="26" fill="#0d1117"/>
    <text x="210" y="166" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="white" text-anchor="middle">${ovr}</text>
    <text x="210" y="182" font-family="Arial, sans-serif" font-size="8" fill="rgba(255,255,255,0.7)" text-anchor="middle">OVR</text>

    <!-- Divider -->
    <line x1="40" y1="225" x2="380" y2="225" stroke="url(#accentGrad)" stroke-width="1" opacity="0.4"/>

    <!-- Stats Section Title -->
    <text x="210" y="250" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="rgba(255,255,255,0.6)" text-anchor="middle" letter-spacing="3">LIVE STATS</text>

    <!-- Stats Grid -->
    <!-- Row 1 -->
    <g transform="translate(0, 265)">
      <!-- Stars -->
      <rect x="25" y="0" width="115" height="50" rx="10" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.15)" stroke-width="1"/>
      <text x="82" y="20" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#fbbf24" text-anchor="middle">⭐ ${stats.stars}</text>
      <text x="82" y="38" font-family="Arial, sans-serif" font-size="9" fill="rgba(255,255,255,0.5)" text-anchor="middle">STARS</text>

      <!-- Repos -->
      <rect x="152" y="0" width="115" height="50" rx="10" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.15)" stroke-width="1"/>
      <text x="209" y="20" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#6366f1" text-anchor="middle">📦 ${stats.repos}</text>
      <text x="209" y="38" font-family="Arial, sans-serif" font-size="9" fill="rgba(255,255,255,0.5)" text-anchor="middle">REPOS</text>

      <!-- Streak -->
      <rect x="279" y="0" width="115" height="50" rx="10" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.15)" stroke-width="1"/>
      <text x="336" y="20" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ef4444" text-anchor="middle">🔥 ${stats.streak}</text>
      <text x="336" y="38" font-family="Arial, sans-serif" font-size="9" fill="rgba(255,255,255,0.5)" text-anchor="middle">STREAK</text>
    </g>

    <!-- Row 2 -->
    <g transform="translate(0, 325)">
      <!-- Contributions -->
      <rect x="25" y="0" width="115" height="50" rx="10" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.15)" stroke-width="1"/>
      <text x="82" y="20" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#22c55e" text-anchor="middle">📈 ${stats.contributions}</text>
      <text x="82" y="38" font-family="Arial, sans-serif" font-size="9" fill="rgba(255,255,255,0.5)" text-anchor="middle">CONTRIBUTIONS</text>

      <!-- Followers -->
      <rect x="152" y="0" width="115" height="50" rx="10" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.15)" stroke-width="1"/>
      <text x="209" y="20" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#8b5cf6" text-anchor="middle">👥 ${stats.followers}</text>
      <text x="209" y="38" font-family="Arial, sans-serif" font-size="9" fill="rgba(255,255,255,0.5)" text-anchor="middle">FOLLOWERS</text>

      <!-- PRs -->
      <rect x="279" y="0" width="115" height="50" rx="10" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.15)" stroke-width="1"/>
      <text x="336" y="20" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#06b6d4" text-anchor="middle">🏆 ${stats.prs}</text>
      <text x="336" y="38" font-family="Arial, sans-serif" font-size="9" fill="rgba(255,255,255,0.5)" text-anchor="middle">PULL REQUESTS</text>
    </g>

    <!-- Row 3 -->
    <g transform="translate(0, 385)">
      <!-- Forks -->
      <rect x="25" y="0" width="115" height="50" rx="10" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.15)" stroke-width="1"/>
      <text x="82" y="20" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#f97316" text-anchor="middle">🍴 ${stats.forks}</text>
      <text x="82" y="38" font-family="Arial, sans-serif" font-size="9" fill="rgba(255,255,255,0.5)" text-anchor="middle">FORKS</text>

      <!-- Issues -->
      <rect x="152" y="0" width="115" height="50" rx="10" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.15)" stroke-width="1"/>
      <text x="209" y="20" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ec4899" text-anchor="middle">🐛 ${stats.issues}</text>
      <text x="209" y="38" font-family="Arial, sans-serif" font-size="9" fill="rgba(255,255,255,0.5)" text-anchor="middle">ISSUES</text>

      <!-- Experience -->
      <rect x="279" y="0" width="115" height="50" rx="10" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.15)" stroke-width="1"/>
      <text x="336" y="20" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#6366f1" text-anchor="middle">💼 2</text>
      <text x="336" y="38" font-family="Arial, sans-serif" font-size="9" fill="rgba(255,255,255,0.5)" text-anchor="middle">INTERNSHIPS</text>
    </g>

    <!-- Divider -->
    <line x1="40" y1="450" x2="380" y2="450" stroke="url(#accentGrad)" stroke-width="1" opacity="0.4"/>

    <!-- Attributes Title -->
    <text x="210" y="472" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="rgba(255,255,255,0.6)" text-anchor="middle" letter-spacing="3">DEVELOPER ATTRIBUTES</text>

    <!-- Attributes -->
    <g transform="translate(0, 485)">
      <!-- Row 1 -->
      <g transform="translate(0, 0)">
        <rect x="25" y="0" width="55" height="35" rx="8" fill="url(#accentGrad)" opacity="0.15"/>
        <text x="52" y="15" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${tier.gradient[0]}" text-anchor="middle">${attributes.java}</text>
        <text x="52" y="28" font-family="Arial, sans-serif" font-size="8" fill="rgba(255,255,255,0.6)" text-anchor="middle">JAVA</text>

        <rect x="90" y="0" width="55" height="35" rx="8" fill="url(#accentGrad)" opacity="0.15"/>
        <text x="117" y="15" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${tier.gradient[0]}" text-anchor="middle">${attributes.api}</text>
        <text x="117" y="28" font-family="Arial, sans-serif" font-size="8" fill="rgba(255,255,255,0.6)" text-anchor="middle">API</text>

        <rect x="155" y="0" width="55" height="35" rx="8" fill="url(#accentGrad)" opacity="0.15"/>
        <text x="182" y="15" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${tier.gradient[0]}" text-anchor="middle">${attributes.dsa}</text>
        <text x="182" y="28" font-family="Arial, sans-serif" font-size="8" fill="rgba(255,255,255,0.6)" text-anchor="middle">DSA</text>
      </g>

      <!-- Row 2 -->
      <g transform="translate(0, 45)">
        <rect x="25" y="0" width="55" height="35" rx="8" fill="url(#accentGrad)" opacity="0.15"/>
        <text x="52" y="15" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${tier.gradient[0]}" text-anchor="middle">${attributes.db}</text>
        <text x="52" y="28" font-family="Arial, sans-serif" font-size="8" fill="rgba(255,255,255,0.6)" text-anchor="middle">DB</text>

        <rect x="90" y="0" width="55" height="35" rx="8" fill="url(#accentGrad)" opacity="0.15"/>
        <text x="117" y="15" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${tier.gradient[0]}" text-anchor="middle">${attributes.sys}</text>
        <text x="117" y="28" font-family="Arial, sans-serif" font-size="8" fill="rgba(255,255,255,0.6)" text-anchor="middle">SYS</text>

        <rect x="155" y="0" width="55" height="35" rx="8" fill="url(#accentGrad)" opacity="0.15"/>
        <text x="182" y="15" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${tier.gradient[0]}" text-anchor="middle">${attributes.dev}</text>
        <text x="182" y="28" font-family="Arial, sans-serif" font-size="8" fill="rgba(255,255,255,0.6)" text-anchor="middle">DEV</text>
      </g>
    </g>

    <!-- Special Badges -->
    <g transform="translate(0, 575)">
      <line x1="40" y1="-15" x2="380" y2="-15" stroke="url(#accentGrad)" stroke-width="1" opacity="0.3"/>
      <text x="210" y="0" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="rgba(255,255,255,0.6)" text-anchor="middle" letter-spacing="3">SPECIAL BADGES</text>

      <!-- Badges -->
      <g transform="translate(0, 12)">
        <rect x="25" y="0" width="170" height="22" rx="11" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.3)" stroke-width="1"/>
        <text x="110" y="15" font-family="Arial, sans-serif" font-size="10" fill="#fbbf24" text-anchor="middle">🏆 Research Paper Published</text>

        <rect x="205" y="0" width="190" height="22" rx="11" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.3)" stroke-width="1"/>
        <text x="300" y="15" font-family="Arial, sans-serif" font-size="10" fill="#818cf8" text-anchor="middle">🌍 Microsoft · SAP Certified</text>
      </g>
    </g>

    <!-- Footer -->
    <text x="210" y="608" font-family="Arial, sans-serif" font-size="9" fill="rgba(255,255,255,0.3)" text-anchor="middle">Auto-generated from GitHub stats • ${new Date().toISOString().split('T')[0]}</text>
  </g>
</svg>`;

  return svg;
}

async function main() {
  console.log('Fetching GitHub data...');

  const user = await fetch(`https://api.github.com/users/${GITHUB_USER}`);

  let contributions = 0;
  let streak = 0;
  let totalStars = 0;
  let totalForks = 0;
  let totalPRs = 0;
  let totalIssues = 0;

  const repos = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100`);

  if (Array.isArray(repos)) {
    totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
    totalPRs = repos.reduce((sum, r) => sum + (r.open_issues_count || 0), 0);
  }

  try {
    const cal = await fetch(`https://github.com/users/${GITHUB_USER}/contributions`);
    if (typeof cal === 'number') contributions = cal;
  } catch (e) {}

  try {
    const ghData = await fetchContributions(GITHUB_USER);
    if (ghData) {
      contributions = ghData.contributionsCollection.contributionCalendar.totalContributions;
      totalPRs = ghData.pullRequests.totalCount;
      totalIssues = ghData.issues.totalCount;
      user.followers = ghData.followers.totalCount;
      user.public_repos = ghData.repositories.totalCount;
    }
  } catch (e) {}

  const stats = {
    stars: totalStars,
    repos: user.public_repos || 0,
    streak: streak,
    contributions: contributions,
    followers: user.followers || 0,
    prs: totalPRs,
    forks: totalForks,
    issues: totalIssues
  };

  console.log('Stats:', stats);

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const svg = generateSVG({
    user,
    stats,
    avatarUrl: user.avatar_url
  });

  const outputPath = path.join(OUTPUT_DIR, 'developer-card.svg');
  fs.writeFileSync(outputPath, svg);
  console.log(`Card generated: ${outputPath}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
