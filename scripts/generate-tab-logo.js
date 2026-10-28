const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generate() {
  const oldLogoPath = path.join(process.cwd(), 'scratch', 'old_logo.png');
  if (!fs.existsSync(oldLogoPath)) {
    console.error('scratch/old_logo.png not found');
    return;
  }

  // Trim old metal logo to tight bounds
  const trimmed = await sharp(oldLogoPath).trim().toBuffer({ resolveWithObject: true });
  console.log('Trimmed metal logo:', trimmed.info);

  // We want a 512x512 canvas with transparent background
  // The logo is wider than tall (ratio ~ 638 / 251 ~= 2.54)
  // Let's fit it inside 490x490, centered on 512x512
  const targetWidth = 490;
  const resizedLogo = await sharp(trimmed.data)
    .resize(targetWidth, null, {
      kernel: sharp.kernel.lanczos3
    })
    .toBuffer({ resolveWithObject: true });

  console.log('Resized logo info:', resizedLogo.info);

  // Composite onto 512x512 transparent canvas
  const canvas512 = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    {
      input: resizedLogo.data,
      top: Math.round((512 - resizedLogo.info.height) / 2),
      left: Math.round((512 - resizedLogo.info.width) / 2)
    }
  ])
  .png()
  .toBuffer();

  // Save 512x512 to public/icon.png and app/icon.png
  fs.writeFileSync(path.join(process.cwd(), 'public', 'icon.png'), canvas512);
  fs.writeFileSync(path.join(process.cwd(), 'app', 'icon.png'), canvas512);
  console.log('Saved 512x512 icon.png to public/ and app/');

  // Generate apple-touch-icon (180x180)
  const apple180 = await sharp(canvas512).resize(180, 180, { kernel: sharp.kernel.lanczos3 }).png().toBuffer();
  fs.writeFileSync(path.join(process.cwd(), 'public', 'apple-touch-icon.png'), apple180);
  console.log('Saved 180x180 apple-touch-icon.png');

  // Generate favicon-64x64
  const fav64 = await sharp(canvas512).resize(64, 64, { kernel: sharp.kernel.lanczos3 }).png().toBuffer();
  fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon.png'), fav64);
  console.log('Saved 64x64 favicon.png');

  // Generate favicon-32x32 for favicon.ico
  const fav32 = await sharp(canvas512).resize(32, 32, { kernel: sharp.kernel.lanczos3 }).png().toBuffer();
  fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon.ico'), fav32);
  fs.writeFileSync(path.join(process.cwd(), 'app', 'favicon.ico'), fav32);
  console.log('Saved favicon.ico to public/ and app/');

  // Also save a dedicated public/images/asmaraty-metal-tab-logo.png for reference
  fs.writeFileSync(path.join(process.cwd(), 'public', 'images', 'asmaraty-metal-tab-logo.png'), canvas512);
  console.log('All tab logo assets generated successfully!');
}

generate().catch(console.error);
