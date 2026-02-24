#!/usr/bin/env node
/**
 * Generate favicon package from the site logo.
 * Outputs: favicon.ico, favicon-16x16.png, favicon-32x32.png,
 *          apple-touch-icon.png, android-chrome-192x192.png, android-chrome-512x512.png,
 *          and site.webmanifest.
 *
 * Usage: node scripts/generate-favicons.mjs
 * Source: assets/logo_tranp.png
 * Output: project root
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import toIco from 'to-ico';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const srcPath = path.join(rootDir, 'assets', 'logo_tranp.png');

async function resizePng(inputPath, size) {
  return sharp(inputPath)
    .resize(size, size)
    .png()
    .toBuffer();
}

async function main() {
  if (!fs.existsSync(srcPath)) {
    console.error('Source logo not found:', srcPath);
    process.exit(1);
  }

  console.log('Generating favicon package from', srcPath);

  // Single-size PNGs
  const singleSizes = [
    ['favicon-16x16.png', 16],
    ['favicon-32x32.png', 32],
    ['apple-touch-icon.png', 180],
    ['android-chrome-192x192.png', 192],
    ['android-chrome-512x512.png', 512],
  ];

  for (const [filename, size] of singleSizes) {
    const buf = await resizePng(srcPath, size);
    const outPath = path.join(rootDir, filename);
    fs.writeFileSync(outPath, buf);
    console.log('  wrote', filename);
  }

  // Multi-size favicon.ico (16, 32, 48)
  const icoSizes = [16, 32, 48];
  const icoBuffers = await Promise.all(
    icoSizes.map((size) => resizePng(srcPath, size))
  );
  const ico = await toIco(icoBuffers);
  fs.writeFileSync(path.join(rootDir, 'favicon.ico'), ico);
  console.log('  wrote favicon.ico');

  // Web app manifest
  const manifest = {
    name: 'Big Sky Dev Con',
    short_name: 'BSDC',
    description: "Montana's summer technology conference",
    start_url: '/',
    display: 'standalone',
    background_color: '#0f0f1a',
    theme_color: '#8b5cf6',
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
  fs.writeFileSync(
    path.join(rootDir, 'site.webmanifest'),
    JSON.stringify(manifest, null, 2)
  );
  console.log('  wrote site.webmanifest');

  console.log('Favicon package complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
