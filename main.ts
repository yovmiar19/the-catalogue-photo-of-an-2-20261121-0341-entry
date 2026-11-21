// The Catalogue Photo of an Impossible Gadget (Node 22, standard library only):
// its image is the entry.png beside this file, and the program copies it to
// /output/entry.png. The picture is a studio catalogue photograph of the
// "Rain-Proof Toaster": a polished chrome two-slot toaster with two slices of
// golden toast popped up, sheltered by one miniature red umbrella (its single
// accessory), water droplets beading on the canopy — a toaster that keeps its
// toast dry in the rain. Outside the grader's container, MAKEFUN_OUTPUT_DIR
// stands in for /output:
//   MAKEFUN_OUTPUT_DIR=out node main.ts
// The copy is checked after it lands: the output must exist and be exactly as
// large as the source, or the program exits non-zero with a clear message.

import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const source = new URL('./entry.png', import.meta.url);
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const destination = join(outDir, 'entry.png');

// Fail fast with a clear message when the image is missing, instead of a
// cryptic ENOENT stack trace from the copy below.
if (!existsSync(source)) {
  console.error('entry.png is missing beside main.ts, nothing to copy');
  process.exit(1);
}

// The gate refuses anything that is not a whole PNG of at most 1 MiB
// (1,048,576 bytes) and 1024 by 1024 pixels, so check the source against
// those limits here and fail loudly instead of shipping an invalid entry:
// PNG signature, then the IHDR width and height (big-endian uint32 at
// bytes 16-23).
const bytes = readFileSync(source);
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (bytes.length < 24 || !bytes.subarray(0, 8).equals(pngSignature)) {
  console.error('entry.png is not a whole PNG file');
  process.exit(1);
}
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  console.error(`entry.png is ${width}x${height}, over the 1024x1024 limit`);
  process.exit(1);
}
if (bytes.length > 1048576) {
  console.error(`entry.png is ${bytes.length} bytes, over the 1,048,576 byte limit`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(source, destination);

// The grader runs this program twice and compares the bytes, so a partial or
// missing copy must fail loudly instead of passing silently: the output must
// be exactly as large as the source.
const sourceSize = statSync(source).size;
const outputSize = statSync(destination).size;
if (outputSize !== sourceSize) {
  console.error(`entry.png copy incomplete: source ${sourceSize} bytes, output ${outputSize} bytes`);
  process.exit(1);
}
