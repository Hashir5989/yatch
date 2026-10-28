const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processLogo() {
  const inputPath = 'C:/Users/Hashir/.gemini/antigravity-ide/brain/518f9055-998b-4643-a27c-e6e767089b0c/.user_uploaded/media_1793196299594.jpg';
  const publicImagesDir = path.join(__dirname, '..', 'public', 'images');
  const publicDir = path.join(__dirname, '..', 'public');
  const appDir = path.join(__dirname, '..', 'app');

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found at ${inputPath}`);
  }

  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  console.log(`Processing input image: ${w}x${h}`);

  // Background threshold: white is > 248
  // Foreground core: lum < 65
  const bgThreshold = 250;
  const fgThreshold = 60;

  // 1. Generate full RGBA buffers (both Platinum-White for dark backgrounds and Charcoal for light backgrounds)
  const whiteBuffer = Buffer.alloc(w * h * 4);
  const charcoalBuffer = Buffer.alloc(w * h * 4);

  for (let i = 0; i < w * h; i++) {
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    let alpha = 0;
    if (lum <= fgThreshold) {
      alpha = 255;
    } else if (lum < bgThreshold) {
      const t = (bgThreshold - lum) / (bgThreshold - fgThreshold);
      const smoothT = t * t * (3 - 2 * t);
      alpha = Math.round(smoothT * 255);
    } else {
      alpha = 0;
    }

    // White / Platinum variant (ideal for dark luxury UI backgrounds)
    whiteBuffer[i * 4] = 255;
    whiteBuffer[i * 4 + 1] = 255;
    whiteBuffer[i * 4 + 2] = 255;
    whiteBuffer[i * 4 + 3] = alpha;

    // Original Charcoal variant (ideal for light / print backgrounds)
    charcoalBuffer[i * 4] = 46;
    charcoalBuffer[i * 4 + 1] = 46;
    charcoalBuffer[i * 4 + 2] = 48;
    charcoalBuffer[i * 4 + 3] = alpha;
  }

  // Helper to trim and optionally add subtle padding
  async function saveTrimmed(rawBuf, outPath, padX = 0, padY = 0) {
    const trimmed = await sharp(rawBuf, { raw: { width: w, height: h, channels: 4 } })
      .trim()
      .toBuffer({ resolveWithObject: true });

    let finalImg = sharp(trimmed.data, { raw: { width: trimmed.info.width, height: trimmed.info.height, channels: 4 } });
    if (padX > 0 || padY > 0) {
      finalImg = finalImg.extend({
        top: padY,
        bottom: padY,
        left: padX,
        right: padX,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      });
    }
    await finalImg.png().toFile(outPath);
    console.log(`Saved: ${outPath} (${trimmed.info.width}x${trimmed.info.height})`);
    return trimmed.info;
  }

  // 1. Full Stacked Logo (White & Charcoal)
  const fullWhiteMeta = await saveTrimmed(whiteBuffer, path.join(publicImagesDir, 'asmaraty-logo.png'), 8, 8);
  await saveTrimmed(whiteBuffer, path.join(publicImagesDir, 'asmaraty-logo-cropped.png'), 4, 4);
  await saveTrimmed(charcoalBuffer, path.join(publicImagesDir, 'asmaraty-logo-dark.png'), 8, 8);

  // 2. Extract Wings Emblem (Y: 140 to 405)
  async function extractRegion(rawBuf, minY, maxY, outPath) {
    const regionH = maxY - minY;
    const regionBuf = Buffer.alloc(w * regionH * 4);
    for (let y = 0; y < regionH; y++) {
      const srcY = minY + y;
      for (let x = 0; x < w; x++) {
        const srcIdx = (srcY * w + x) * 4;
        const destIdx = (y * w + x) * 4;
        regionBuf[destIdx] = rawBuf[srcIdx];
        regionBuf[destIdx + 1] = rawBuf[srcIdx + 1];
        regionBuf[destIdx + 2] = rawBuf[srcIdx + 2];
        regionBuf[destIdx + 3] = rawBuf[srcIdx + 3];
      }
    }
    const trimmed = await sharp(regionBuf, { raw: { width: w, height: regionH, channels: 4 } })
      .trim()
      .toBuffer({ resolveWithObject: true });

    await sharp(trimmed.data, { raw: { width: trimmed.info.width, height: trimmed.info.height, channels: 4 } })
      .png()
      .toFile(outPath);
    console.log(`Saved: ${outPath} (${trimmed.info.width}x${trimmed.info.height})`);
    return trimmed;
  }

  // Emblem (Wings only)
  const emblemWhite = await extractRegion(whiteBuffer, 140, 405, path.join(publicImagesDir, 'asmaraty-emblem.png'));
  await extractRegion(charcoalBuffer, 140, 405, path.join(publicImagesDir, 'asmaraty-emblem-dark.png'));

  // Wordmark ("ASMARATY" + "Y A C H T S")
  await extractRegion(whiteBuffer, 410, 560, path.join(publicImagesDir, 'asmaraty-wordmark.png'));
  await extractRegion(charcoalBuffer, 410, 560, path.join(publicImagesDir, 'asmaraty-wordmark-dark.png'));

  // 3. Generate High-Res Icons & Favicons using the new wings emblem
  // 512x512 App Icon: centered emblem with luxury padding
  const embW = emblemWhite.info.width;
  const embH = emblemWhite.info.height;
  const targetW = 440;
  const targetH = Math.round(embH * (targetW / embW));

  const resizedEmblemBuf = await sharp(emblemWhite.data, {
    raw: { width: embW, height: embH, channels: 4 }
  })
    .resize(targetW, targetH, { fit: 'contain' })
    .png()
    .toBuffer();

  const icon512 = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([
      {
        input: resizedEmblemBuf,
        top: Math.round((512 - targetH) / 2),
        left: Math.round((512 - targetW) / 2)
      }
    ])
    .png()
    .toBuffer();

  // Save 512x512 icons
  await sharp(icon512).toFile(path.join(publicDir, 'icon.png'));
  await sharp(icon512).toFile(path.join(appDir, 'icon.png'));
  console.log('Saved 512x512 icons');

  // Apple touch icon (180x180)
  await sharp(icon512).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Saved 180x180 apple-touch-icon.png');

  // Favicons (64x64 & 32x32)
  await sharp(icon512).resize(64, 64).png().toFile(path.join(publicDir, 'favicon.png'));
  await sharp(icon512).resize(32, 32).png().toFile(path.join(publicDir, 'favicon.ico'));
  await sharp(icon512).resize(32, 32).png().toFile(path.join(appDir, 'favicon.ico'));
  console.log('Saved favicons');

  console.log('✨ All logo variants, emblems, wordmarks, and app icons generated successfully!');
}

processLogo().catch(err => {
  console.error('Error processing logo:', err);
  process.exit(1);
});
