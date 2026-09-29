/* ax-lint-disable-file */
/**
 * 3단계 채점 — 새 세션이 만든 화면을 채점표로 판정한다. 저장소 루트에서:
 *   node presets/_시험/채점.mjs ~/Documents/ds-sandbox/kit-on            (그 앱의 화면 전부)
 *   node presets/_시험/채점.mjs ~/Documents/ds-sandbox/kit-on r03 r04    (골라서)
 *
 * 보는 것
 *   선택   고른 셸 = 정답/허용인가 · 핵심 유형을 골랐는가 · 금지 유형을 골랐는가 · 맞는 셸이 없을 때 멈췄는가
 *   동작   정적 검사 · 시나리오(에이전트가 고른 유형이 아니라 **정답 유형**으로)
 *   과정   세션 기록에서 키트의 어떤 파일을 열었는가 (찾을 수 있을 때)
 * 결과는 presets/_시험/기록/3단계/<앱 이름>.json · .md 로 남는다.
 */
import { readFile, readdir, writeFile, mkdir, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const app = path.resolve(process.argv[2] ?? '');
const appName = path.basename(app);
const 채점표 = JSON.parse(await readFile(path.join(here, '채점표.json'), 'utf8'));
const exists = (p) => stat(p).then(() => true, () => false);
const screensDir = path.join(app, 'src/screens');
const present = (await readdir(screensDir).catch(() => [])).filter((d) => 채점표[d]);
const ids = process.argv.slice(3).length ? process.argv.slice(3) : present;
if (!ids.length) { console.error(`${screensDir} 에 채점표의 화면(r03 …)이 없습니다`); process.exit(2); }

const opened = await sessionReads();
const results = [];

for (const id of ids) {
  const g = 채점표[id];
  if (!g) { console.error(`  ! ${id} 는 채점표에 없다 — 건너뜀`); continue; }
  const dir = path.join(screensDir, id);
  const r = { id, 정답셸: g.셸, 허용: g.허용 ?? [] };
  let spec = null;
  try { spec = JSON.parse(await readFile(path.join(dir, '명세.json'), 'utf8')); } catch { r.명세 = '없음'; }
  if (spec) {
    const chose = spec.셸?.id ?? null;
    r.고른셸 = chose;
    r.셸판정 = g.셸 === 'free'
      ? (chose === 'free' ? (spec.셸['부족한 점'] ? '정답(자유 화면)' : '정답(자유 화면 · 부족한 점 없음)') : chose === null ? '멈춤(옛 규칙)' : '오답(억지로 끼움)')
      : chose === g.셸 ? '정답' : (g.허용 ?? []).includes(chose) ? '허용' : chose === 'free' ? '오답(맞는 셸이 있는데 자유 화면)' : chose === null ? '오답(멈춤)' : '오답';
    r.추가셸 = (spec['추가 셸'] ?? []).map((x) => x.id);
    const picked = (spec.정책 ?? []).map((p) => p.id);
    r.고른유형 = picked;
    r.핵심놓침 = (g.핵심 ?? []).filter((x) => !picked.includes(x));
    r.금지고름 = (g.금지 ?? []).filter((x) => picked.includes(x));
    // 확장 자리: 명세 슬롯에 적고 코드에서 실제로 넘겼는가
    const code = await readFile(path.join(dir, 'index.tsx'), 'utf8').catch(() => '');
    r.확장놓침 = (g.확장 ?? []).filter((k) => !spec.슬롯?.[k] || !new RegExp(`\\b${k}=\\{`).test(code));
    r.확인필요 = spec['확인 필요'] ?? [];
    if (chose) {
      const c = spawnSync('node', ['scripts/agent-kit/check-screen.mjs', `src/screens/${id}`], { cwd: app, encoding: 'utf8' });
      r.정적 = c.status === 0 ? '통과' : '실패';
      r.정적실패 = c.stdout.split('\n').filter((l) => l.includes('| 실패 |'));
      if (g.유형) {
        const out = path.join(os.tmpdir(), `채점-${appName}-${id}.json`);
        const s = spawnSync('node', ['scripts/agent-kit/run-scenario.mjs', `src/screens/${id}`, ...(g.유형.length ? ['--기대', g.유형.join(',')] : []), '--기록', out, '--사진', path.join(here, '기록/3단계', `${appName}-${id}.png`)], { cwd: app, encoding: 'utf8' });
        r.시나리오 = s.status === 0 ? '통과' : '실패';
        try { r.시나리오행 = JSON.parse(await readFile(out, 'utf8')).rows; } catch { r.시나리오행 = []; r.시나리오오류 = (s.stderr || s.stdout).slice(-400); }
      }
    }
  }
  r.연파일 = opened[id] ?? null;
  results.push(r);
}

await mkdir(path.join(here, '기록/3단계'), { recursive: true });
await writeFile(path.join(here, '기록/3단계', `${appName}.json`), JSON.stringify(results, null, 2));

const line = (r) => {
  const scen = r.시나리오행 ? `${r.시나리오행.filter((x) => x.결과 === '통과').length}/${r.시나리오행.filter((x) => x.결과 !== '해당 없음').length}` : r.시나리오 ?? '-';
  return `| ${r.id} | ${r.고른셸 ?? (r.명세 ? '명세 없음' : '멈춤')} → ${r.셸판정 ?? '-'} | ${[r.핵심놓침?.length ? '놓침: ' + r.핵심놓침.join(', ') : '', r.확장놓침?.length ? '확장 안 씀: ' + r.확장놓침.join(', ') : ''].filter(Boolean).join(' · ') || '✓'} | ${r.금지고름?.length ? r.금지고름.join(', ') : '✓'} | ${r.정적 ?? '-'} | ${scen} | ${r.확인필요?.length ?? 0} | ${r.연파일 ? `셸 ${r.연파일.셸.length}/${r.연파일.셸전체} · 카드 ${r.연파일.카드.length}/${r.연파일.카드전체}` : '?'} |`;
};
const md = [
  `# 3단계 채점 — ${appName}`, '',
  '| 요구 | 셸 (고름 → 판정) | 핵심 유형 · 확장 자리 | 금지 유형 | 정적 | 시나리오 (정답 유형) | 확인 필요 | 연 키트 파일 |',
  '|---|---|---|---|---|---|---|---|',
  ...results.map(line), '',
  ...results.flatMap((r) => [
    `## ${r.id}`,
    `- 고른 유형: ${(r.고른유형 ?? []).join(', ') || '없음'}`,
    ...(r.추가셸?.length ? [`- 추가 셸: ${r.추가셸.join(', ')}`] : []),
    ...(r.정적실패?.length ? ['- 정적 실패:', ...r.정적실패.map((l) => `  ${l}`)] : []),
    ...(r.시나리오행 ?? []).filter((x) => x.결과 === '실패').map((x) => `- 시나리오 실패: ${x.카드} — ${x.보장} — ${x.메모}`),
    ...(r.확인필요?.length ? [`- 확인 필요: ${r.확인필요.join(' / ')}`] : []),
    ...(r.연파일 ? [`- 연 셸: ${r.연파일.셸.join(', ') || '없음'} · 연 카드: ${r.연파일.카드.join(', ') || '없음'}`, ...(r.연파일.검사도구소스 ? ['- ⚠ 검사 도구의 소스를 읽었다 (시험지를 들여다본 것 — 절차 문서에 설명이 부족하다는 신호)'] : []), ...(r.연파일.저장소명령 ? ['- ⚠ 저장소 명령(npm run verify)을 찾았다 — 소비자 앱에 없는 명령 (설계 12절)'] : []), ...(r.연파일.같은대화재사용 ? ['- ⚠ 같은 대화에서 다시 요청했다 — 앞 대화의 맥락이 남아 있다 (새 대화로 다시 돌릴 것)'] : [])] : ['- 연 키트 파일: 세션 기록을 찾지 못함']),
    '',
  ]),
].join('\n');
await writeFile(path.join(here, '기록/3단계', `${appName}.md`), md);
console.log(md.split('\n## ')[0]);
console.log(`\n기록: presets/_시험/기록/3단계/${appName}.md`);

/**
 * 세션 기록(~/.claude/projects/<앱 경로>/*.jsonl)에서 `[r03]` 요청을 받은 세션을 찾아,
 * 그 세션이 연 src/kit 파일을 모은다. 앱 폴더 이름은 영문으로 짓는 편이 찾기 쉽다(kit-on 등).
 */
async function sessionReads() {
  const base = path.join(os.homedir(), '.claude/projects');
  const want = app.replace(/[^A-Za-z0-9]/g, '-');
  const index = JSON.parse(await readFile(path.join(app, 'src/kit/index.json'), 'utf8').catch(() => '{"shells":[],"policy":[]}'));
  const shellIds = [...index.shells, ...(index['맞는 셸이 없을 때'] ?? [])].map((x) => x.id);
  const cardFiles = index.policy.flatMap((g) => g.카드.map((c) => ({ id: c.id, file: c.파일.replace(/^policy\//, '') })));
  const byReq = {};
  for (const d of (await readdir(base).catch(() => [])).filter((x) => x === want)) {
    const files = [];
    for (const f of await readdir(path.join(base, d))) if (f.endsWith('.jsonl')) files.push({ f, t: (await stat(path.join(base, d, f))).mtimeMs });
    for (const { f } of files.sort((a, b) => a.t - b.t)) { // 오래된 것부터 — 같은 요청이면 나중 세션이 이긴다
      const lines = (await readFile(path.join(base, d, f), 'utf8')).split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
      let req = null;
      const calls = [];
      let skills = 0;
      for (const e of lines) {
        const content = e.message?.content;
        const texts = typeof content === 'string' ? [content] : Array.isArray(content) ? content.filter((c) => c.type === 'text').map((c) => c.text) : [];
        if (e.type === 'user' && !req) for (const t of texts) { const m = /\[(r\d+)\]/.exec(t); if (m) req = m[1]; }
        if (Array.isArray(content)) for (const c of content) if (c.type === 'tool_use' && c.name === 'Skill') skills++;
        if (Array.isArray(content)) for (const c of content) if (c.type === 'tool_use') { calls.push(JSON.stringify(c.input ?? {})); const m = /\[(r\d+)\]/.exec(JSON.stringify(c.input ?? {})); if (!req && m) req = m[1]; }
      }
      if (!req) continue;
      const text = calls.join('\n');
      // 셸은 'shells/<id>/' 로, 카드는 '<결정>/<유형>.md' 로 대조한다 (cat · for 루프 · Read 어느 쪽으로 읽었든)
      const shells = shellIds.filter((id) => new RegExp(`shells/${id}(?![\\w-])`).test(text));
      const cards = cardFiles.filter((c) => text.includes(c.file.replace(/\.md$/, ''))).map((c) => c.id);
      byReq[req] = { 셸: shells, 카드: cards, 셸전체: shellIds.length, 카드전체: cardFiles.length, 목록: text.includes('index.json'),
        검사도구소스: /agent-kit\/(check-screen|run-scenario|lib)\.mjs/.test(text.replace(/node scripts\/agent-kit\/(check-screen|run-scenario)\.mjs/g, '')),
        저장소명령: /npm run verify/.test(text), 같은대화재사용: skills > 1,
        부품수정: /components\/ui\/[\w-]+\.tsx['"]?\s*\n?[^\n]*(s\.replace|open\(p,'w'\)|Write|Edit)/.test(text) || /"file_path":"[^"]*components\/ui\//.test(text) };
    }
  }
  return byReq;
}
