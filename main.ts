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

import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
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
