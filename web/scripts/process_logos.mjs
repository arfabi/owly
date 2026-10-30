import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const webPublic = path.resolve(__dirname, "../public");
const extPublic = path.resolve(__dirname, "../../extension/public");
const extIcons = path.resolve(extPublic, "icons");

if (!fs.existsSync(extIcons)) {
  fs.mkdirSync(extIcons, { recursive: true });
}

async function removeBgFloodFill(inputPath, thresh = 30) {
  const image = sharp(inputPath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  const numPixels = w * h;
  const visited = new Uint8Array(numPixels);
  const queue = new Int32Array(numPixels);
  let queueEnd = 0;

  function diffFromWhite(idx) {
    const r = data[idx * 3];
    const g = data[idx * 3 + 1];
    const b = data[idx * 3 + 2];
    return Math.sqrt((255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2);
  }

  // Seed borders
  for (let x = 0; x < w; x++) {
    if (diffFromWhite(x) < thresh) { visited[x] = 1; queue[queueEnd++] = x; }
    const bot = (h - 1) * w + x;
    if (diffFromWhite(bot) < thresh) { visited[bot] = 1; queue[queueEnd++] = bot; }
  }
  for (let y = 0; y < h; y++) {
    const left = y * w;
    if (!visited[left] && diffFromWhite(left) < thresh) { visited[left] = 1; queue[queueEnd++] = left; }
    const right = y * w + (w - 1);
    if (!visited[right] && diffFromWhite(right) < thresh) { visited[right] = 1; queue[queueEnd++] = right; }
  }

  let head = 0;
  while (head < queueEnd) {
    const curr = queue[head++];
    const cx = curr % w;
    const cy = Math.floor(curr / w);

    if (cx > 0) {
      const n = curr - 1;
      if (!visited[n] && diffFromWhite(n) < thresh) { visited[n] = 1; queue[queueEnd++] = n; }
    }
    if (cx < w - 1) {
      const n = curr + 1;
      if (!visited[n] && diffFromWhite(n) < thresh) { visited[n] = 1; queue[queueEnd++] = n; }
    }
    if (cy > 0) {
      const n = curr - w;
      if (!visited[n] && diffFromWhite(n) < thresh) { visited[n] = 1; queue[queueEnd++] = n; }
    }
    if (cy < h - 1) {
      const n = curr + w;
      if (!visited[n] && diffFromWhite(n) < thresh) { visited[n] = 1; queue[queueEnd++] = n; }
    }
  }

  // Build RGBA output buffer
  const outBuffer = Buffer.alloc(numPixels * 4);
  for (let i = 0; i < numPixels; i++) {
    const srcIdx = i * 3;
    const dstIdx = i * 4;
    const r = data[srcIdx];
    const g = data[srcIdx + 1];
    const b = data[srcIdx + 2];

    outBuffer[dstIdx] = r;
    outBuffer[dstIdx + 1] = g;
    outBuffer[dstIdx + 2] = b;

    if (visited[i] === 1) {
      outBuffer[dstIdx + 3] = 0; // Transparent
    } else {
      outBuffer[dstIdx + 3] = 255;
    }
  }

  // Find bounding box of non-transparent content to trim excess empty padding nicely
  let minX = w, maxX = 0, minY = h, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      if (outBuffer[idx + 3] > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Add slight margin around bounding box (square aspect ratio)
  const contentW = maxX - minX + 1;
  const contentH = maxY - minY + 1;
  const maxDim = Math.max(contentW, contentH);
  const pad = Math.round(maxDim * 0.05); // 5% padding
  const size = maxDim + pad * 2;

  const centerX = Math.round((minX + maxX) / 2);
  const centerY = Math.round((minY + maxY) / 2);

  const cropX = Math.max(0, Math.min(w - size, centerX - Math.floor(size / 2)));
  const cropY = Math.max(0, Math.min(h - size, centerY - Math.floor(size / 2)));
  const cropSize = Math.min(size, w - cropX, h - cropY);

  const rawTransparent = sharp(outBuffer, {
    raw: { width: w, height: h, channels: 4 }
  });

  const trimmed = rawTransparent.extract({
    left: cropX,
    top: cropY,
    width: cropSize,
    height: cropSize
  });

  return trimmed;
}

async function main() {
  const logos = [
    { src: "logo.png", baseName: "logo" },
    { src: "logo-on.png", baseName: "logo-on" },
    { src: "logo-off.png", baseName: "logo-off" },
  ];

  for (const { src, baseName } of logos) {
    const inputPath = path.join(webPublic, src);
    if (!fs.existsSync(inputPath)) {
      console.warn("File not found:", inputPath);
      continue;
    }

    console.log(`Processing ${src}...`);
    // Backup original if not backed up yet
    const backupPath = path.join(webPublic, `${baseName}-original.png`);
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(inputPath, backupPath);
    }

    const processed = await removeBgFloodFill(backupPath, 30);
    const pngBuffer = await processed.png({ quality: 100, compressionLevel: 9 }).toBuffer();

    // Save transparent to web/public
    fs.writeFileSync(path.join(webPublic, `${baseName}.png`), pngBuffer);
    console.log(`Saved transparent ${baseName}.png to web/public`);

    // Save transparent to extension/public
    fs.writeFileSync(path.join(extPublic, `${baseName}.png`), pngBuffer);
    console.log(`Saved transparent ${baseName}.png to extension/public`);

    // Generate extension icons (16, 32, 48, 128)
    const iconPrefix = baseName === "logo" ? "icon" : `icon-${baseName.replace("logo-", "")}`;
    for (const sz of [16, 32, 48, 128]) {
      const resized = await sharp(pngBuffer).resize(sz, sz).png().toBuffer();
      fs.writeFileSync(path.join(extIcons, `${iconPrefix}-${sz}.png`), resized);
    }
    console.log(`Generated icons for ${iconPrefix} (16, 32, 48, 128)`);
  }

  console.log("All logos processed successfully!");
}

main().catch(err => {
  console.error("Error processing logos:", err);
  process.exit(1);
});
