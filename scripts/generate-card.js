const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'assets');

function generateSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 540" width="380" height="540">
  <defs>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f7ebc0"/>
      <stop offset="50%" stop-color="#e8d48b"/>
      <stop offset="100%" stop-color="#c9a227"/>
    </linearGradient>
    <linearGradient id="topArea" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f7ebc0"/>
      <stop offset="100%" stop-color="#dcc76e"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.15)"/>
    </filter>
  </defs>

  <!-- FIFA Ultimate Team Card Shape -->
  <path d="M 30 25 
           C 30 10, 45 5, 60 5 
           L 320 5 
           C 335 5, 350 10, 350 25 
           L 365 220 
           C 368 260, 355 300, 330 340 
           L 260 470 
           C 230 520, 190 535, 190 535 
           C 190 535, 150 520, 120 470 
           L 50 340 
           C 25 300, 12 260, 15 220 
           Z" 
        fill="url(#cardBg)" 
        stroke="#a07818" 
        stroke-width="2"
        filter="url(#shadow)"/>

  <!-- Top Gold Section -->
  <path d="M 35 30 
           C 35 18, 48 12, 62 12 
           L 318 12 
           C 332 12, 345 18, 345 30 
           L 358 210 
           C 360 240, 350 270, 335 295 
           L 190 295 
           L 45 295 
           C 30 270, 20 240, 22 210 
           Z" 
        fill="url(#topArea)"/>

  <!-- Diagonal Accent Lines -->
  <line x1="160" y1="180" x2="340" y2="60" stroke="#c9a227" stroke-width="1.5" opacity="0.3"/>
  <line x1="180" y1="200" x2="355" y2="80" stroke="#c9a227" stroke-width="1" opacity="0.2"/>
  <line x1="140" y1="160" x2="320" y2="40" stroke="#c9a227" stroke-width="1" opacity="0.2"/>

  <!-- Number -->
  <text x="60" y="100" font-family="Arial Black, Impact, sans-serif" font-size="80" font-weight="900" fill="#4a3510">31</text>
  
  <!-- Position -->
  <text x="62" y="135" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#5a3d1a" letter-spacing="4">REPOS</text>

  <!-- Indian Flag -->
  <g transform="translate(62, 150)">
    <rect width="60" height="36" rx="2" fill="white" stroke="#ddd" stroke-width="0.5"/>
    <rect width="60" height="12" fill="#FF9933"/>
    <rect y="12" width="60" height="12" fill="#FFFFFF"/>
    <rect y="24" width="60" height="12" fill="#138808"/>
    <circle cx="30" cy="18" r="5.5" fill="#000080"/>
    <circle cx="30" cy="18" r="3" fill="white"/>
    <circle cx="30" cy="18" r="1.2" fill="#000080"/>
  </g>

  <!-- GitHub Badge -->
  <g transform="translate(62, 200)">
    <circle cx="22" cy="22" r="22" fill="#c41e3a"/>
    <circle cx="22" cy="22" r="16" fill="white"/>
    <path d="M22 12C17.03 12 13 16.03 13 21c0 4 2.63 7.41 6.28 8.55.46.08.63-.2.63-.44 0-.22-.01-.79-.01-1.71-2.3.5-2.78-.56-2.95-1.07-.1-.27-.55-1.07-.94-1.29-.32-.17-.78-.6-.01-.61.72-.01 1.24.66 1.41.93.83 1.4 2.16 1 2.69.76.08-.6.32-1 .58-1.23-2.04-.23-4.18-1.02-4.18-4.54 0-1 .35-1.82.93-2.46-.09-.23-.41-1.15.09-2.4 0 0 .76-.24 2.5.93.73-.2 1.51-.3 2.28-.31.77 0 1.55.11 2.28.31 1.74-1.18 2.5-.93 2.5-.93.5 1.25.18 2.17.09 2.4.58.64.93 1.46.93 2.46 0 3.53-2.14 4.31-4.19 4.53.33.28.62.84.62 1.7 0 1.22-.01 2.21-.01 2.51 0 .24.17.53.64.44C34.37 28.41 37 25 37 21c0-4.97-4.03-9-9-9z" fill="#333" transform="translate(5,5) scale(0.85)"/>
  </g>

  <!-- Silhouette -->
  <ellipse cx="280" cy="150" rx="65" ry="75" fill="#c9a227" opacity="0.12"/>

  <!-- Name -->
  <text x="190" y="340" font-family="Arial Black, Impact, sans-serif" font-size="30" font-weight="900" fill="#4a3510" text-anchor="middle">HIMANSHU BAGGA</text>

  <!-- Divider -->
  <line x1="70" y1="355" x2="310" y2="355" stroke="#8B6914" stroke-width="2" opacity="0.5"/>

  <!-- Stats Left -->
  <text x="65" y="390" font-family="Arial Black, Impact, sans-serif" font-size="26" font-weight="900" fill="#4a3510">600+</text>
  <text x="145" y="390" font-family="Arial, sans-serif" font-size="13" font-weight="600" fill="#5a3d1a">CONTRIBUTIONS</text>

  <text x="65" y="425" font-family="Arial Black, Impact, sans-serif" font-size="26" font-weight="900" fill="#4a3510">31</text>
  <text x="110" y="425" font-family="Arial, sans-serif" font-size="13" font-weight="600" fill="#5a3d1a">REPOS</text>

  <text x="65" y="460" font-family="Arial Black, Impact, sans-serif" font-size="26" font-weight="900" fill="#4a3510">2</text>
  <text x="95" y="460" font-family="Arial, sans-serif" font-size="13" font-weight="600" fill="#5a3d1a">INTERNSHIPS</text>

  <!-- Vertical Divider -->
  <line x1="195" y1="375" x2="195" y2="470" stroke="#8B6914" stroke-width="1" opacity="0.4"/>

  <!-- Stats Right -->
  <text x="215" y="390" font-family="Arial Black, Impact, sans-serif" font-size="26" font-weight="900" fill="#4a3510">1</text>
  <text x="240" y="390" font-family="Arial, sans-serif" font-size="13" font-weight="600" fill="#5a3d1a">RESEARCH</text>

  <text x="215" y="425" font-family="Arial Black, Impact, sans-serif" font-size="18" font-weight="900" fill="#4a3510">MS</text>
  <text x="250" y="425" font-family="Arial, sans-serif" font-size="12" font-weight="600" fill="#5a3d1a">CERTIFIED</text>

  <text x="215" y="460" font-family="Arial Black, Impact, sans-serif" font-size="18" font-weight="900" fill="#4a3510">SAP</text>
  <text x="258" y="460" font-family="Arial, sans-serif" font-size="12" font-weight="600" fill="#5a3d1a">CERTIFIED</text>

  <!-- Bottom Ball -->
  <circle cx="190" cy="510" r="15" fill="#8B6914" opacity="0.2"/>
  <text x="190" y="516" font-size="16" text-anchor="middle">⚽</text>

</svg>`;
}

async function main() {
  console.log('Generating FIFA card...');

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
