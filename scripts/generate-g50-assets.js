const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC_DIR = 'C:/Users/Hashir/OneDrive/Documents/yath/G50/ASMARATY G-50 (1)';
const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'yachts', 'g50');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function cleanHero1() {
  console.log('Processing hero-01.jpg (1.png)...');
  const src = `${SRC_DIR}/1.png`;
  const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Clean top-left logo (Alshaali Marine, x: 150 to 1130, y: 60 to 450)
  const tl_x0 = 150, tl_x1 = 1130, tl_y0 = 60, tl_y1 = 450;
  const tl_feather = 110;
  const tl_shiftX = 1080;

  for (let y = tl_y0; y <= tl_y1; y++) {
    for (let x = tl_x0; x <= tl_x1; x++) {
      let srcX = x + tl_shiftX;
      let dstIdx = (y * width + x) * channels;
      let srcIdx = (y * width + srcX) * channels;

      let dx = Math.min(x - tl_x0, tl_x1 - x);
      let dy = Math.min(y - tl_y0, tl_y1 - y);
      let dist = Math.min(dx, dy);
      let t = Math.min(1, Math.max(0, dist / tl_feather));
      let blend = 0.5 - 0.5 * Math.cos(t * Math.PI);

      for (let c = 0; c < 3; c++) {
        data[dstIdx + c] = Math.round(data[dstIdx + c] * (1 - blend) + data[srcIdx + c] * blend);
      }
    }
  }

  // Clean top-right logo (ASMARATY wings + G50, x: 4750 to 5920, y: 50 to 490)
  const tr_x0 = 4750, tr_x1 = 5920, tr_y0 = 50, tr_y1 = 490;
  const tr_feather = 100;
  const tr_shiftX = -1050;

  for (let y = tr_y0; y <= tr_y1; y++) {
    for (let x = tr_x0; x <= tr_x1; x++) {
      let srcX = x + tr_shiftX;
      let dstIdx = (y * width + x) * channels;
      let srcIdx = (y * width + srcX) * channels;

      let dx = Math.min(x - tr_x0, tr_x1 - x);
      let dy = Math.min(y - tr_y0, tr_y1 - y);
      let dist = Math.min(dx, dy);
      let t = Math.min(1, Math.max(0, dist / tr_feather));
      let blend = 0.5 - 0.5 * Math.cos(t * Math.PI);

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

  // Gallery copy
  await sharp(data, { raw: { width, height, channels } })
    .resize(1600)
    .jpeg({ quality: 88 })
    .toFile(path.join(OUT_DIR, 'gallery-ext-daylight.jpg'));

  // Also update collection thumbnails
  await sharp(data, { raw: { width, height, channels } })
    .resize(1920)
    .jpeg({ quality: 90 })
    .toFile(path.join(__dirname, '..', 'public', 'images', 'yachts', 'g50-hd.jpg'));

  await sharp(data, { raw: { width, height, channels } })
    .resize(1200)
    .jpeg({ quality: 85 })
    .toFile(path.join(__dirname, '..', 'public', 'images', 'yachts', 'g50.jpg'));

  console.log('Saved hero-01.jpg, gallery-ext-daylight.jpg, and collection thumbnails');
}

async function cleanHero2() {
  console.log('Processing hero-02.jpg (29.png)...');
  const src = `${SRC_DIR}/29.png`;
  const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Clean top-right logo on 29.png (x: 4850 to 5950, y: 60 to 450)
  const tr_x0 = 4850, tr_x1 = 5950, tr_y0 = 60, tr_y1 = 450;
  const tr_feather = 80;

  for (let y = tr_y0; y <= tr_y1; y++) {
    let refR = 0, refG = 0, refB = 0, refCount = 0;
    for (let rx = 4700; rx <= 4800; rx++) {
      let rIdx = (y * width + rx) * channels;
      refR += data[rIdx]; refG += data[rIdx+1]; refB += data[rIdx+2]; refCount++;
    }
    refR = Math.round(refR / refCount);
    refG = Math.round(refG / refCount);
    refB = Math.round(refB / refCount);

    for (let x = tr_x0; x <= tr_x1; x++) {
      let dstIdx = (y * width + x) * channels;
      let dx = Math.min(x - tr_x0, tr_x1 - x);
      let dy = Math.min(y - tr_y0, tr_y1 - y);
      let dist = Math.min(dx, dy);
      let t = Math.min(1, Math.max(0, dist / tr_feather));
      let blend = 0.5 - 0.5 * Math.cos(t * Math.PI);

      data[dstIdx] = Math.round(data[dstIdx] * (1 - blend) + refR * blend);
      data[dstIdx+1] = Math.round(data[dstIdx+1] * (1 - blend) + refG * blend);
      data[dstIdx+2] = Math.round(data[dstIdx+2] * (1 - blend) + refB * blend);
    }
  }

  const outPath = path.join(OUT_DIR, 'hero-02.jpg');
  await sharp(data, { raw: { width, height, channels } })
    .resize(1920)
    .jpeg({ quality: 90 })
    .toFile(outPath);

  // Gallery copy
  await sharp(data, { raw: { width, height, channels } })
    .resize(1600)
    .jpeg({ quality: 88 })
    .toFile(path.join(OUT_DIR, 'gallery-ext-night.jpg'));

  console.log('Saved hero-02.jpg and gallery-ext-night.jpg');
}

async function exportInsignia() {
  console.log('Processing insignia.png (from 2.png)...');
  const src = `${SRC_DIR}/2.png`;
  const rawCrop = await sharp(src)
    .extract({ left: 1950, top: 1100, width: 2100, height: 1050 })
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
  const cropBox = { left: 340, top: 800, width: 5320, height: 1770 };

  // Main Deck (21.png)
  await sharp(`${SRC_DIR}/21.png`)
    .extract(cropBox)
    .resize(1600, 532)
    .jpeg({ quality: 90 })
    .toFile(path.join(OUT_DIR, 'deck-main.jpg'));

  // Lower Deck (22.png)
  await sharp(`${SRC_DIR}/22.png`)
    .extract(cropBox)
    .resize(1600, 532)
    .jpeg({ quality: 90 })
    .toFile(path.join(OUT_DIR, 'deck-lower.jpg'));

  // Flybridge Deck (23.png)
  await sharp(`${SRC_DIR}/23.png`)
    .extract(cropBox)
    .resize(1600, 532)
    .jpeg({ quality: 90 })
    .toFile(path.join(OUT_DIR, 'deck-flybridge.jpg'));

  console.log('Saved 3D Deck Plans');
}

async function exportGallery() {
  console.log('Processing Gallery Images...');
  const items = [
    { page: '6.png', name: 'hero-03.jpg', w: 1920 },
    { page: '16.png', name: 'hero-04.jpg', w: 1920 },
    { page: '6.png', name: 'gallery-ext-sunset.jpg', w: 1600 },
    { page: '16.png', name: 'gallery-cockpit-dusk.jpg', w: 1600 },
    { page: '17.png', name: 'gallery-foredeck-bow.jpg', w: 1600 },
    { page: '7.png', name: 'gallery-salon-aft.jpg', w: 1600 },
    { page: '8.png', name: 'gallery-salon-fwd.jpg', w: 1600 },
    { page: '9.png', name: 'gallery-galley.jpg', w: 1600 },
    { page: '10.png', name: 'gallery-helm-main.jpg', w: 1600 },
    { page: '11.png', name: 'gallery-salon-lounge.jpg', w: 1600 },
    { page: '12.png', name: 'gallery-companionway.jpg', w: 1600 },
    { page: '13.png', name: 'gallery-master-stateroom.jpg', w: 1600 },
    { page: '14.png', name: 'gallery-guest-twin.jpg', w: 1600 },
    { page: '15.png', name: 'gallery-ensuite-bath.jpg', w: 1600 },
    { page: '18.png', name: 'gallery-fly-helm.jpg', w: 1600 },
    { page: '19.png', name: 'gallery-fly-terrace.jpg', w: 1600 },
    { page: '20.png', name: 'gallery-fly-lounge.jpg', w: 1600 },
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
  console.log('All ASMARATY G50 assets generated and exported successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

