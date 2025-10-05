// Node.jsでアイコンを生成するスクリプト
const fs = require('fs');

// SVGアイコンを生成
const createSVGIcon = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#8B4789"/>
  <text x="50%" y="50%" font-size="${size * 0.6}" text-anchor="middle" dominant-baseline="middle" fill="white">🍷</text>
</svg>
`;

// 192x192 アイコン
fs.writeFileSync('icon-192.svg', createSVGIcon(192));

// 512x512 アイコン
fs.writeFileSync('icon-512.svg', createSVGIcon(512));

console.log('SVGアイコンを生成しました: icon-192.svg, icon-512.svg');
console.log('PNGが必要な場合は、create-icons.htmlをブラウザで開いてください');
