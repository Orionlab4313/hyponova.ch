#!/usr/bin/env node
// Optimiert alle PNG/JPG Bilder in public/images/ zu WebP.
// - Erzeugt {name}.webp neben {name}.png (Originals bleiben fuer Fallback und next/image static import)
// - Erzeugt zusaetzlich responsive Varianten: {name}-640w.webp und {name}-1280w.webp
// - Logged Vorher/Nachher Bytegroesse
//
// Aufruf:
//   node scripts/optimize-images.mjs
//
// Setzt voraus: sharp ist installiert (npm install --save-dev sharp)

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const IMAGES_DIR = path.join(ROOT, "public", "images");

const QUALITY = 82;
const WIDTHS = [640, 1280]; // responsive Sets fuer srcSet

const EXTS = new Set([".png", ".jpg", ".jpeg"]);

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

async function listSourceImages(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!EXTS.has(ext)) continue;
    out.push(entry.name);
  }
  return out;
}

async function optimizeOne(name) {
  const srcPath = path.join(IMAGES_DIR, name);
  const baseName = name.replace(/\.(png|jpe?g)$/i, "");
  const srcStat = await fs.stat(srcPath);

  const buf = await fs.readFile(srcPath);
  const meta = await sharp(buf).metadata();
  const srcW = meta.width ?? 0;
  const srcH = meta.height ?? 0;

  // 1. Same-size WebP daneben (drop-in Ersatz)
  const sameWebpPath = path.join(IMAGES_DIR, `${baseName}.webp`);
  const sameBuf = await sharp(buf).webp({ quality: QUALITY }).toBuffer();
  await fs.writeFile(sameWebpPath, sameBuf);

  // 2. Responsive Varianten (nur kleiner als Source)
  const responsiveResults = [];
  for (const w of WIDTHS) {
    if (w >= srcW) continue; // upscaling vermeiden
    const outPath = path.join(IMAGES_DIR, `${baseName}-${w}w.webp`);
    const outBuf = await sharp(buf).resize({ width: w }).webp({ quality: QUALITY }).toBuffer();
    await fs.writeFile(outPath, outBuf);
    responsiveResults.push({ width: w, bytes: outBuf.length, path: outPath });
  }

  return {
    name,
    src: { width: srcW, height: srcH, bytes: srcStat.size },
    sameWebp: { bytes: sameBuf.length, path: sameWebpPath },
    responsive: responsiveResults,
  };
}

async function main() {
  try {
    await fs.access(IMAGES_DIR);
  } catch {
    console.error(`Image-Ordner nicht gefunden: ${IMAGES_DIR}`);
    process.exit(1);
  }

  const sources = await listSourceImages(IMAGES_DIR);
  if (sources.length === 0) {
    console.log("Keine Source-Bilder (.png/.jpg) gefunden.");
    return;
  }

  console.log(`Optimiere ${sources.length} Bilder in ${IMAGES_DIR}`);
  console.log("");

  let totalSrc = 0;
  let totalOut = 0;

  for (const name of sources) {
    try {
      const r = await optimizeOne(name);
      totalSrc += r.src.bytes;
      totalOut += r.sameWebp.bytes;
      const reduction = (1 - r.sameWebp.bytes / r.src.bytes) * 100;
      console.log(`[OK] ${r.name}`);
      console.log(`     Source:    ${r.src.width}x${r.src.height}, ${fmtBytes(r.src.bytes)}`);
      console.log(`     WebP same: ${fmtBytes(r.sameWebp.bytes)}  (-${reduction.toFixed(0)}%)`);
      for (const v of r.responsive) {
        console.log(`     WebP ${v.width}w: ${fmtBytes(v.bytes)}`);
      }
      console.log("");
    } catch (err) {
      console.error(`[FAIL] ${name}: ${err.message}`);
    }
  }

  console.log("---");
  console.log(`Gesamt-Source:  ${fmtBytes(totalSrc)}`);
  console.log(`Gesamt-WebP:    ${fmtBytes(totalOut)}  (-${((1 - totalOut / totalSrc) * 100).toFixed(0)}%)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
