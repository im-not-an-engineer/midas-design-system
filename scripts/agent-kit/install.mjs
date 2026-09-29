/* ax-lint-disable-file */
/**
 * 샌드박스 앱에 에이전트 키트를 깐다 ("키트 켬" 조건). 저장소 루트에서:
 *   node scripts/agent-kit/install.mjs ~/Documents/ds-sandbox/<앱 폴더>
 *
 * 까는 것
 *   src/kit/                       presets/saas 전체 (사람용 설계 문서는 뺀다 — 시험 힌트가 들어 있다)
 *   .claude/skills/화면-만들기/     SKILL.md (Claude Code 가 스스로 찾는 자리)
 *   scripts/agent-kit/             목록 생성 · 화면 검사 · 시나리오 실행기 · 계약 린트
 *   AGENTS.md + CLAUDE.md          상시 규칙 (공통 정책은 여기에 있다)
 *   src/App.tsx                    화면을 주소로 전환하는 시험용 진입점
 * 샌드박스에만 설치하는 도구: yaml, playwright-core (저장소 부품 패키지에는 넣지 않는다)
 */
import { cp, mkdir, rm, writeFile, readFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const app = path.resolve(process.argv[2] ?? '');
if (!process.argv[2]) { console.error('앱 폴더를 주세요'); process.exit(2); }
await readFile(path.join(app, 'package.json')).catch(() => { console.error(`${app} 은 샌드박스 앱이 아닙니다`); process.exit(2); });

const kit = path.join(app, 'src/kit');
await rm(kit, { recursive: true, force: true });
await cp(path.join(repo, 'presets/saas'), kit, { recursive: true, filter: (src) => !src.endsWith('설계.md') });

const skill = path.join(app, '.claude/skills/화면-만들기');
await mkdir(skill, { recursive: true });
await cp(path.join(repo, 'presets/saas/SKILL.md'), path.join(skill, 'SKILL.md'));

const scripts = path.join(app, 'scripts/agent-kit');
await mkdir(scripts, { recursive: true });
for (const f of ['lib.mjs', 'build-index.mjs', 'check-screen.mjs', 'run-scenario.mjs']) await cp(path.join(repo, 'scripts/agent-kit', f), path.join(scripts, f));
await cp(path.join(repo, 'scripts/check-contract.mjs'), path.join(scripts, 'contract.mjs'));

await cp(path.join(repo, 'AGENTS.md'), path.join(app, 'AGENTS.md'));
await writeFile(path.join(app, 'CLAUDE.md'), '@AGENTS.md\n');
await mkdir(path.join(app, 'src/screens'), { recursive: true });
await writeFile(path.join(app, 'src/App.tsx'), "export { default } from '@/kit/frame/kit-app';\n");

// 디자인시스템 파일의 원본 지문 — 에이전트가 부품·공용 코드를 고쳤는지 검사기가 본다.
// 처음 설치 때만 만든다(다시 설치해도 원본은 처음 모습 그대로 둔다).
const manifest = path.join(app, '.ax-원본.json');
if (!(await stat(manifest).catch(() => null))) {
  const sums = {};
  async function walk(dir) {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) await walk(p);
      else sums[path.relative(app, p)] = createHash('sha1').update(await readFile(p)).digest('hex');
    }
  }
  for (const d of ['src/components/ui', 'src/lib/ax']) await walk(path.join(app, d));
  await writeFile(manifest, JSON.stringify(sums, null, 2));
  console.log(`▸ 원본 지문 ${Object.keys(sums).length}개 기록`);
}
console.log('▸ 샌드박스 도구 설치 (yaml, playwright-core)');
execSync('npm i -s -D yaml@2 playwright-core', { cwd: app, stdio: 'inherit' });
execSync('node scripts/agent-kit/build-index.mjs', { cwd: app, stdio: 'inherit' });
console.log(`✓ 키트 설치 끝 — ${app}`);
