import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';

const svgPath = path.resolve('public', 'favicon.svg');
const svg = fs.readFileSync(svgPath, 'utf8');

const sizes = [
  { name: 'pwa-192x192.png', width: 192 },
  { name: 'pwa-512x512.png', width: 512 },
  { name: 'pwa-maskable-512x512.png', width: 512 },
  { name: 'apple-touch-icon.png', width: 180 },
];

for (const { name, width } of sizes) {
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: width,
    },
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  const outPath = path.resolve('public', name);
  fs.writeFileSync(outPath, pngBuffer);
  console.log(`✓ Generated ${name} (${width}x${width}, ${pngBuffer.length} bytes)`);
}
