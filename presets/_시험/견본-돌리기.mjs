/* ax-lint-disable-file */
/**
 * 견본 화면으로 카드를 검증한다 — 카드의 시나리오가 **맞게 만든 화면에서 통과하는지** 본다.
 * (본 시험에서 실패가 나왔을 때 "카드가 틀렸다"를 먼저 지워 두기 위해서다.)
 *
 *   node presets/_시험/견본-돌리기.mjs ~/Documents/ds-sandbox/<키트 켠 앱> [s01 s02 …]
 *
 * 견본은 presets/_시험/견본/<id>/ 에 있고, 에이전트용 키트(설치기)에는 들어가지 않는다.
 */
import { cp, readdir, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const app = path.resolve(process.argv[2] ?? '');
const all = (await readdir(path.join(here, '견본'))).filter((d) => !d.startsWith('.')).sort();
const ids = process.argv.slice(3).length ? process.argv.slice(3) : all.filter((d) => !d.startsWith('_'));

for (const d of all) {
  await rm(path.join(app, 'src/screens', d), { recursive: true, force: true });
  await cp(path.join(here, '견본', d), path.join(app, 'src/screens', d), { recursive: true });
}

const rows = [];
for (const id of ids) {
  const dir = `src/screens/${id}`;
  const check = spawnSync('node', ['scripts/agent-kit/check-screen.mjs', dir], { cwd: app, encoding: 'utf8' });
  const scen = spawnSync('node', ['scripts/agent-kit/run-scenario.mjs', dir, '--기록', `/tmp/견본-${id}.json`], { cwd: app, encoding: 'utf8' });
  const table = (out) => out.split('\n').filter((l) => l.startsWith('| ') && !l.startsWith('| 항목') && !l.startsWith('| 카드'));
  const fails = [...table(check.stdout), ...table(scen.stdout)].filter((l) => l.includes('| 실패 |'));
  const passes = [...table(check.stdout), ...table(scen.stdout)].filter((l) => l.includes('| 통과 |')).length;
  rows.push({ id, 정적: check.status === 0 ? '통과' : '실패', 시나리오: scen.status === 0 ? '통과' : '실패', 통과: passes, 실패: fails });
  console.log(`\n── ${id}: 정적 ${check.status === 0 ? '통과' : '실패'} · 시나리오 ${scen.status === 0 ? '통과' : '실패'} (통과 ${passes})`);
  for (const f of fails) console.log('   ' + f);
  if (check.status !== 0 && !fails.length) console.log(check.stdout.slice(-800), check.stderr.slice(-800));
  if (scen.status !== 0 && !fails.length) console.log(scen.stdout.slice(-800), scen.stderr.slice(-800));
}
await writeFile(path.join(here, '기록/2단계-견본.json'), JSON.stringify(rows, null, 2));
const bad = rows.filter((r) => r.정적 !== '통과' || r.시나리오 !== '통과');
console.log(`\n${bad.length ? `✗ 견본 ${bad.length}개 실패` : `✓ 견본 ${rows.length}개 모두 통과`}`);
process.exit(bad.length ? 1 : 0);
