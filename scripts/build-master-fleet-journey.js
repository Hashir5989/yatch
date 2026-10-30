const sharp = require('sharp');
const fs = require('fs');

async function buildMasterEditorialFleet() {
  const finalW = 3200;
  const finalH = 1400;

  console.log('Building master editorial 4-yacht panoramic banner...');

  // 1. Deep luxury navy ocean backdrop with subtle sea lighting
  const baseSvg = `
    <svg width="${finalW}" height="${finalH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#060E18" />
          <stop offset="35%" stop-color="#0A182B" />
          <stop offset="55%" stop-color="#0E233E" />
          <stop offset="75%" stop-color="#09182A" />
          <stop offset="100%" stop-color="#040910" />
        </linearGradient>
        <radialGradient id="sunCaustic" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#E5C378" stop-opacity="0.12" />
          <stop offset="40%" stop-color="#7BB0E0" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="${finalW}" height="${finalH}" fill="url(#bgGrad)" />
      <rect width="${finalW}" height="${finalH}" fill="url(#sunCaustic)" />
    </svg>
  `;
  const background = await sharp(Buffer.from(baseSvg)).png().toBuffer();

  // 2. Prepare the 4 cards:
  // Card dimensions: 680px wide x 382px high (exact 16:9 aspect ratio)
  const cardW = 680;
  const cardH = 382;

  // Perfectly equal spacing:
  // Total width: 3200
  // 4 cards * 680 = 2720
  // Total remaining horizontal space = 3200 - 2720 = 480
  // 5 equal gaps = 480 / 5 = 96px!
  const gap = 96;
  const x1 = gap;                          // 96
  const x2 = x1 + cardW + gap;             // 872
  const x3 = x2 + cardW + gap;             // 1648
  const x4 = x3 + cardW + gap;             // 2424

  // Vertical placement:
  // Top headroom for heading & description: 640px
  // Cards height: 382px (y: 640 to 1022)
  // Bottom headroom for buttons: 378px (y: 1022 to 1400)
  const yPos = 640;

  // Function to create a luxury card with gold hairline border & title badge
  async function createCard(srcPath, extractOpts, flip, label, lengthStr) {
    let pipeline = sharp(srcPath);
    if (extractOpts) {
      pipeline = pipeline.extract(extractOpts);
    }
    if (flip) {
      pipeline = pipeline.flop();
    }
    const photo = await pipeline
      .resize(cardW, cardH, { fit: 'cover', position: 'center' })
      .toBuffer();

    // SVG frame with luxury gold border, rounded corners, and metallic tag
    const frameSvg = `
      <svg width="${cardW}" height="${cardH}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="goldStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#C6A155" stop-opacity="0.85" />
            <stop offset="50%" stop-color="#FFF2D6" stop-opacity="0.95" />
            <stop offset="100%" stop-color="#8F7132" stop-opacity="0.75" />
          </linearGradient>
          <linearGradient id="bottomShadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#08101C" stop-opacity="0.0" />
            <stop offset="60%" stop-color="#08101C" stop-opacity="0.1" />
            <stop offset="100%" stop-color="#08101C" stop-opacity="0.85" />
          </linearGradient>
        </defs>
        <!-- Bottom vignette for text legibility -->
        <rect width="${cardW}" height="${cardH}" fill="url(#bottomShadow)" rx="6" />
        <!-- Border -->
        <rect x="1" y="1" width="${cardW - 2}" height="${cardH - 2}" rx="6" fill="none" stroke="url(#goldStroke)" stroke-width="1.5" />
        <!-- Badge at bottom-left -->
        <rect x="18" y="${cardH - 46}" width="240" height="28" rx="2" fill="#08101C" fill-opacity="0.85" stroke="#C6A155" stroke-opacity="0.6" stroke-width="1" />
        <text x="28" y="${cardH - 28}" font-family="sans-serif" font-size="12" font-weight="700" fill="#FFFFFF" letter-spacing="2">${label}</text>
        <text x="175" y="${cardH - 28}" font-family="sans-serif" font-size="11" font-weight="600" fill="#C6A155" letter-spacing="1.5">• ${lengthStr}</text>
      </svg>
    `;
    const frameBuffer = await sharp(Buffer.from(frameSvg)).png().toBuffer();

    // Round corner mask
    const cornerMaskSvg = `
      <svg width="${cardW}" height="${cardH}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${cardW}" height="${cardH}" rx="6" fill="#ffffff" />
      </svg>
    `;
    const cornerMask = await sharp(Buffer.from(cornerMaskSvg)).png().toBuffer();

    return await sharp(photo)
      .composite([
        { input: cornerMask, blend: 'dest-in' },
        { input: frameBuffer, blend: 'over' }
      ])
      .png()
      .toBuffer();
  }

  // 1. G-100 Super Yacht
  const g100Card = await createCard(
    'user_uploads/AS G-100 p1.png',
    { left: 300, top: 200, width: 5400, height: 3100 },
    false,
    'ASMARATY G-100',
    '100 FT'
  );

  // 2. G-77 Luxury Yacht
  const g77Card = await createCard(
    'user_uploads/AS G77 P2.png',
    { left: 0, top: 400, width: 6000, height: 2975 },
    false,
    'ASMARATY G-77',
    '78 FT'
  );

  // 3. G-66 Luxury Yacht (sunset skyline photo from user's WhatsApp uploads)
  const g66Card = await createCard(
    'user_uploads/WhatsApp Image 2026-10-24 at 10.45.57 PM.jpeg',
    null,
    false,
    'ASMARATY G-66',
    '66 FT'
  );

  // 4. G-50 Luxury Motor Yacht
  const g50Card = await createCard(
    'user_uploads/AS G50 P1.png',
    { left: 300, top: 300, width: 5400, height: 3075 },
    false,
    'ASMARATY G-50',
    '50 FT'
  );

  // 3. Composite everything onto the 3200x1400 canvas
  const finalImage = await sharp(background)
    .composite([
      { input: g100Card, left: x1, top: yPos },
      { input: g77Card, left: x2, top: yPos },
      { input: g66Card, left: x3, top: yPos },
      { input: g50Card, left: x4, top: yPos }
    ])
    .jpeg({ quality: 95, mozjpeg: true })
    .toFile('public/images/asmaraty-four-yachts-journey.jpg');

  console.log('Saved public/images/asmaraty-four-yachts-journey.jpg:', finalImage);
}

buildMasterEditorialFleet().catch(console.error);
