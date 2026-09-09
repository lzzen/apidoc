import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checkOut = process.argv.includes('--out');
const targetDir = checkOut ? path.join(root, 'out') : path.join(root, 'docs');
const ext = checkOut ? '.html' : '.md';

function countCJK(text) {
  let n = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code >= 0x4e00 && code <= 0x9fff) n += 1;
  }
  return n;
}

function countQuestionRuns(text) {
  const matches = text.match(/\?{3,}/g);
  return matches ? matches.length : 0;
}

async function listFiles(dir) {
  const names = await fs.readdir(dir);
  return names
    .filter((name) => name.endsWith(ext))
    .map((name) => path.join(dir, name))
    .sort();
}

async function main() {
  let files;
  try {
    files = await listFiles(targetDir);
  } catch (err) {
    console.error(`[check] cannot read ${targetDir}: ${err.message}`);
    process.exit(1);
  }

  if (!files.length) {
    console.error(`[check] no ${ext} files in ${targetDir}`);
    process.exit(1);
  }

  let failed = 0;
  for (const file of files) {
    const rel = path.relative(root, file);
    const buf = await fs.readFile(file);
    let text;
    try {
      text = buf.toString('utf8');
      // Reject replacement-free decode that still contains invalid sequences
      // by round-tripping through TextDecoder fatal mode.
      new TextDecoder('utf-8', { fatal: true }).decode(buf);
    } catch (err) {
      console.error(`[FAIL] ${rel}: not valid UTF-8 (${err.message})`);
      failed += 1;
      continue;
    }

    const cjk = countCJK(text);
    const qruns = countQuestionRuns(text);
    const name = path.basename(file);

    // Seedance / English-heavy pages may have fewer CJK; require some for zh docs.
    const expectCJK = !checkOut;
    if (expectCJK && cjk < 20 && name !== 'index.md') {
      console.error(`[FAIL] ${rel}: too little Chinese text (cjk=${cjk}). File may be corrupted.`);
      failed += 1;
      continue;
    }

    if (qruns >= 5) {
      console.error(
        `[FAIL] ${rel}: found ${qruns} runs of "???". Source Chinese was likely lost to mojibake.`,
      );
      failed += 1;
      continue;
    }

    console.log(`[OK] ${rel} (cjk=${cjk}, ???-runs=${qruns})`);
  }

  if (failed) {
    console.error(`[check] ${failed} file(s) failed`);
    process.exit(1);
  }
  console.log(`[check] all ${files.length} file(s) OK`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
