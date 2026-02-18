#!/usr/bin/env node

/**
 * Generate placeholder screenshots for PWA manifest
 */

import { createWriteStream } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicDir = join(__dirname, '..', 'public');

// Generate mobile screenshot (540x720)
const mobileSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 720" width="540" height="720">
  <rect width="540" height="720" fill="#f8fafc"/>
  
  <!-- Header -->
  <rect width="540" height="60" fill="#ffffff"/>
  <rect x="20" y="20" width="200" height="20" rx="4" fill="#3b82f6"/>
  
  <!-- Content -->
  <rect x="20" y="100" width="500" height="40" rx="8" fill="#ffffff"/>
  <rect x="20" y="160" width="500" height="150" rx="8" fill="#ffffff"/>
  <rect x="20" y="330" width="500" height="150" rx="8" fill="#ffffff"/>
  <rect x="20" y="500" width="500" height="150" rx="8" fill="#ffffff"/>
  
  <!-- Title -->
  <text x="270" y="360" font-family="Arial, sans-serif" font-size="24" fill="#1e293b" text-anchor="middle" font-weight="bold">
    Accountability Dashboard
  </text>
  <text x="270" y="390" font-family="Arial, sans-serif" font-size="14" fill="#64748b" text-anchor="middle">
    Track Congressional voting records
  </text>
</svg>`;

// Generate desktop screenshot (1280x720)
const desktopSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
  <rect width="1280" height="720" fill="#f8fafc"/>
  
  <!-- Header -->
  <rect width="1280" height="64" fill="#ffffff"/>
  <rect x="40" y="22" width="250" height="20" rx="4" fill="#3b82f6"/>
  
  <!-- Sidebar -->
  <rect x="40" y="104" width="280" height="576" rx="12" fill="#ffffff"/>
  
  <!-- Main content -->
  <rect x="360" y="104" width="880" height="180" rx="12" fill="#ffffff"/>
  <rect x="360" y="304" width="560" height="376" rx="12" fill="#ffffff"/>
  <rect x="940" y="304" width="300" height="376" rx="12" fill="#ffffff"/>
  
  <!-- Title -->
  <text x="640" y="360" font-family="Arial, sans-serif" font-size="32" fill="#1e293b" text-anchor="middle" font-weight="bold">
    Accountability Dashboard
  </text>
  <text x="640" y="400" font-family="Arial, sans-serif" font-size="18" fill="#64748b" text-anchor="middle">
    Monitor all three branches of government with transparent data
  </text>
</svg>`;

console.log('Generating screenshots...\n');

// Convert and save mobile screenshot
const mobileResvg = new Resvg(mobileSVG);
const mobilePNG = mobileResvg.render().asPng();
createWriteStream(join(publicDir, 'screenshot-mobile.png')).write(mobilePNG);
console.log('✓ Generated screenshot-mobile.png');

// Convert and save desktop screenshot
const desktopResvg = new Resvg(desktopSVG);
const desktopPNG = desktopResvg.render().asPng();
createWriteStream(join(publicDir, 'screenshot-desktop.png')).write(desktopPNG);
console.log('✓ Generated screenshot-desktop.png');

console.log('\n✨ Screenshots generated successfully!\n');
