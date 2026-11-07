import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, r, g, b, a = 255) {
  const rowSize = width * 4;
  const rawData = Buffer.alloc((rowSize + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (rowSize + 1);
    rawData[rowStart] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      const pixelStart = rowStart + 1 + x * 4;
      // create a nice rounded vignette / circle
      const dx = (x - width / 2) / (width / 2);
      const dy = (y - height / 2) / (height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.85) {
        rawData[pixelStart] = r;
        rawData[pixelStart + 1] = g;
        rawData[pixelStart + 2] = b;
        rawData[pixelStart + 3] = a;
      } else {
        rawData[pixelStart] = Math.round(r * 0.85);
        rawData[pixelStart + 1] = Math.round(g * 0.85);
        rawData[pixelStart + 2] = Math.round(b * 0.85);
        rawData[pixelStart + 3] = a;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const chunkType = Buffer.from(type, 'ascii');
    const toCrc = Buffer.concat([chunkType, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(toCrc), 0);
    return Buffer.concat([len, chunkType, data, crc]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Rose coral #E11D48 (225, 29, 72)
const png192 = createPng(192, 192, 225, 29, 72);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);

const png512 = createPng(512, 512, 225, 29, 72);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), png512);

const pngApple = createPng(180, 180, 225, 29, 72);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pngApple);

console.log('PWA PNG icons generated successfully.');
