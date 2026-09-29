/* ax-lint-disable-file — 이 파일의 문자열은 클래스가 아니라 필드 이름이다 */
/**
 * 화면 하나를 정적으로 검사한다 (샌드박스 앱 루트에서).
 *   node scripts/agent-kit/check-screen.mjs src/screens/<화면-id>
 *
 * 보는 것: 명세 칸 · 셸 존재와 이웃 · 슬롯 · 정책 적용 범위 · 경로 이름 · 셸 사용 ·
 *          카드 부품 사용 · 계약 린트 · 타입 검사.
 */
import { readFile, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { __unstable__loadDesignSystem } from 'tailwindcss';
import { locate, loadKit, pathNames } from './lib.mjs';
import { extractCandidates, NOT_A_CLASS } from './contract.mjs';

const screenDir = path.resolve(process.argv[2] ?? '');
const screenId = path.basename(screenDir);
const where = await locate();
if (where.mode !== 'app') { console.error('샌드박스 앱 루트에서 실행하세요'); process.exit(2); }
const kit = await loadKit(where.kit);
const cards = new Map(kit.groups.flatMap((g) => g.cards.map((c) => [c.id, c])));

const rows = [];
const ok = (항목, 내용 = '') => rows.push({ 항목, 결과: '통과', 내용 });
const bad = (항목, 내용) => rows.push({ 항목, 결과: '실패', 내용 });
const warn = (항목, 내용) => rows.push({ 항목, 결과: '주의', 내용 });

// ── 1. 명세 ────────────────────────────────────────────────────────────────
let spec;
try { spec = JSON.parse(await readFile(path.join(screenDir, '명세.json'), 'utf8')); ok('명세 읽기'); }
catch (e) { bad('명세 읽기', e.message); report(); }

const blank = (v) => v == null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && !v.length);
const missing = ['요구 요약', '주소', '데이터', '셸', '슬롯', '정책', '경로'].filter((k) => blank(spec[k]));
missing.length ? bad('명세 칸', `빈 칸: ${missing.join(', ')}`) : ok('명세 칸');
spec.주소 === `#/${screenId}` ? ok('주소') : bad('주소', `"#/${screenId}" 이어야 함 (지금 ${spec.주소})`);

// ── 2. 셸 ──────────────────────────────────────────────────────────────────
const shell = kit.shells.find((s) => s.id === spec.셸?.id);
if (!shell) { bad('셸', `'${spec.셸?.id}' 는 키트에 없음`); report(); }
blank(spec.셸.이유) ? bad('셸 이유', '비어 있음') : ok('셸 이유');
if (shell.예비) {
  const lack = ['가장 가까운', '부족한 점'].filter((k) => blank(spec.셸[k]));
  lack.length ? bad('자유 화면 기록', `${lack.join(' · ')} 없음 — 새 셸을 만들 재료다`) : ok('자유 화면 기록', `가장 가까운: ${spec.셸['가장 가까운']}`);
}
const excluded = spec.셸['제외한 이웃'] ?? [];
const knownNeighbors = new Set(shell.예비 ? kit.shells.map((x) => x.id) : shell['쓰지 않는 때'].map((n) => n.이웃));
if (!excluded.length) bad('제외한 이웃', '하나도 없음 — 이웃과 비교하지 않았다');
else {
  const noReason = excluded.filter((n) => blank(n.이유)).map((n) => n.id);
  const unknown = excluded.filter((n) => !knownNeighbors.has(n.id)).map((n) => n.id);
  if (noReason.length) bad('제외한 이웃', `이유 없음: ${noReason.join(', ')}`);
  else if (unknown.length) warn('제외한 이웃', `셸 메타의 이웃이 아님: ${unknown.join(', ')}`);
  else ok('제외한 이웃', excluded.map((n) => n.id).join(', '));
}

// ── 3. 슬롯 ────────────────────────────────────────────────────────────────
const slotProblems = [];
for (const [name, def] of Object.entries(shell.슬롯)) {
  const v = spec.슬롯?.[name];
  if (def.필수 && blank(v)) slotProblems.push(`${name} 비어 있음`);
  if (def.상태 && v && typeof v === 'object' && blank(v.없음)) slotProblems.push(`${name}: 없음의 이유가 비어 있음`);
}
for (const name of Object.keys(spec.슬롯 ?? {})) if (!shell.슬롯[name]) slotProblems.push(`${name} 은 셸에 없는 슬롯`);
slotProblems.length ? bad('슬롯', slotProblems.join(' · ')) : ok('슬롯', `${Object.keys(spec.슬롯).length}개`);

