const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'assets');

function generateSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" width="400" height="560">
  <defs>
    <!-- Gold Gradient -->
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d4a853"/>
      <stop offset="20%" stop-color="#f0d78c"/>
      <stop offset="40%" stop-color="#c9a227"/>
      <stop offset="60%" stop-color="#f5e6a3"/>
      <stop offset="80%" stop-color="#b8941f"/>
      <stop offset="100%" stop-color="#d4a853"/>
    </linearGradient>
    
    <!-- Card Body Gradient -->
    <linearGradient id="cardBody" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f5e6a3"/>
      <stop offset="30%" stop-color="#e8d48b"/>
      <stop offset="60%" stop-color="#dcc76e"/>
      <stop offset="100%" stop-color="#c9a227"/>
    </linearGradient>
    
    <!-- Top Section Gradient -->
    <linearGradient id="topSection" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f5e6a3"/>
      <stop offset="50%" stop-color="#e8d48b"/>
      <stop offset="100%" stop-color="#d4a853"/>
    </linearGradient>

    <!-- Text Shadow Filter -->
    <filter id="textShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="1" dy="1" stdDeviation="0.5" flood-color="rgba(0,0,0,0.3)"/>
    </filter>

    <!-- Glow Filter -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Card Shield Shape -->
  <path d="M 60 20 
           L 340 20 
           Q 360 20 370 40 
           L 380 180 
           Q 385 220 370 260 
           L 320 400 
           Q 280 480 200 520 
           Q 120 480 80 400 
           L 30 260 
           Q 15 220 20 180 
           L 30 40 
           Q 40 20 60 20 Z" 
        fill="url(#cardBody)" stroke="#8B6914" stroke-width="3"/>

  <!-- Inner Border -->
  <path d="M 70 30 
           L 330 30 
           Q 348 30 356 46 
           L 365 185 
           Q 370 220 356 256 
           L 310 390 
           Q 275 465 200 502 
           Q 125 465 90 390 
           L 44 256 
           Q 30 220 35 185 
           L 44 46 
           Q 52 30 70 30 Z" 
        fill="none" stroke="#a67c00" stroke-width="1.5" opacity="0.5"/>

  <!-- Top Section Background -->
  <path d="M 60 20 
           L 340 20 
           Q 360 20 370 40 
           L 380 180 
           Q 385 220 370 260 
           L 200 260 
           L 30 260 
           Q 15 220 20 180 
           L 30 40 
           Q 40 20 60 20 Z" 
        fill="url(#topSection)"/>

  <!-- Decorative Lines -->
  <line x1="100" y1="240" x2="300" y2="240" stroke="#8B6914" stroke-width="1" opacity="0.4"/>
  <line x1="80" y1="250" x2="320" y2="250" stroke="#8B6914" stroke-width="0.5" opacity="0.3"/>

  <!-- Number -->
  <text x="80" y="80" font-family="Arial Black, Arial, sans-serif" font-size="52" font-weight="900" fill="#3d2914" filter="url(#textShadow)">31</text>
  
  <!-- Position -->
  <text x="80" y="110" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#5a3d1a" letter-spacing="2">REPOS</text>

  <!-- Flag -->
  <g transform="translate(75, 125)">
    <rect width="40" height="26" rx="3" fill="#000080"/>
    <rect x="0" y="0" width="20" height="13" fill="#FF9933"/>
    <rect x="20" y="0" width="20" height="13" fill="white"/>
    <rect x="0" y="13" width="20" height="13" fill="white"/>
    <rect x="20" y="13" width="20" height="13" fill="#138808"/>
    <circle cx="20" cy="13" r="5" fill="#000080"/>
    <text x="20" y="16" font-family="Arial, sans-serif" font-size="6" fill="white" text-anchor="middle">✦</text>
  </g>

  <!-- Club Badge -->
  <g transform="translate(75, 160)">
    <circle cx="18" cy="18" r="18" fill="#c41e3a" stroke="#8B0000" stroke-width="2"/>
    <circle cx="18" cy="18" r="12" fill="white"/>
    <text x="18" y="22" font-family="Arial, sans-serif" font-size="10" fill="#c41e3a" text-anchor="middle" font-weight="bold">GH</text>
  </g>

  <!-- Silhouette Placeholder (subtle) -->
  <ellipse cx="280" cy="120" rx="80" ry="90" fill="#c9a227" opacity="0.2"/>
  <ellipse cx="280" cy="100" rx="40" ry="45" fill="#c9a227" opacity="0.15"/>

  <!-- Name -->
  <text x="200" y="300" font-family="Arial Black, Arial, sans-serif" font-size="28" font-weight="900" fill="#3d2914" text-anchor="middle" filter="url(#textShadow)">HIMANSHU BAGGA</text>

  <!-- Divider Line -->
  <line x1="100" y1="315" x2="300" y2="315" stroke="#8B6914" stroke-width="2" opacity="0.6"/>

  <!-- Stats Section -->
  <g transform="translate(0, 340)">
    <!-- Left Column -->
    <text x="70" y="0" font-family="Arial Black, Arial, sans-serif" font-size="22" font-weight="900" fill="#3d2914">600+</text>
    <text x="130" y="0" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#5a3d1a">CONTRIBUTIONS</text>
    
    <text x="70" y="35" font-family="Arial Black, Arial, sans-serif" font-size="22" font-weight="900" fill="#3d2914">31</text>
    <text x="110" y="35" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#5a3d1a">REPOS</text>
    
    <text x="70" y="70" font-family="Arial Black, Arial, sans-serif" font-size="22" font-weight="900" fill="#3d2914">2</text>
    <text x="100" y="70" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#5a3d1a">INTERNSHIPS</text>

    <!-- Divider -->
    <line x1="200" y1="-10" x2="200" y2="80" stroke="#8B6914" stroke-width="1" opacity="0.4"/>

    <!-- Right Column -->
    <text x="220" y="0" font-family="Arial Black, Arial, sans-serif" font-size="22" font-weight="900" fill="#3d2914">1</text>
    <text x="245" y="0" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#5a3d1a">RESEARCH</text>
    
    <text x="220" y="35" font-family="Arial Black, Arial, sans-serif" font-size="18" font-weight="900" fill="#3d2914">MS</text>
    <text x="255" y="35" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#5a3d1a">CERTIFIED</text>
    
    <text x="220" y="70" font-family="Arial Black, Arial, sans-serif" font-size="18" font-weight="900" fill="#3d2914">SAP</text>
    <text x="258" y="70" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#5a3d1a">CERTIFIED</text>
  </g>

  <!-- Bottom Logo -->
  <g transform="translate(185, 490)">
    <circle cx="15" cy="15" r="15" fill="#8B6914" opacity="0.3"/>
    <text x="15" y="20" font-family="Arial, sans-serif" font-size="14" fill="#3d2914" text-anchor="middle">⚽</text>
  </g>

</svg>`;
}

async function main() {
  console.log('Generating football card...');

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const svg = generateSVG();
  const outputPath = path.join(OUTPUT_DIR, 'developer-card.svg');
  fs.writeFileSync(outputPath, svg);
  console.log(`Card generated: ${outputPath}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
