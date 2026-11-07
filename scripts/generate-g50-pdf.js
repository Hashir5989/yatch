const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC_DIR = 'C:/Users/Hashir/OneDrive/Documents/yath/G50/ASMARATY G-50 (1)';
const OUT_PDF = path.join(__dirname, '..', 'public', 'documents', 'asmaraty-g50-brochure.pdf');

async function buildBrochurePdf() {
  console.log('Generating optimized ASMARATY G-50 Brochure PDF...');

  const pageNumbers = [];
  for (let i = 1; i <= 30; i++) {
    const p = path.join(SRC_DIR, `${i}.png`);
    if (fs.existsSync(p)) pageNumbers.push(i);
  }

  const objects = [];
  function addObject(content, streamBuf = null) {
    const num = objects.length + 1;
    objects.push({ num, content, streamBuf });
    return num;
  }

  const catalogNum = 1;
  const pagesRootNum = 2;
  objects.push({ num: catalogNum, content: `<< /Type /Catalog /Pages ${pagesRootNum} 0 R >>` });
  objects.push({ num: pagesRootNum, content: '' }); // placeholder for Pages dict

  const pageObjNums = [];

  for (const pageNum of pageNumbers) {
    let p = path.join(SRC_DIR, `${pageNum}.png`);
    let jpegBuf;

    // Use cleaned hero images for covers/specials
    if (pageNum === 1) {
      jpegBuf = fs.readFileSync(path.join(__dirname, '..', 'public', 'images', 'yachts', 'g50', 'hero-01.jpg'));
    } else if (pageNum === 29) {
      jpegBuf = fs.readFileSync(path.join(__dirname, '..', 'public', 'images', 'yachts', 'g50', 'hero-02.jpg'));
    } else {
      jpegBuf = await sharp(p)
        .resize(1920, 1080, { fit: 'fill' })
        .jpeg({ quality: 82 })
        .toBuffer();
    }

    const meta = await sharp(jpegBuf).metadata();
    const w = meta.width;
    const h = meta.height;

    // Image XObject
    const imgObjNum = addObject(
      `<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBuf.length} >>`,
      jpegBuf
    );

    // Content stream: scale image to fit 1920x1080
    const contentStreamStr = `q 1920 0 0 1080 0 0 cm /Im1 Do Q\n`;
    const contentStreamBuf = Buffer.from(contentStreamStr, 'ascii');
    const contentObjNum = addObject(
      `<< /Length ${contentStreamBuf.length} >>`,
      contentStreamBuf
    );

    // Page object
    const pageObjNum = addObject(
      `<< /Type /Page /Parent ${pagesRootNum} 0 R /MediaBox [0 0 1920 1080] /Contents ${contentObjNum} 0 R /Resources << /ProcSet [/PDF /ImageC] /XObject << /Im1 ${imgObjNum} 0 R >> >> >>`
    );

    pageObjNums.push(pageObjNum);
  }

  // Fill in Pages dict
  objects[pagesRootNum - 1].content = `<< /Type /Pages /Kids [${pageObjNums.map(n => `${n} 0 R`).join(' ')}] /Count ${pageObjNums.length} >>`;

  // Write PDF file
  const outStream = fs.createWriteStream(OUT_PDF);
  outStream.write('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  const xref = [];
  let currentOffset = 15;

  for (const obj of objects) {
    xref.push(currentOffset);
    let header = `${obj.num} 0 obj\n${obj.content}\n`;
    if (obj.streamBuf) {
      header += 'stream\r\n';
      outStream.write(header);
      currentOffset += Buffer.byteLength(header);
      outStream.write(obj.streamBuf);
      currentOffset += obj.streamBuf.length;
      let footer = '\r\nendstream\nendobj\n';
      outStream.write(footer);
      currentOffset += Buffer.byteLength(footer);
    } else {
      header += 'endobj\n';
      outStream.write(header);
      currentOffset += Buffer.byteLength(header);
    }
  }

  // Cross reference table
  const startXref = currentOffset;
  outStream.write(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`);
  for (const offset of xref) {
    outStream.write(`${String(offset).padStart(10, '0')} 00000 n \n`);
  }

  // Trailer
  outStream.write(`trailer\n<< /Size ${objects.length + 1} /Root ${catalogNum} 0 R >>\nstartxref\n${startXref}\n%%EOF\n`);
  outStream.end();

  await new Promise((resolve, reject) => {
    outStream.on('finish', resolve);
    outStream.on('error', reject);
  });

  const stats = fs.statSync(OUT_PDF);
  console.log(`Successfully built ${OUT_PDF} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
}

buildBrochurePdf().catch(err => {
  console.error(err);
  process.exit(1);
});