// ── 4. 정책 ────────────────────────────────────────────────────────────────
const chosen = [];
const policyProblems = [];
for (const p of spec.정책 ?? []) {
  const c = cards.get(p.id);
  if (!c) { policyProblems.push(`'${p.id}' 카드 없음`); continue; }
  if (blank(p['근거 조건'])) policyProblems.push(`${p.id}: 근거 조건 없음`);
  if (!c['적용 셸'].includes('전부') && !c['적용 셸'].includes(shell.id)) policyProblems.push(`${p.id}: 이 셸(${shell.id})에는 적용되지 않는 카드`);
  chosen.push(c);
}
const perGroup = {};
for (const c of chosen) (perGroup[c.갈래] ??= []).push(c.유형);
const multiOk = new Set(kit.groups.filter((g) => g['여럿 가능'] === true).map((g) => g.갈래));
const multi = Object.entries(perGroup).filter(([g, t]) => t.length > 1 && !multiOk.has(g));
policyProblems.length ? bad('정책', policyProblems.join(' · '))
  : multi.length ? warn('정책', `한 갈래에 유형 둘 이상: ${multi.map(([g, t]) => `${g}(${t.join('+')})`).join(', ')}`)
  : ok('정책', chosen.map((c) => `${c.갈래}/${c.유형}`).join(', ') || '없음');

// ── 5. 경로 ────────────────────────────────────────────────────────────────
const pathProblems = [];
const pathWarn = [];
for (const c of chosen.filter((c) => c.검사 === '시나리오')) {
  const given = spec.경로?.[c.id] ?? {};
  const need = pathNames(c);
  const lack = need.filter((n) => given[n] == null);
  if (lack.length) pathProblems.push(`${c.id}: ${lack.join(', ')} 없음`);
  for (const [n, v] of Object.entries(given)) {
    for (const loc of [v].flat()) {
      if (loc && typeof loc === 'object' && !loc.역할 && !loc.글자) pathProblems.push(`${c.id}.${n}: 역할(또는 글자) 없음`);
      // 목록 항목은 안의 글자가 이름이 되지 않는다(ARIA) — 이름으로는 영원히 못 찾고, "안보인다"가 가짜로 통과한다
      if (loc?.역할 === 'listitem' && loc.이름) pathWarn.push(`${c.id}.${n}: listitem 은 이름으로 찾을 수 없다 — { "글자": "…", "안": 목록 } 으로`);
    }
  }
}
// 실패 흉내: 카드가 실패로 열어 보는 동작은 명세의 '실패 흉내' 에 적혀 있어야 한다
for (const c of chosen.filter((c) => c.검사 === '시나리오')) {
  for (const g of c.보장) for (const step of g.단계 ?? []) {
    if (!('실패로열기' in step)) continue;
    const action = spec.경로?.[c.id]?.[step.실패로열기];
    if (typeof action !== 'string') pathProblems.push(`${c.id}.${step.실패로열기}: 실패시킬 동작 이름(문자열)이 필요`);
    else if (!spec['실패 흉내']?.[action]) pathProblems.push(`${c.id}: 명세 '실패 흉내' 에 '${action}' 이 없음`);
  }
}
pathProblems.length ? bad('경로', pathProblems.join(' · ')) : pathWarn.length ? bad('경로', pathWarn.join(' · ')) : ok('경로');

// ── 6. 코드 ────────────────────────────────────────────────────────────────
const files = [];
for (const f of await readdir(screenDir)) if (/\.tsx?$/.test(f)) files.push(path.join(screenDir, f));
const source = (await Promise.all(files.map((f) => readFile(f, 'utf8')))).join('\n');
if (!files.some((f) => path.basename(f) === 'index.tsx')) bad('화면 파일', 'index.tsx 없음');
else ok('화면 파일', files.map((f) => path.basename(f)).join(', '));

