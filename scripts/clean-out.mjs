import { promises as fs } from 'node:fs';

await fs.rm('out', { recursive: true, force: true });
console.log('[clean-out] removed out/');
