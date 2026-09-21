/**
 * 토큰 소스 JSON을 한 가지 포맷으로 맞춘다.
 *
 * 왜: 테마 랩이 저장할 때 JSON을 통째로 다시 쓴다. 파일 포맷이 제각각이면 값 한 개를
 * 바꿔도 파일 전체가 바뀐 것으로 보이고, 둘이 같이 작업할 때 충돌이 난다.
 *
 *   npm run format:tokens      고친다
 *   npm run build:tokens       어긋나 있으면 빌드가 막는다 (규칙 7)
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SRC = fileURLToPath(new URL('../packages/tokens/src/', import.meta.url));

export const normalized = (raw) => JSON.stringify(JSON.parse(raw), null, 2) + '\n';

export async function tokenFiles() {
  const out = [];
  for (const dir of await readdir(SRC, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    for (const f of await readdir(path.join(SRC, dir.name))) {
      if (f.endsWith('.json')) out.push(path.join(SRC, dir.name, f));
    }
  }
  return out.sort();
}

/** 어긋난 파일 목록. 빌드가 이걸로 막는다. */
export async function unformatted() {
  const bad = [];
  for (const f of await tokenFiles()) {
    const raw = await readFile(f, 'utf8');
    if (raw !== normalized(raw)) bad.push(path.relative(path.join(SRC, '..'), f));
  }
  return bad;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let n = 0;
  for (const f of await tokenFiles()) {
    const raw = await readFile(f, 'utf8');
    const norm = normalized(raw);
    if (raw !== norm) { await writeFile(f, norm); n++; console.log('  고침 ' + path.relative(process.cwd(), f)); }
  }
  console.log(n ? `✓ ${n}개 파일 정규화` : '✓ 이미 모두 정규화되어 있습니다');
}