const imported = [...new Set([...source.matchAll(/@\/kit\/shells\/([\w-]+)\/shell/g)].map((m) => m[1]))];
const declared = [shell.id, ...(spec['추가 셸'] ?? []).map((x) => x.id)];
const undeclared = imported.filter((x) => !declared.includes(x));
const unknownExtra = (spec['추가 셸'] ?? []).filter((x) => !kit.shells.some((k) => k.id === x.id)).map((x) => x.id);
if (!imported.includes(shell.id)) bad('셸 사용', `@/kit/shells/${shell.id}/shell 을 가져오지 않음 — 셸을 흉내 내어 새로 짰는가?`);
else if (unknownExtra.length) bad('셸 사용', `추가 셸에 없는 셸: ${unknownExtra.join(', ')}`);
else if (undeclared.length) bad('셸 사용', `명세에 없는 셸을 씀: ${undeclared.join(', ')} — 명세 '추가 셸' 에 적는다`);
else ok('셸 사용', imported.join(' + '));
/useShellState\(/.test(source) ? ok('상태 스위치') : bad('상태 스위치', 'useShellState 를 거치지 않음 — 검사기가 상태를 띄워 볼 수 없다');
if (Object.keys(spec['실패 흉내'] ?? {}).length) {
  const lack = Object.keys(spec['실패 흉내']).filter((a) => !source.includes(`'${a}'`));
  !/useShellFail\(/.test(source) ? bad('실패 스위치', 'useShellFail 을 쓰지 않음')
    : lack.length ? bad('실패 스위치', `코드에 없는 동작 이름: ${lack.join(', ')}`) : ok('실패 스위치', Object.keys(spec['실패 흉내']).join(', '));
}

const partProblems = [];
for (const c of chosen) {
  const lack = c.부품.filter((p) => !new RegExp(`\\b${p}\\b`).test(source));
  if (lack.length) partProblems.push(`${c.id}: ${lack.join(', ')}`);
}
partProblems.length ? bad('카드 부품', `안 씀 — ${partProblems.join(' · ')}`) : ok('카드 부품');

// ── 7. 계약 린트 ───────────────────────────────────────────────────────────
const cssPath = path.join(where.root, 'src/index.css');
const design = await __unstable__loadDesignSystem(await readFile(cssPath, 'utf8'), {
  base: path.dirname(cssPath),
  loadStylesheet: async (id, base) => {
    const p = id === 'tailwindcss' ? path.join(where.root, 'node_modules/tailwindcss/index.css') : path.resolve(base, id);
    return { base: path.dirname(p), content: await readFile(p, 'utf8') };
  },
  loadModule: async () => { throw new Error('플러그인 없음'); },
});
const lint = [];
const skipped = [];
for (const f of files) {
  const src = await readFile(f, 'utf8');
  // 목데이터 파일은 첫 줄 표시로 린트에서 뺀다 — 대신 클래스를 쓰면 안 된다.
  if (src.includes('ax-lint-disable-file')) {
    skipped.push(path.basename(f));
    if (/className|cn\(/.test(src)) lint.push(`${path.basename(f)}: 린트 제외 파일에 클래스가 있음`);
    continue;
  }
  const found = extractCandidates(src);
  design.candidatesToCss(found.map((x) => x.candidate)).forEach((css, i) => {
    if (css === null && !NOT_A_CLASS.some((re) => re.test(found[i].candidate))) lint.push(`${path.basename(f)}:${found[i].line} ${found[i].candidate}`);
  });
}
lint.length ? bad('계약 린트', lint.join(' · ')) : ok('계약 린트', `위반 0${skipped.length ? ` (제외: ${skipped.join(', ')})` : ''}`);

// ── 7-1. 디자인시스템 파일을 고쳤는가 ──────────────────────────────────────
try {
  const sums = JSON.parse(await readFile(path.join(where.root, '.ax-원본.json'), 'utf8'));
  const changed = [];
  for (const [rel, sum] of Object.entries(sums)) {
    const now = await readFile(path.join(where.root, rel)).then((b) => createHash('sha1').update(b).digest('hex'), () => '(지워짐)');
    if (now !== sum) changed.push(rel);
  }
  // 키트 파일은 저장소 원본과 같아야 한다 (설치기가 매번 새로 깐다 — 여기서는 셸만 본다)
  const icons = changed.filter((f) => f.endsWith('lib/ax/icons.ts'));
  const others = changed.filter((f) => !icons.includes(f));
  if (others.length) bad('디자인시스템 파일', `고쳤다: ${others.join(', ')} — 부품은 고치지 않는다. 필요한 기능은 화면 쪽에서 조립하고 확인 필요에 적는다`);
  else if (icons.length) warn('디자인시스템 파일', '아이콘 목록(icons.ts)에 추가했다 — 사람이 정할 일, 확인 필요에 적었는지 본다');
  else ok('디자인시스템 파일', '원본 그대로');
} catch { warn('디자인시스템 파일', '원본 지문(.ax-원본.json)이 없어 볼 수 없다'); }

// ── 8. 타입 검사 ───────────────────────────────────────────────────────────
try {
  execFileSync('npx', ['tsc', '--noEmit', '-p', '.'], { cwd: where.root, stdio: 'pipe' });
  ok('타입 검사');
} catch (e) {
  const out = String(e.stdout ?? '').split('\n').filter((l) => l.includes(`src/screens/${screenId}/`) || l.includes('src/kit/'));
  out.length ? bad('타입 검사', out.slice(0, 5).join(' · ')) : warn('타입 검사', '이 화면 밖에서 오류 (다른 화면)');
}

report();

function report() {
  console.log(`\n화면 ${screenId} — 정적 검사\n`);
  console.log('| 항목 | 결과 | 내용 |\n|---|---|---|');
  for (const r of rows) console.log(`| ${r.항목} | ${r.결과} | ${r.내용.replace(/\|/g, '/')} |`);
  const fails = rows.filter((r) => r.결과 === '실패').length;
  console.log(`\n${fails ? `✗ 실패 ${fails}` : '✓ 통과'}\n`);
  process.exit(fails ? 1 : 0);
}
