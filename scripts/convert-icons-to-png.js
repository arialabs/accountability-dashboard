#!/usr/bin/env node

/**
 * Convert SVG icons to PNG using resvg
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicDir = join(__dirname, '..', 'public');

const icons = [
  'icon-72x72',
  'icon-96x96',
  'icon-128x128',
  'icon-144x144',
  'icon-152x152',
  'icon-192x192',
  'icon-384x384',
  'icon-512x512',
  'icon-maskable-192x192',
  'icon-maskable-512x512',
];

console.log('Converting SVG icons to PNG...\n');

for (const iconName of icons) {
  const svgPath = join(publicDir, `${iconName}.svg`);
  const pngPath = join(publicDir, `${iconName}.png`);
  
  try {
    const svgContent = readFileSync(svgPath);
    const resvg = new Resvg(svgContent);
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    
    writeFileSync(pngPath, pngBuffer);
    console.log(`✓ Converted ${iconName}.svg → ${iconName}.png`);
  } catch (error) {
    console.error(`✗ Failed to convert ${iconName}:`, error.message);
  }
}

console.log('\n✨ PNG conversion complete!\n');
