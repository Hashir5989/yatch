const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const sharp = require('sharp');

async function compressPdf(srcPath, destPath) {
  console.log('Reading source PDF:', srcPath);
  const buf = fs.readFileSync(srcPath);
  console.log('Original size:', (buf.length / (1024 * 1024)).toFixed(2), 'MB');

  // Locate xref table from startxref
  const startXrefIdx = buf.lastIndexOf(Buffer.from('startxref'));
  if (startXrefIdx === -1) throw new Error('startxref not found');
  const afterStartXref = buf.subarray(startXrefIdx + 9);
  const xrefOffset = parseInt(afterStartXref.toString('latin1').trim(), 10);
  console.log('Original xref offset:', xrefOffset);

  // Parse original xref
  const xrefStr = buf.subarray(xrefOffset).toString('latin1');
  const trailerMatch = xrefStr.match(/trailer\s*<<([\s\S]*?)>>\s*startxref/);
  if (!trailerMatch) throw new Error('trailer not found');
  const trailerDict = trailerMatch[1];
  const sizeMatch = trailerDict.match(/\/Size\s+(\d+)/);
  const maxObjId = sizeMatch ? parseInt(sizeMatch[1], 10) : 865;
  console.log('Object count in trailer /Size:', maxObjId);

  // Parse original xref offsets
  const offsets = new Array(maxObjId).fill(0);
  const xrefLines = xrefStr.split(/\r?\n/);
  let currentId = 0;
  for (let i = 0; i < xrefLines.length; i++) {
    const line = xrefLines[i].trim();
    if (line.startsWith('trailer')) break;
    const subHeader = line.match(/^(\d+)\s+(\d+)$/);
    if (subHeader) {
      currentId = parseInt(subHeader[1], 10);
      continue;
    }
    const entry = line.match(/^(\d{10})\s+(\d{5})\s+([nf])$/);
    if (entry) {
      if (entry[3] === 'n' && currentId < maxObjId) {
        offsets[currentId] = parseInt(entry[1], 10);
      }
      currentId++;
    }
  }

  // Open output stream
  const outFd = fs.openSync(destPath, 'w');
  let currentOutOffset = 0;

  function write(chunk) {
    if (typeof chunk === 'string') chunk = Buffer.from(chunk, 'latin1');
    fs.writeSync(outFd, chunk);
    currentOutOffset += chunk.length;
  }

  // Write header
  const headerEnd = buf.indexOf(Buffer.from('\n'), 0) + 1;
  const headerBuf = buf.subarray(0, headerEnd);
  write(headerBuf);

  // If there is binary comment after header
  if (buf[headerEnd] === 0x25) { // '%'
    const commentEnd = buf.indexOf(Buffer.from('\n'), headerEnd) + 1;
    write(buf.subarray(headerEnd, commentEnd));
  }

  const newOffsets = new Array(maxObjId).fill(0);
  let convertedImages = 0;
  let savedBytes = 0;

  for (let id = 1; id < maxObjId; id++) {
    const objOffset = offsets[id];
    if (!objOffset) continue;

    newOffsets[id] = currentOutOffset;

    const endObjIdx = buf.indexOf(Buffer.from('endobj'), objOffset);
    if (endObjIdx === -1) {
      console.warn(`Object ${id} endobj not found`);
      continue;
    }
    const rawObjBytes = buf.subarray(objOffset, endObjIdx + 6);

    // Check if this object is an Image with /Filter /FlateDecode
    const objHeaderStr = rawObjBytes.subarray(0, Math.min(rawObjBytes.length, 1000)).toString('latin1');
    const isImage = objHeaderStr.includes('/Subtype /Image') || objHeaderStr.includes('/Subtype/Image');
    const isFlate = objHeaderStr.includes('/Filter /FlateDecode') || objHeaderStr.includes('/Filter/FlateDecode');

    if (isImage && isFlate) {
      try {
        const streamStart = rawObjBytes.indexOf(Buffer.from('stream\r\n'));
        const streamStartOffset = streamStart !== -1 ? streamStart + 8 : rawObjBytes.indexOf(Buffer.from('stream\n')) + 7;
        const streamEnd = rawObjBytes.indexOf(Buffer.from('endstream'), streamStartOffset);

        if (streamStartOffset > 0 && streamEnd > streamStartOffset) {
          const streamData = rawObjBytes.subarray(streamStartOffset, streamEnd);
          const widthMatch = objHeaderStr.match(/\/Width\s+(\d+)/);
          const heightMatch = objHeaderStr.match(/\/Height\s+(\d+)/);
          const bpcMatch = objHeaderStr.match(/\/BitsPerComponent\s+(\d+)/);
          const bpc = bpcMatch ? parseInt(bpcMatch[1], 10) : 8;

          if (widthMatch && heightMatch && bpc === 8) {
            const width = parseInt(widthMatch[1], 10);
            const height = parseInt(heightMatch[1], 10);
            const decomp = zlib.inflateSync(streamData);

            if (decomp.length === width * height * 3) {
              const jpeg = await sharp(decomp, { raw: { width, height, channels: 3 } })
                .jpeg({ quality: 85, mozjpeg: true })
                .toBuffer();

              if (jpeg.length < streamData.length) {
                let dictStr = rawObjBytes.subarray(0, streamStartOffset).toString('latin1');
                dictStr = dictStr.replace(/\/Filter\s*\/FlateDecode/, '/Filter /DCTDecode');
                dictStr = dictStr.replace(/\/Length\s+\d+/, `/Length ${jpeg.length}`);
                dictStr = dictStr.replace(/\/ColorSpace\s*\[[^\]]+\]/, '/ColorSpace /DeviceRGB');

                write(dictStr);
                write(jpeg);
                write('\r\nendstream\r\nendobj\r\n');

                savedBytes += (streamData.length - jpeg.length);
                convertedImages++;
                continue;
              }
            } else if (decomp.length === width * height) {
              const jpeg = await sharp(decomp, { raw: { width, height, channels: 1 } })
                .jpeg({ quality: 85, mozjpeg: true })
                .toBuffer();

              if (jpeg.length < streamData.length) {
                let dictStr = rawObjBytes.subarray(0, streamStartOffset).toString('latin1');
                dictStr = dictStr.replace(/\/Filter\s*\/FlateDecode/, '/Filter /DCTDecode');
                dictStr = dictStr.replace(/\/Length\s+\d+/, `/Length ${jpeg.length}`);
                dictStr = dictStr.replace(/\/ColorSpace\s*\[[^\]]+\]/, '/ColorSpace /DeviceGray');

                write(dictStr);
                write(jpeg);
                write('\r\nendstream\r\nendobj\r\n');

                savedBytes += (streamData.length - jpeg.length);
                convertedImages++;
                continue;
              }
            }
          }
        }
      } catch (err) {
        // Fall back to original object untouched
      }
    }

    // Write original object untouched
    write(rawObjBytes);
    write('\r\n');
  }

  // Write new xref table
  const newXrefStart = currentOutOffset;
  write('xref\r\n');
  write(`0 ${maxObjId}\r\n`);
  write('0000000000 65535 f \r\n');
  for (let id = 1; id < maxObjId; id++) {
    const off = newOffsets[id] || 0;
    const offStr = String(off).padStart(10, '0');
    write(`${offStr} 00000 n \r\n`);
  }

  // Write trailer
  write(`trailer\r\n<<\r\n${trailerDict}>>\r\nstartxref\r\n${newXrefStart}\r\n%%EOF\r\n`);

  fs.closeSync(outFd);

  const destStats = fs.statSync(destPath);
  console.log(`Successfully converted ${convertedImages} images!`);
  console.log(`Saved: ${(savedBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`New PDF size: ${(destStats.size / (1024 * 1024)).toFixed(2)} MB`);
}

const src = path.join(__dirname, '..', 'public', 'documents', 'asmaraty-g77-brochure.pdf');
const dest = path.join(__dirname, '..', 'public', 'documents', 'asmaraty-g77-brochure-optimized.pdf');

compressPdf(src, dest).catch(err => {
  console.error('Compression failed:', err);
  process.exit(1);
});

