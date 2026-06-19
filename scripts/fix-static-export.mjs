/**
 * Fix Next.js 16 static export RSC path mismatch.
 * Nested: __next.docs/$oc$slug/__PAGE__.txt
 * Requested: __next.docs.$oc$slug.__PAGE__.txt
 * @see https://github.com/vercel/next.js/issues/85374
 */
import { constants, promises as fs } from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve(process.cwd(), process.argv[2] ?? 'out');

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function flattenNextDir(parentDir, nextDirName) {
  const nextDirPath = path.join(parentDir, nextDirName);
  await flattenRecursive(parentDir, nextDirName, nextDirPath);
}

async function flattenRecursive(baseParentDir, prefix, currentDir) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      await flattenRecursive(baseParentDir, `${prefix}.${entry.name}`, entryPath);
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith('.txt')) continue;

    const flatName = `${prefix}.${entry.name}`;
    const targetPath = path.join(baseParentDir, flatName);

    try {
      await fs.copyFile(entryPath, targetPath, constants.COPYFILE_EXCL);
      console.log(`  + ${path.relative(OUT_DIR, targetPath)}`);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'EEXIST') {
        continue;
      }
      throw error;
    }
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.name.startsWith('__next.')) {
      await flattenNextDir(dir, entry.name);
    }

    if (entry.name === '_next') continue;
    await walk(fullPath);
  }
}

async function main() {
  if (!(await exists(OUT_DIR))) {
    console.error(`[fix-static-export] Directory not found: ${OUT_DIR}`);
    process.exit(1);
  }

  console.log('[fix-static-export] Creating flat RSC aliases...');
  await walk(OUT_DIR);
  console.log('[fix-static-export] Done.');
}

main().catch((error) => {
  console.error('[fix-static-export] Failed:', error);
  process.exit(1);
});
