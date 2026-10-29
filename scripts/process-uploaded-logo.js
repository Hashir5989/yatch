const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processOfficialLogo() {
  const inputPath = 'C:/Users/Hashir/.gemini/antigravity-ide/brain/7ff606e0-a62d-4b8e-80e1-68a899001718/.user_uploaded/media_1793285629970.jpg';
  const publicImagesDir = path.join(__dirname, '..', 'public', 'images');

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found at ${inputPath}`);
  }

  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  console.log(`Processing official brand logo: ${w}x${h}`);

  const bgThreshold = 250;
  const fgThreshold = 50;

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
    } else if (lum >= bgThreshold) {
      alpha = 0;
    } else {
      const t = (bgThreshold - lum) / (bgThreshold - fgThreshold);
      const smoothT = t * t * (3 - 2 * t);
      alpha = Math.round(smoothT * 255);
    }

    // White / Platinum variant (for dark luxury backgrounds)
    whiteBuffer[i * 4] = 255;
    whiteBuffer[i * 4 + 1] = 255;
    whiteBuffer[i * 4 + 2] = 255;
    whiteBuffer[i * 4 + 3] = alpha;

    // Dark Charcoal variant (for light / white backgrounds like The Fleet section)
    charcoalBuffer[i * 4] = 32;
    charcoalBuffer[i * 4 + 1] = 35;
    charcoalBuffer[i * 4 + 2] = 42;
    charcoalBuffer[i * 4 + 3] = alpha;
  }

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
    console.log(`Saved: ${outPath} (${trimmed.info.width + padX * 2}x${trimmed.info.height + padY * 2})`);
    return trimmed.info;
  }

  // 1. Full Stacked Logo (White & Charcoal)
  await saveTrimmed(whiteBuffer, path.join(publicImagesDir, 'asmaraty-logo.png'), 6, 6);
  await saveTrimmed(whiteBuffer, path.join(publicImagesDir, 'asmaraty-logo-cropped.png'), 2, 2);
  await saveTrimmed(charcoalBuffer, path.join(publicImagesDir, 'asmaraty-logo-dark.png'), 6, 6);

  async function extractRegion(rawBuf, minY, maxY, outPath, padX = 0, padY = 0) {
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
    console.log(`Saved: ${outPath} (${trimmed.info.width + padX * 2}x${trimmed.info.height + padY * 2})`);
    return trimmed;
  }

  // 2. Wings Emblem Only (y: 140 to 405)
  await extractRegion(whiteBuffer, 140, 405, path.join(publicImagesDir, 'asmaraty-emblem.png'), 4, 4);
  await extractRegion(charcoalBuffer, 140, 405, path.join(publicImagesDir, 'asmaraty-emblem-dark.png'), 4, 4);

  // 3. Wordmark ("ASMARATY" + "Y A C H T S") (y: 415 to 555)
  await extractRegion(whiteBuffer, 415, 555, path.join(publicImagesDir, 'asmaraty-wordmark.png'), 4, 4);
  await extractRegion(charcoalBuffer, 415, 555, path.join(publicImagesDir, 'asmaraty-wordmark-dark.png'), 4, 4);

  // 4. Title Only ("ASMARATY") (y: 415 to 498)
  await extractRegion(whiteBuffer, 415, 498, path.join(publicImagesDir, 'asmaraty-title.png'), 4, 4);
  await extractRegion(charcoalBuffer, 415, 498, path.join(publicImagesDir, 'asmaraty-title-dark.png'), 4, 4);

  console.log('🎉 Official ASMARATY logo variants regenerated with ultra-clean alpha channels!');
}

processOfficialLogo().catch(err => {
  console.error('Error processing logo:', err);
  process.exit(1);
});
