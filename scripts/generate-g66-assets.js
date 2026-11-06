const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC_DIR = 'C:/Users/Hashir/OneDrive/Documents/yath/G66/ASMARATY G-66';
const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'yachts', 'g66');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function cleanHero1() {
  console.log('Processing hero-01.jpg (1.png)...');
  const src = `${SRC_DIR}/1.png`;
  const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Clean top-left logo (Alshaali Marine)
  for (let y = 90; y <= 440; y++) {
    for (let x = 180; x <= 1100; x++) {
      let srcX = 1200 + ((x - 180) % 300);
      let dstIdx = (y * width + x) * channels;
      let srcIdx = (y * width + srcX) * channels;

      let dx = Math.min(x - 180, 1100 - x);
      let dy = Math.min(y - 90, 440 - y);
      let dist = Math.min(dx, dy);
      let blend = dist < 40 ? dist / 40 : 1.0;

      for (let c = 0; c < 3; c++) {
        data[dstIdx + c] = Math.round(data[dstIdx + c] * (1 - blend) + data[srcIdx + c] * blend);
      }
    }
  }

  // Clean top-right logo (ASMARATY watermark)
  for (let y = 70; y <= 440; y++) {
    for (let x = 4850; x <= 5850; x++) {
      let srcX = 4450 + ((x - 4850) % 350);
      let dstIdx = (y * width + x) * channels;
      let srcIdx = (y * width + srcX) * channels;

      let dx = Math.min(x - 4850, 5850 - x);
      let dy = Math.min(y - 70, 440 - y);
      let dist = Math.min(dx, dy);
      let blend = dist < 40 ? dist / 40 : 1.0;

      for (let c = 0; c < 3; c++) {
        data[dstIdx + c] = Math.round(data[dstIdx + c] * (1 - blend) + data[srcIdx + c] * blend);
      }
    }
  }

  const outPath = path.join(OUT_DIR, 'hero-01.jpg');
  await sharp(data, { raw: { width, height, channels } })
    .resize(1920)
    .jpeg({ quality: 90 })
    .toFile(outPath);

  // Also update collection thumbnails
  await sharp(data, { raw: { width, height, channels } })
    .resize(1920)
    .jpeg({ quality: 90 })
    .toFile(path.join(__dirname, '..', 'public', 'images', 'yachts', 'g66-hd.jpg'));

  await sharp(data, { raw: { width, height, channels } })
    .resize(1200)
    .jpeg({ quality: 85 })
    .toFile(path.join(__dirname, '..', 'public', 'images', 'yachts', 'g66.jpg'));

  console.log('Saved hero-01.jpg and collection images');
}

async function cleanHero2() {
  console.log('Processing hero-02.jpg (38.png)...');
  const src = `${SRC_DIR}/38.png`;
  const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Clean top-right logo (ASMARATY watermark on 38.png)
  for (let y = 60; y <= 400; y++) {
    for (let x = 4900; x <= 5850; x++) {
      let srcX = 4400 + ((x - 4900) % 350);
      let dstIdx = (y * width + x) * channels;
      let srcIdx = (y * width + srcX) * channels;

      let dx = Math.min(x - 4900, 5850 - x);
      let dy = Math.min(y - 60, 400 - y);
      let dist = Math.min(dx, dy);
      let blend = dist < 35 ? dist / 35 : 1.0;

      for (let c = 0; c < 3; c++) {
        data[dstIdx + c] = Math.round(data[dstIdx + c] * (1 - blend) + data[srcIdx + c] * blend);
      }
    }
  }

  const outPath = path.join(OUT_DIR, 'hero-02.jpg');
  await sharp(data, { raw: { width, height, channels } })
    .resize(1920)
    .jpeg({ quality: 90 })
    .toFile(outPath);
  console.log('Saved hero-02.jpg');
}

