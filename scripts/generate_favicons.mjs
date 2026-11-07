import sharp from "sharp";
import fs from "fs";
import path from "path";

const INPUT_LOGO = "C:/Users/Hashir/.gemini/antigravity/brain/62dccab8-1706-4bf2-96bc-ba59ac65d65d/.user_uploaded/media_1794078633002_77f82899.jpg";
const PUBLIC_DIR = path.join(process.cwd(), "public");

/**
 * Builds a multi-resolution ICO file buffer containing standard PNG icons
 */
function buildIco(pngBuffers) {
  // pngBuffers: array of { width, height, buffer }
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const dirEntries = [];

  for (const item of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.width === 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height === 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(item.buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    dirEntries.push(entry);
    offset += item.buffer.length;
  }

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(count, 4); // count

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map((b) => b.buffer)]);
}

async function generateFavicons() {
  if (!fs.existsSync(INPUT_LOGO)) {
    throw new Error(`Input approved logo not found at: ${INPUT_LOGO}`);
  }

  console.log("Loading approved logo:", INPUT_LOGO);
  const { data, info } = await sharp(INPUT_LOGO).raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  // Background threshold: white is > 250
  // Foreground core: lum < 55
  const bgThreshold = 252;
  const fgThreshold = 55;

  // Extract clean transparent alpha channel while preserving charcoal brand color (#1E2024)
  const rgbaBuffer = Buffer.alloc(w * h * 4);
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
      alpha = Math.round(t * t * (3 - 2 * t) * 255);
    } else {
      alpha = 0;
    }

    rgbaBuffer[i * 4] = 30;     // #1E
    rgbaBuffer[i * 4 + 1] = 32; // #20
    rgbaBuffer[i * 4 + 2] = 36; // #24
    rgbaBuffer[i * 4 + 3] = alpha;
  }

  // Trim transparent edges tightly around the artwork
  const trimmed = await sharp(rgbaBuffer, { raw: { width: w, height: h, channels: 4 } })
    .trim()
    .toBuffer({ resolveWithObject: true });

  const logoW = trimmed.info.width;
  const logoH = trimmed.info.height;
  console.log(`Trimmed approved logo artwork: ${logoW}x${logoH} (aspect ratio: ${(logoW / logoH).toFixed(2)})`);

  // Target width on 512x512 master square canvas: 468px (leaves luxury breathing margin ~22px on each side)
  const masterTargetW = 468;
  const masterTargetH = Math.round(logoH * (masterTargetW / logoW));

  const resizedMasterLogo = await sharp(trimmed.data, {
    raw: { width: logoW, height: logoH, channels: 4 }
  })
    .resize(masterTargetW, masterTargetH, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();

  // 1. Master 512x512 Transparent Canvas
  const master512 = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([
      {
        input: resizedMasterLogo,
        top: Math.round((512 - masterTargetH) / 2),
        left: Math.round((512 - masterTargetW) / 2)
      }
    ])
    .png()
    .toBuffer();

  // 2. Master 512x512 Solid White Canvas (for Apple Touch Icon & high-contrast PWA)
  const master512White = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([
      {
        input: resizedMasterLogo,
        top: Math.round((512 - masterTargetH) / 2),
        left: Math.round((512 - masterTargetW) / 2)
      }
    ])
    .png()
    .toBuffer();

  // Generate required formats
  console.log("Generating output favicon formats in /public...");

  // icon.png (512x512)
  await sharp(master512).png({ compressionLevel: 9 }).toFile(path.join(PUBLIC_DIR, "icon.png"));
  console.log("✓ Saved public/icon.png (512x512)");

  // apple-touch-icon.png (180x180, iOS requires solid background without transparency)
  await sharp(master512White)
    .resize(180, 180, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toFile(path.join(PUBLIC_DIR, "apple-touch-icon.png"));
  console.log("✓ Saved public/apple-touch-icon.png (180x180)");

  // apple-icon.png (keep backward compatibility)
  await sharp(master512White)
    .resize(180, 180, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toFile(path.join(PUBLIC_DIR, "apple-icon.png"));
  console.log("✓ Saved public/apple-icon.png (180x180)");

  // favicon-96.png (96x96, Google Search & modern desktop browsers)
  const buf96 = await sharp(master512)
    .resize(96, 96, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(PUBLIC_DIR, "favicon-96.png"), buf96);
  console.log("✓ Saved public/favicon-96.png (96x96)");

  // favicon-48x48.png (48x48, exact Google Search 1x multiple)
  const buf48 = await sharp(master512)
    .resize(48, 48, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(PUBLIC_DIR, "favicon-48x48.png"), buf48);
  console.log("✓ Saved public/favicon-48x48.png (48x48)");

  // favicon.png (64x64, standard desktop fallback)
  await sharp(master512)
    .resize(64, 64, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toFile(path.join(PUBLIC_DIR, "favicon.png"));
  console.log("✓ Saved public/favicon.png (64x64)");

  // favicon-32x32.png (32x32, retina tab favicon)
  const buf32 = await sharp(master512)
    .resize(32, 32, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(PUBLIC_DIR, "favicon-32x32.png"), buf32);
  console.log("✓ Saved public/favicon-32x32.png (32x32)");

  // favicon-16x16.png (16x16, standard browser tab)
  const buf16 = await sharp(master512)
    .resize(16, 16, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(PUBLIC_DIR, "favicon-16x16.png"), buf16);
  console.log("✓ Saved public/favicon-16x16.png (16x16)");

  // favicon.ico (multi-resolution container containing 16x16, 32x32, 48x48)
  const icoData = buildIco([
    { width: 16, height: 16, buffer: buf16 },
    { width: 32, height: 32, buffer: buf32 },
    { width: 48, height: 48, buffer: buf48 }
  ]);
  fs.writeFileSync(path.join(PUBLIC_DIR, "favicon.ico"), icoData);
  console.log("✓ Saved public/favicon.ico (multi-size: 16x16, 32x32, 48x48)");

  // 3. Generate site.webmanifest
  const manifest = {
    name: "ASMARATY Luxury Yachts",
    short_name: "ASMARATY",
    description: "Bespoke composite luxury yacht manufacturing and naval architecture in the UAE since 1979.",
    start_url: "/",
    display: "standalone",
    background_color: "#080B10",
    theme_color: "#080B10",
    icons: [
      {
        src: "/favicon-48x48.png",
        sizes: "48x48",
        type: "image/png"
      },
      {
        src: "/favicon-96.png",
        sizes: "96x96",
        type: "image/png"
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png"
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ]
  };

  fs.writeFileSync(
    path.join(PUBLIC_DIR, "site.webmanifest"),
    JSON.stringify(manifest, null, 2) + "\n"
  );
  console.log("✓ Saved public/site.webmanifest");

  console.log("🎉 All favicon formats generated successfully!");
}

generateFavicons().catch(err => {
  console.error("Error generating favicons:", err);
  process.exit(1);
});

