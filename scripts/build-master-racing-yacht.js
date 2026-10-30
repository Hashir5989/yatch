const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function buildMasterRacingYacht() {
  const src = path.resolve('user_uploads/WhatsApp Image 2026-10-30 at 8.51.59 PM.jpeg');
  const dst1 = path.resolve('public/images/asmaraty-racing-yacht-journey.jpg');
  const dst2 = path.resolve('public/images/asmaraty-four-yachts-journey.jpg');

  if (!fs.existsSync(src)) {
    throw new Error('Source file not found: ' + src);
  }

  // Generate 2560x1440 high-definition master
  await sharp(src)
    .resize(2560, 1440, {
      fit: 'cover',
      position: 'center'
    })
    .modulate({
      brightness: 0.98,
      saturation: 1.06
    })
    .sharpen({
      sigma: 1.0,
      m1: 0.8,
      m2: 1.8
    })
    .jpeg({
      quality: 95,
      chromaSubsampling: '4:4:4',
      mozjpeg: true
    })
    .toFile(dst1);

  // Also copy to asmaraty-four-yachts-journey.jpg for zero-config fallback
  fs.copyFileSync(dst1, dst2);

  const stat = fs.statSync(dst1);
  console.log(`Success! Created master racing yacht background (${(stat.size / 1024).toFixed(1)} KB)`);
}

buildMasterRacingYacht().catch(console.error);