async function exportInsignia() {
  console.log('Processing insignia.png (from 2.png)...');
  const src = `${SRC_DIR}/2.png`;
  const rawCrop = await sharp(src)
    .extract({ left: 2000, top: 1250, width: 2000, height: 950 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = rawCrop;
  const { width, height, channels } = info;

  for (let i = 0; i < data.length; i += channels) {
    let r = data[i], g = data[i+1], b = data[i+2];
    let diff = Math.sqrt((r - 247)**2 + (g - 244)**2 + (b - 237)**2);
    if (diff < 15) {
      data[i+3] = 0;
    } else if (diff < 35) {
      data[i+3] = Math.round(((diff - 15) / 20) * 255);
    }
  }

  const outPath = path.join(OUT_DIR, 'insignia.png');
  await sharp(data, { raw: { width, height, channels } })
    .trim()
    .resize(600)
    .png()
    .toFile(outPath);
  console.log('Saved insignia.png');
}

async function exportDeckPlans() {
  console.log('Processing 3D Deck Plans...');
  const cropBox = { left: 260, top: 810, width: 5480, height: 1770 };

  // Main Deck (30.png)
  await sharp(`${SRC_DIR}/30.png`)
    .extract(cropBox)
    .resize(1600, 517)
    .jpeg({ quality: 90 })
    .toFile(path.join(OUT_DIR, 'deck-main.jpg'));

  // Lower Deck (31.png)
  await sharp(`${SRC_DIR}/31.png`)
    .extract(cropBox)
    .resize(1600, 517)
    .jpeg({ quality: 90 })
    .toFile(path.join(OUT_DIR, 'deck-lower.jpg'));

  // Flybridge Deck (32.png)
  await sharp(`${SRC_DIR}/32.png`)
    .extract(cropBox)
    .resize(1600, 517)
    .jpeg({ quality: 90 })
    .toFile(path.join(OUT_DIR, 'deck-flybridge.jpg'));

  console.log('Saved 3D Deck Plans');
}

async function exportGallery() {
  console.log('Processing Gallery Images...');
  const items = [
    { page: '23.png', name: 'hero-03.jpg', w: 1920 },
    { page: '22.png', name: 'hero-04.jpg', w: 1920 },
    { page: '6.png', name: 'gallery-salon-fwd.jpg', w: 1600 },
    { page: '7.png', name: 'gallery-salon-aft.jpg', w: 1600 },
    { page: '8.png', name: 'gallery-salon-seating.jpg', w: 1600 },
    { page: '10.png', name: 'gallery-galley.jpg', w: 1600 },
    { page: '11.png', name: 'gallery-companionway.jpg', w: 1600 },
    { page: '12.png', name: 'gallery-master-bed.jpg', w: 1600 },
    { page: '13.png', name: 'gallery-master-lounge.jpg', w: 1600 },
    { page: '17.png', name: 'gallery-master-vanity.jpg', w: 1600 },
    { page: '18.png', name: 'gallery-master-wardrobe.jpg', w: 1600 },
    { page: '19.png', name: 'gallery-master-ensuite.jpg', w: 1600 },
    { page: '20.png', name: 'gallery-guest-twin.jpg', w: 1600 },
    { page: '21.png', name: 'gallery-guest-ensuite.jpg', w: 1600 },
    { page: '22.png', name: 'gallery-cockpit.jpg', w: 1600 },
    { page: '23.png', name: 'gallery-foredeck-bow.jpg', w: 1600 },
    { page: '24.png', name: 'gallery-foredeck-horizon.jpg', w: 1600 },
    { page: '26.png', name: 'gallery-fly-helm.jpg', w: 1600 },
    { page: '27.png', name: 'gallery-fly-lounge.jpg', w: 1600 },
    { page: '29.png', name: 'gallery-fly-terrace.jpg', w: 1600 },
  ];

  for (const item of items) {
    const src = `${SRC_DIR}/${item.page}`;
    const dest = path.join(OUT_DIR, item.name);
    await sharp(src)
      .resize(item.w)
      .jpeg({ quality: 88 })
      .toFile(dest);
    console.log(`Saved ${item.name}`);
  }
}

async function main() {
  await cleanHero1();
  await cleanHero2();
  await exportInsignia();
  await exportDeckPlans();
  await exportGallery();
  console.log('All G66 assets exported successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
