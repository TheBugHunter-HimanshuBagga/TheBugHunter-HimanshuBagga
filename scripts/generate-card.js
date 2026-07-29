const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'assets');

function generateSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 600" width="420" height="600">
  <defs>
    <linearGradient id="cardBody" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f5e6a3"/>
      <stop offset="25%" stop-color="#e8d48b"/>
      <stop offset="50%" stop-color="#dcc76e"/>
      <stop offset="75%" stop-color="#d4b85a"/>
      <stop offset="100%" stop-color="#c9a227"/>
    </linearGradient>
    <linearGradient id="topShine" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.3)"/>
      <stop offset="50%" stop-color="rgba(255,255,255,0.1)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
    <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8B6914"/>
      <stop offset="50%" stop-color="#c9a227"/>
      <stop offset="100%" stop-color="#8B6914"/>
    </linearGradient>
    <filter id="textShadow">
      <feDropShadow dx="1" dy="2" stdDeviation="1" flood-color="rgba(0,0,0,0.2)"/>
    </filter>
    <filter id="innerGlow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Card Shield Shape - FIFA Style -->
  <path d="M 40 30 
           Q 40 15 55 15 
           L 365 15 
           Q 380 15 380 30 
           L 395 200 
           Q 400 250 385 290 
           L 340 420 
           Q 300 510 210 565 
           Q 120 510 80 420 
           L 35 290 
           Q 20 250 25 200 
           Z" 
        fill="url(#cardBody)" stroke="#8B6914" stroke-width="2.5"/>

  <!-- Top Shine Effect -->
  <path d="M 55 25 
           L 365 25 
           Q 375 25 375 35 
           L 385 180 
           Q 388 210 380 240 
           L 210 240 
           L 40 240 
           Q 32 210 35 180 
           L 45 35 
           Q 45 25 55 25 Z" 
        fill="url(#topShine)" opacity="0.4"/>

  <!-- Inner Border -->
  <path d="M 50 35 
           Q 50 25 60 25 
           L 360 25 
           Q 370 25 370 35 
           L 383 200 
           Q 387 245 375 280 
           L 332 410 
           Q 295 498 210 550 
           Q 125 498 88 410 
           L 45 280 
           Q 33 245 37 200 
           Z" 
        fill="none" stroke="#a67c00" stroke-width="1" opacity="0.6"/>

  <!-- Decorative Diagonal Lines -->
  <line x1="180" y1="180" x2="350" y2="80" stroke="#c9a227" stroke-width="1" opacity="0.3"/>
  <line x1="200" y1="200" x2="370" y2="100" stroke="#c9a227" stroke-width="0.5" opacity="0.2"/>
  <line x1="160" y1="160" x2="330" y2="60" stroke="#c9a227" stroke-width="0.5" opacity="0.2"/>

  <!-- Number -->
  <text x="75" y="100" font-family="Arial Black, Impact, sans-serif" font-size="72" font-weight="900" fill="#3d2914" filter="url(#textShadow)">31</text>
  
  <!-- Position -->
  <text x="75" y="135" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#5a3d1a" letter-spacing="3">REPOS</text>

  <!-- Indian Flag -->
  <g transform="translate(75, 150)">
    <rect width="55" height="33" rx="2" fill="white" stroke="#ccc" stroke-width="0.5"/>
    <rect width="55" height="11" fill="#FF9933"/>
    <rect y="11" width="55" height="11" fill="#FFFFFF"/>
    <rect y="22" width="55" height="11" fill="#138808"/>
    <circle cx="27.5" cy="16.5" r="5" fill="#000080"/>
    <circle cx="27.5" cy="16.5" r="2.5" fill="white"/>
    <circle cx="27.5" cy="16.5" r="1" fill="#000080"/>
  </g>

  <!-- GitHub Badge -->
  <g transform="translate(75, 195)">
    <circle cx="20" cy="20" r="20" fill="#c41e3a" stroke="#8B0000" stroke-width="2"/>
    <circle cx="20" cy="20" r="15" fill="white"/>
    <path d="M20 10C15.58 10 12 13.58 12 18c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0028 18c0-4.42-3.58-8-8-8z" fill="#333" transform="translate(6,6) scale(0.8)"/>
  </g>

  <!-- Silhouette -->
  <ellipse cx="300" cy="140" rx="75" ry="85" fill="#c9a227" opacity="0.15"/>

  <!-- Name Section -->
  <text x="210" y="310" font-family="Arial Black, Impact, sans-serif" font-size="28" font-weight="900" fill="#3d2914" text-anchor="middle" filter="url(#textShadow)">HIMANSHU BAGGA</text>

  <!-- Divider -->
  <line x1="90" y1="325" x2="330" y2="325" stroke="url(#goldAccent)" stroke-width="2"/>

  <!-- Stats Grid -->
  <!-- Left Column -->
  <g transform="translate(70, 355)">
    <text x="0" y="0" font-family="Arial Black, Impact, sans-serif" font-size="28" font-weight="900" fill="#3d2914">600+</text>
    <text x="80" y="0" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#5a3d1a" letter-spacing="1">CONTRIBUTIONS</text>
    
    <text x="0" y="40" font-family="Arial Black, Impact, sans-serif" font-size="28" font-weight="900" fill="#3d2914">31</text>
    <text x="45" y="40" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#5a3d1a" letter-spacing="1">REPOS</text>
    
    <text x="0" y="80" font-family="Arial Black, Impact, sans-serif" font-size="28" font-weight="900" fill="#3d2914">2</text>
    <text x="30" y="80" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#5a3d1a" letter-spacing="1">INTERNSHIPS</text>
  </g>

  <!-- Divider Line -->
  <line x1="210" y1="350" x2="210" y2="445" stroke="#8B6914" stroke-width="1.5" opacity="0.5"/>

  <!-- Right Column -->
  <g transform="translate(230, 355)">
    <text x="0" y="0" font-family="Arial Black, Impact, sans-serif" font-size="28" font-weight="900" fill="#3d2914">1</text>
    <text x="30" y="0" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#5a3d1a" letter-spacing="1">RESEARCH</text>
    
    <text x="0" y="40" font-family="Arial Black, Impact, sans-serif" font-size="18" font-weight="900" fill="#3d2914">MS</text>
    <text x="35" y="40" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#5a3d1a" letter-spacing="1">CERTIFIED</text>
    
    <text x="0" y="80" font-family="Arial Black, Impact, sans-serif" font-size="18" font-weight="900" fill="#3d2914">SAP</text>
    <text x="42" y="80" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#5a3d1a" letter-spacing="1">CERTIFIED</text>
  </g>

  <!-- Bottom Ball -->
  <circle cx="210" cy="530" r="18" fill="#8B6914" opacity="0.25"/>
  <circle cx="210" cy="530" r="12" fill="white" opacity="0.3"/>
  <text x="210" y="536" font-family="Arial, sans-serif" font-size="18" fill="#3d2914" text-anchor="middle">⚽</text>

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
