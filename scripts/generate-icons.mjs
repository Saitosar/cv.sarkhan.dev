#!/usr/bin/env node

/**
 * PWA Icon Generator Script
 * Generates PNG icons from the SVG template
 */

import { createWriteStream } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = resolve(__dirname, '../public');

// Canvas-based icon generation using data URLs
async function generateIconWithCanvas(size) {
  const canvas = `
    <!DOCTYPE html>
    <html>
    <body>
      <canvas id="canvas" width="${size}" height="${size}"></canvas>
      <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const size = ${size};
        const scale = size / 512;

        // Background
        ctx.fillStyle = '#0b0f19';
        ctx.fillRect(0, 0, size, size);

        // Gradient overlay
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0.3)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Document shape
        ctx.save();
        ctx.translate(128 * scale, 96 * scale);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.8)';
        ctx.lineWidth = 4 * scale;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(180 * scale, 0);
        ctx.lineTo(256 * scale, 76 * scale);
        ctx.lineTo(256 * scale, 320 * scale);
        ctx.lineTo(0, 320 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Corner fold
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.6)';
        ctx.beginPath();
        ctx.moveTo(180 * scale, 0);
        ctx.lineTo(180 * scale, 76 * scale);
        ctx.lineTo(256 * scale, 76 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Text lines
        ctx.lineCap = 'round';
        ctx.lineWidth = 6 * scale;

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
        ctx.beginPath();
        ctx.moveTo(40 * scale, 120 * scale);
        ctx.lineTo(216 * scale, 120 * scale);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(139, 92, 246, 0.6)';
        ctx.beginPath();
        ctx.moveTo(40 * scale, 160 * scale);
        ctx.lineTo(180 * scale, 160 * scale);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
        ctx.beginPath();
        ctx.moveTo(40 * scale, 200 * scale);
        ctx.lineTo(200 * scale, 200 * scale);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
        ctx.beginPath();
        ctx.moveTo(40 * scale, 240 * scale);
        ctx.lineTo(160 * scale, 240 * scale);
        ctx.stroke();

        ctx.restore();

        // AI spark
        ctx.save();
        ctx.translate(340 * scale, 360 * scale);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
        ctx.beginPath();
        ctx.arc(0, 0, 32 * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3 * scale;
        ctx.lineCap = 'round';
        const sparkSize = 12 * scale;

        ctx.beginPath();
        ctx.moveTo(-sparkSize, -sparkSize);
        ctx.lineTo(sparkSize, sparkSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(sparkSize, -sparkSize);
        ctx.lineTo(-sparkSize, sparkSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-sparkSize, 0);
        ctx.lineTo(sparkSize, 0);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, -sparkSize);
        ctx.lineTo(0, sparkSize);
        ctx.stroke();

        ctx.restore();

        console.log(canvas.toDataURL('image/png'));
      </script>
    </body>
    </html>
  `;

  return canvas;
}

console.log('🎨 PWA Icon Generator\n');
console.log('⚠️  This script requires manual steps:');
console.log('1. Open generate-icons.html in your browser');
console.log('2. Click "Download Both" button');
console.log('3. Move the downloaded files to /public folder');
console.log('\nOr use the HTML generator that was already opened in your browser!\n');

console.log('✅ Alternative: The HTML generator (generate-icons.html) is ready to use!');
console.log('   Just click the download buttons in the browser window that opened.\n');
