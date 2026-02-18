#!/usr/bin/env node

/**
 * Generate PWA icons for Accountability Dashboard
 * Creates PNG icons in various sizes with the brand theme color
 */

import { createWriteStream } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = join(__dirname, '..', 'public');

// Brand colors
const brandColor = '#3b82f6'; // Blue
const bgColor = '#ffffff'; // White

// Simple SVG icon template with a building/capitol design
function generateSVGIcon(size) {
  const padding = size * 0.1;
  const iconSize = size - (padding * 2);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="${bgColor}"/>
  
  <!-- Capitol building icon -->
  <g transform="translate(${padding}, ${padding})">
    <!-- Base -->
    <rect x="${iconSize * 0.2}" y="${iconSize * 0.7}" width="${iconSize * 0.6}" height="${iconSize * 0.25}" fill="${brandColor}"/>
    
    <!-- Columns -->
    <rect x="${iconSize * 0.25}" y="${iconSize * 0.4}" width="${iconSize * 0.08}" height="${iconSize * 0.3}" fill="${brandColor}"/>
    <rect x="${iconSize * 0.43}" y="${iconSize * 0.4}" width="${iconSize * 0.08}" height="${iconSize * 0.3}" fill="${brandColor}"/>
    <rect x="${iconSize * 0.61}" y="${iconSize * 0.4}" width="${iconSize * 0.08}" height="${iconSize * 0.3}" fill="${brandColor}"/>
    
    <!-- Roof triangle -->
    <polygon points="${iconSize * 0.5},${iconSize * 0.05} ${iconSize * 0.15},${iconSize * 0.4} ${iconSize * 0.85},${iconSize * 0.4}" fill="${brandColor}"/>
    
    <!-- Dome circle -->
    <circle cx="${iconSize * 0.5}" cy="${iconSize * 0.2}" r="${iconSize * 0.12}" fill="${brandColor}"/>
    <rect x="${iconSize * 0.45}" y="${iconSize * 0.15}" width="${iconSize * 0.1}" height="${iconSize * 0.25}" fill="${brandColor}"/>
  </g>
</svg>`;
}

// Generate maskable icons (with safe zone padding)
function generateMaskableSVGIcon(size) {
  const padding = size * 0.2; // 20% safe zone for maskable icons
  const iconSize = size - (padding * 2);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="${brandColor}"/>
  
  <!-- Capitol building icon (white on blue for maskable) -->
  <g transform="translate(${padding}, ${padding})">
    <!-- Base -->
    <rect x="${iconSize * 0.2}" y="${iconSize * 0.7}" width="${iconSize * 0.6}" height="${iconSize * 0.25}" fill="${bgColor}"/>
    
    <!-- Columns -->
    <rect x="${iconSize * 0.25}" y="${iconSize * 0.4}" width="${iconSize * 0.08}" height="${iconSize * 0.3}" fill="${bgColor}"/>
    <rect x="${iconSize * 0.43}" y="${iconSize * 0.4}" width="${iconSize * 0.08}" height="${iconSize * 0.3}" fill="${bgColor}"/>
    <rect x="${iconSize * 0.61}" y="${iconSize * 0.4}" width="${iconSize * 0.08}" height="${iconSize * 0.3}" fill="${bgColor}"/>
    
    <!-- Roof triangle -->
    <polygon points="${iconSize * 0.5},${iconSize * 0.05} ${iconSize * 0.15},${iconSize * 0.4} ${iconSize * 0.85},${iconSize * 0.4}" fill="${bgColor}"/>
    
    <!-- Dome circle -->
    <circle cx="${iconSize * 0.5}" cy="${iconSize * 0.2}" r="${iconSize * 0.12}" fill="${bgColor}"/>
    <rect x="${iconSize * 0.45}" y="${iconSize * 0.15}" width="${iconSize * 0.1}" height="${iconSize * 0.25}" fill="${bgColor}"/>
  </g>
</svg>`;
}

console.log('Generating PWA icons...\n');

// Generate regular icons
for (const size of sizes) {
  const svgContent = generateSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = join(publicDir, filename);
  
  createWriteStream(filepath).write(svgContent);
  console.log(`✓ Generated ${filename}`);
}

// Generate maskable icons (192x192 and 512x512)
for (const size of [192, 512]) {
  const svgContent = generateMaskableSVGIcon(size);
  const filename = `icon-maskable-${size}x${size}.svg`;
  const filepath = join(publicDir, filename);
  
  createWriteStream(filepath).write(svgContent);
  console.log(`✓ Generated ${filename}`);
}

console.log('\n✨ All PWA icons generated successfully!');
console.log('\nNote: SVG icons are generated. For PNG conversion, use:');
console.log('  npm run icons:convert\n');
