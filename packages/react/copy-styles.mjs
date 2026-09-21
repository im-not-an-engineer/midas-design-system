/** styles.css를 dist로 옮기면서 @source 경로를 배포 구조에 맞게 고친다. */
import { readFile, writeFile } from 'node:fs/promises';

const css = await readFile(new URL('./src/styles.css', import.meta.url), 'utf8');
await writeFile(
  new URL('./dist/styles.css', import.meta.url),
  css.replace('@source "../";', '@source "./index.js";'),
);
console.log('✓ dist/styles.css');
