import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Standard CRC32 implementation for PNG chunks
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[i] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcInput = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcInput);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, crcInput, crcBuf]);
}

function createPng(width, height, pixelFn) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8 bits per channel
  ihdrData.writeUInt8(6, 9); // RGBA color type
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = pixelFn(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// 5x7 bitmap representation for letters V, I, T
const FONT_5X7 = {
  V: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  I: [
    [1, 1, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 1],
  ],
  T: [
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
};

function generate32Badge() {
  const w = 32;
  const h = 32;
  const radius = 5;

  return createPng(w, h, (x, y) => {
    // Check rounded rect boundaries
    const dx = Math.max(0, Math.max(radius - x, x - (w - 1 - radius)));
    const dy = Math.max(0, Math.max(radius - y, y - (h - 1 - radius)));
    const distSq = dx * dx + dy * dy;

    if (distSq > (radius + 0.5) * (radius + 0.5)) {
      return [0, 0, 0, 0]; // Transparent outside rounded corner
    }

    // Border (1.5px border of brand blue #1365A4)
    const isBorder = (
      x === 0 || x === w - 1 || y === 0 || y === h - 1 ||
      (x === 1 && (y < radius || y > h - 1 - radius)) ||
      (x === w - 2 && (y < radius || y > h - 1 - radius)) ||
      distSq > (radius - 1.2) * (radius - 1.2)
    );

    if (isBorder && distSq <= (radius + 0.5) * (radius + 0.5)) {
      return [19, 101, 164, 255]; // #1365A4
    }

    // Letter positions (centered in 32x32: total width = 5 + 2 + 3 + 2 + 5 = 17 px)
    // Left offset = (32 - 17) / 2 = 7 px, Top offset = (32 - 11) / 2 = 10 px
    // Scale letters to height 11px (scale factor approx 1.6)
    // Let's do exact pixel placement for crisp rendering:
    // Letter V: x in [6, 11], Letter I: x in [14, 17], Letter T: x in [20, 25], y in [11, 20]
    const ly = y - 11;
    if (ly >= 0 && ly < 10) {
      // Letter V (Bright blue #38bdf8)
      if (x >= 6 && x <= 11) {
        const lx = x - 6;
        const fy = Math.floor((ly / 10) * 7);
        const fx = Math.floor((lx / 6) * 5);
        if (FONT_5X7.V[fy]?.[fx]) {
          return [56, 189, 248, 255]; // #38bdf8
        }
      }

      // Letter I (Crisp White #ffffff)
      if (x >= 14 && x <= 17) {
        const lx = x - 14;
        const fy = Math.floor((ly / 10) * 7);
        const fx = Math.floor((lx / 4) * 3);
        if (FONT_5X7.I[fy]?.[fx]) {
          return [255, 255, 255, 255];
        }
      }

      // Letter T (Crisp White #ffffff)
      if (x >= 20 && x <= 25) {
        const lx = x - 20;
        const fy = Math.floor((ly / 10) * 7);
        const fx = Math.floor((lx / 6) * 5);
        if (FONT_5X7.T[fy]?.[fx]) {
          return [255, 255, 255, 255];
        }
      }
    }

    // Background: dark #0a0a0c
    return [10, 10, 12, 255];
  });
}

function generate180Badge() {
  const w = 180;
  const h = 180;
  const radius = 38;

  return createPng(w, h, (x, y) => {
    const dx = Math.max(0, Math.max(radius - x, x - (w - 1 - radius)));
    const dy = Math.max(0, Math.max(radius - y, y - (h - 1 - radius)));
    const distSq = dx * dx + dy * dy;

    if (distSq > (radius + 0.5) * (radius + 0.5)) {
      return [0, 0, 0, 0];
    }

    const isBorder = (
      x < 6 || x >= w - 6 || y < 6 || y >= h - 6 ||
      distSq > (radius - 5.5) * (radius - 5.5)
    );

    if (isBorder && distSq <= (radius + 0.5) * (radius + 0.5)) {
      return [19, 101, 164, 255]; // #1365A4
    }

    // Scale letters to 70px height (scale 10x)
    const ly = y - 55;
    if (ly >= 0 && ly < 70) {
      if (x >= 28 && x <= 68) {
        const lx = x - 28;
        const fy = Math.floor((ly / 70) * 7);
        const fx = Math.floor((lx / 40) * 5);
        if (FONT_5X7.V[fy]?.[fx]) {
          return [56, 189, 248, 255];
        }
      }

      if (x >= 78 && x <= 102) {
        const lx = x - 78;
        const fy = Math.floor((ly / 70) * 7);
        const fx = Math.floor((lx / 24) * 3);
        if (FONT_5X7.I[fy]?.[fx]) {
          return [255, 255, 255, 255];
        }
      }

      if (x >= 112 && x <= 152) {
        const lx = x - 112;
        const fy = Math.floor((ly / 70) * 7);
        const fx = Math.floor((lx / 40) * 5);
        if (FONT_5X7.T[fy]?.[fx]) {
          return [255, 255, 255, 255];
        }
      }
    }

    return [10, 10, 12, 255];
  });
}

const badge32 = generate32Badge();
fs.writeFileSync(path.join(process.cwd(), 'public', 'icon.png'), badge32);
fs.writeFileSync(path.join(process.cwd(), 'app', 'icon.png'), badge32);

const badge180 = generate180Badge();
fs.writeFileSync(path.join(process.cwd(), 'public', 'apple-icon.png'), badge180);
fs.writeFileSync(path.join(process.cwd(), 'app', 'apple-icon.png'), badge180);

console.log('Generated 32x32 and 180x180 icons in public/ and app/');
