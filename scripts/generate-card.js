const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'assets');

function generateSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 580" width="400" height="580">
  <defs>
    <linearGradient id="cardBody" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f5e6a3"/>
      <stop offset="30%" stop-color="#e8d48b"/>
      <stop offset="60%" stop-color="#dcc76e"/>
      <stop offset="100%" stop-color="#c9a227"/>
    </linearGradient>
    <linearGradient id="topSection" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f5e6a3"/>
      <stop offset="50%" stop-color="#e8d48b"/>
      <stop offset="100%" stop-color="#d4a853"/>
    </linearGradient>
    <filter id="textShadow">
      <feDropShadow dx="1" dy="1" stdDeviation="0.5" flood-color="rgba(0,0,0,0.25)"/>
    </filter>
  </defs>

  <!-- Card Shield Shape -->
  <path d="M 60 20 L 340 20 Q 360 20 370 40 L 380 180 Q 385 220 370 260 L 320 420 Q 280 500 200 540 Q 120 500 80 420 L 30 260 Q 15 220 20 180 L 30 40 Q 40 20 60 20 Z" fill="url(#cardBody)" stroke="#8B6914" stroke-width="3"/>

  <!-- Inner Border -->
  <path d="M 70 30 L 330 30 Q 348 30 356 46 L 365 185 Q 370 220 356 256 L 310 410 Q 275 485 200 522 Q 125 485 90 410 L 44 256 Q 30 220 35 185 L 44 46 Q 52 30 70 30 Z" fill="none" stroke="#a67c00" stroke-width="1.5" opacity="0.5"/>

  <!-- Top Section -->
  <path d="M 60 20 L 340 20 Q 360 20 370 40 L 380 180 Q 385 220 370 260 L 200 260 L 30 260 Q 15 220 20 180 L 30 40 Q 40 20 60 20 Z" fill="url(#topSection)"/>

  <!-- Number 31 -->
  <text x="80" y="90" font-family="Arial Black, sans-serif" font-size="60" font-weight="900" fill="#3d2914" filter="url(#textShadow)">31</text>
  
  <!-- Position Label -->
  <text x="80" y="118" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#5a3d1a" letter-spacing="2">REPOS</text>

  <!-- Indian Flag -->
  <g transform="translate(75, 135)">
    <!-- Saffron -->
    <rect width="50" height="10" fill="#FF9933"/>
    <!-- White -->
    <rect y="10" width="50" height="10" fill="#FFFFFF"/>
    <!-- Green -->
    <rect y="20" width="50" height="10" fill="#138808"/>
    <!-- Ashoka Chakra -->
    <circle cx="25" cy="15" r="4" fill="#000080"/>
    <circle cx="25" cy="15" r="2" fill="white"/>
  </g>

  <!-- GitHub Badge -->
  <g transform="translate(75, 180)">
    <circle cx="18" cy="18" r="18" fill="#c41e3a" stroke="#8B0000" stroke-width="2"/>
    <circle cx="18" cy="18" r="13" fill="white"/>
    <path d="M18 8C13.58 8 10 11.58 10 16c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0026 16c0-4.42-3.58-8-8-8z" fill="#333" transform="translate(5,5) scale(0.7)"/>
  </g>

  <!-- Silhouette -->
  <ellipse cx="280" cy="130" rx="70" ry="80" fill="#c9a227" opacity="0.15"/>

  <!-- Divider -->
  <line x1="80" y1="270" x2="320" y2="270" stroke="#8B6914" stroke-width="1.5" opacity="0.5"/>

  <!-- Name -->
  <text x="200" y="305" font-family="Arial Black, sans-serif" font-size="26" font-weight="900" fill="#3d2914" text-anchor="middle" filter="url(#textShadow)">HIMANSHU BAGGA</text>

  <!-- Divider -->
  <line x1="100" y1="320" x2="300" y2="320" stroke="#8B6914" stroke-width="1" opacity="0.4"/>

  <!-- Stats Left Column -->
  <text x="60" y="360" font-family="Arial Black, sans-serif" font-size="24" font-weight="900" fill="#3d2914">600+</text>
  <text x="135" y="360" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#5a3d1a">CONTRIBUTIONS</text>
  
  <text x="60" y="395" font-family="Arial Black, sans-serif" font-size="24" font-weight="900" fill="#3d2914">31</text>
  <text x="105" y="395" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#5a3d1a">REPOS</text>
  
  <text x="60" y="430" font-family="Arial Black, sans-serif" font-size="24" font-weight="900" fill="#3d2914">2</text>
  <text x="85" y="430" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#5a3d1a">INTERNSHIPS</text>

  <!-- Divider Line -->
  <line x1="200" y1="345" x2="200" y2="445" stroke="#8B6914" stroke-width="1" opacity="0.4"/>

  <!-- Stats Right Column -->
  <text x="220" y="360" font-family="Arial Black, sans-serif" font-size="24" font-weight="900" fill="#3d2914">1</text>
  <text x="245" y="360" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#5a3d1a">RESEARCH</text>
  
  <text x="220" y="395" font-family="Arial Black, sans-serif" font-size="16" font-weight="900" fill="#3d2914">MS</text>
  <text x="252" y="395" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#5a3d1a">CERTIFIED</text>
  
  <text x="220" y="430" font-family="Arial Black, sans-serif" font-size="16" font-weight="900" fill="#3d2914">SAP</text>
  <text x="258" y="430" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#5a3d1a">CERTIFIED</text>

  <!-- Bottom Ball -->
  <g transform="translate(185, 490)">
    <circle cx="15" cy="15" r="15" fill="#8B6914" opacity="0.3"/>
    <text x="15" y="21" font-family="Arial, sans-serif" font-size="16" fill="#3d2914" text-anchor="middle">⚽</text>
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
