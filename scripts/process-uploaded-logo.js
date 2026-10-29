const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processUploadedLogo() {
  const inputPath = 'C:/Users/Hashir/.gemini/antigravity-ide/brain/7ff606e0-a62d-4b8e-80e1-68a899001718/.user_uploaded/media_1793284316967.png';
  const publicImagesDir = path.join(__dirname, '..', 'public', 'images');

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found at ${inputPath}`);
  }

  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  console.log(`Processing uploaded image: ${w}x${h}`);

  // Create clean White (for dark UI) and Charcoal (for light surfaces) buffers
  const whiteBuffer = Buffer.alloc(w * h * 4);
  const charcoalBuffer = Buffer.alloc(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;

      // Filter out watermark/sparkle icon at bottom right (x > 930 and y > 600)
      if (x > 930 && y > 600) {
        whiteBuffer[idx] = 255;
        whiteBuffer[idx + 1] = 255;
        whiteBuffer[idx + 2] = 255;
        whiteBuffer[idx + 3] = 0;

        charcoalBuffer[idx] = 46;
        charcoalBuffer[idx + 1] = 46;
        charcoalBuffer[idx + 2] = 48;
        charcoalBuffer[idx + 3] = 0;
        continue;
      }

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Checkerboard tiles are around lum 80-135.
      // Pure white logo is lum > 245.
      // Smooth anti-aliasing interpolation between 135 and 245
      let alpha = 0;
      if (lum <= 135) {
        alpha = 0;
      } else if (lum >= 245) {
        alpha = 255;
      } else {
        const t = (lum - 135) / (245 - 135);
        // Smoothstep curve for ultra-clean, anti-aliased edge
        const smoothT = t * t * (3 - 2 * t);
        alpha = Math.round(smoothT * 255);
      }

      // White/Platinum variant (ideal for luxury dark UI backgrounds)
      whiteBuffer[idx] = 255;
      whiteBuffer[idx + 1] = 255;
      whiteBuffer[idx + 2] = 255;
      whiteBuffer[idx + 3] = alpha;

      // Charcoal variant (ideal for light / print surfaces)
      charcoalBuffer[idx] = 46;
      charcoalBuffer[idx + 1] = 46;
      charcoalBuffer[idx + 2] = 48;
      charcoalBuffer[idx + 3] = alpha;
    }
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
    console.log(`Saved: ${outPath} (${trimmed.info.width + padX * 2}x${trimmed.info.height + padY * 2})`);
    return trimmed.info;
  }

  // 1. Full Stacked Logo (White & Charcoal)
  await saveTrimmed(whiteBuffer, path.join(publicImagesDir, 'asmaraty-logo.png'), 6, 6);
  await saveTrimmed(whiteBuffer, path.join(publicImagesDir, 'asmaraty-logo-cropped.png'), 2, 2);
  await saveTrimmed(charcoalBuffer, path.join(publicImagesDir, 'asmaraty-logo-dark.png'), 6, 6);

  // Helper to extract a vertical band
  // In original image:
  // Wings emblem: y from 145 to 420
  // "ASMARATY" title: y from 425 to 510
  // "YACHTS" subtitle: y from 520 to 570
  // Full wordmark ("ASMARATY" + "YACHTS"): y from 425 to 570
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

  // 2. Wings Emblem Only
  await extractRegion(whiteBuffer, 140, 425, path.join(publicImagesDir, 'asmaraty-emblem.png'), 4, 4);
  await extractRegion(charcoalBuffer, 140, 425, path.join(publicImagesDir, 'asmaraty-emblem-dark.png'), 4, 4);

  // 3. Wordmark ("ASMARATY" + "Y A C H T S")
  await extractRegion(whiteBuffer, 425, 575, path.join(publicImagesDir, 'asmaraty-wordmark.png'), 4, 4);
  await extractRegion(charcoalBuffer, 425, 575, path.join(publicImagesDir, 'asmaraty-wordmark-dark.png'), 4, 4);

  // 4. Title Only ("ASMARATY")
  await extractRegion(whiteBuffer, 425, 520, path.join(publicImagesDir, 'asmaraty-title.png'), 4, 4);
  await extractRegion(charcoalBuffer, 425, 520, path.join(publicImagesDir, 'asmaraty-title-dark.png'), 4, 4);

  console.log('🎉 All logo assets successfully generated and saved to public/images!');
}

processUploadedLogo().catch(err => {
  console.error('Error processing logo:', err);
  process.exit(1);
});
