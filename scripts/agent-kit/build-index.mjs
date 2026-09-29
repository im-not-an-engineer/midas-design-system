/* ax-lint-disable-file */
/**
 * 키트 목록(index.json)을 만들고, 그 전에 형식을 검사한다.
 *   node scripts/agent-kit/build-index.mjs            저장소 루트 또는 샌드박스 앱 루트에서
 *   node scripts/agent-kit/build-index.mjs --check    파일을 쓰지 않고 검사만 (목록이 최신인지도 본다)
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { locate, loadKit, validateKit, toIndex } from './lib.mjs';

const where = await locate();
const kit = await loadKit(where.kit);
const { errors, warnings } = await validateKit(kit, where.components);

for (const w of warnings) console.warn(`  ! ${w}`);
if (errors.length) {
  console.error(`\n✗ 키트 형식 오류 ${errors.length}개\n`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}

const out = path.join(where.kit, 'index.json');
const next = JSON.stringify(toIndex(kit), null, 2) + '\n';
if (process.argv.includes('--check')) {
  const cur = await readFile(out, 'utf8').catch(() => '');
  if (cur !== next) { console.error('✗ index.json 이 최신이 아닙니다 — node scripts/agent-kit/build-index.mjs'); process.exit(1); }
} else {
  await writeFile(out, next);
}
const cards = kit.groups.reduce((n, g) => n + g.cards.length, 0);
console.log(`✓ 키트 형식 통과 — 셸 ${kit.shells.length} · 갈래 ${kit.groups.length} · 카드 ${cards} · 경고 ${warnings.length}  (${where.mode})`);
