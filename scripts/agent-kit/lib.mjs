/* ax-lint-disable-file — 이 파일의 문자열은 클래스가 아니라 경로·필드 이름이다 */
/**
 * 에이전트 키트 공용 — 키트를 읽고, 형식을 검사한다.
 *
 * 같은 파일이 두 곳에서 돈다.
 *   저장소:   presets/saas            부품 이름은 packages/react/src/components 에서 찾는다
 *   샌드박스: src/kit (install.mjs 가 복사)  부품 이름은 src/components/ui 에서 찾는다
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';

const exists = (p) => stat(p).then(() => true, () => false);

/** 지금 어디서 도는지 알아낸다. */
export async function locate(cwd = process.cwd()) {
  if (await exists(path.join(cwd, 'src/kit/SKILL.md'))) {
    return { mode: 'app', root: cwd, kit: path.join(cwd, 'src/kit'), components: path.join(cwd, 'src/components/ui') };
  }
  if (await exists(path.join(cwd, 'presets/saas/SKILL.md'))) {
    return { mode: 'repo', root: cwd, kit: path.join(cwd, 'presets/saas'), components: path.join(cwd, 'packages/react/src/components') };
  }
  throw new Error('키트를 찾지 못했습니다 — 저장소 루트나 샌드박스 앱 루트에서 실행하세요');
}

/** `---` 머리말 + 본문 */
export function splitFront(src) {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(src);
  if (!m) return { front: null, body: src };
  return { front: YAML.parse(m[1]), body: m[2] };
}

/** 본문의 첫 번째 마크다운 표 → [{조건, 유형}] */
export function decisionTable(body) {
  const rows = body.split('\n').filter((l) => /^\s*\|/.test(l));
  return rows
    .map((l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()))
    .filter((cells) => cells.length >= 2 && !/^-+$/.test(cells[0].replace(/:/g, '')) && cells[0] !== '조건')
    .map(([조건, 유형]) => ({ 조건, 유형 }));
}

/** 첫 번째 # 제목 */
export const titleOf = (body) => (/^#\s+(.+)$/m.exec(body) ?? [])[1]?.trim() ?? '';

/** 부품 파일들의 export 이름 */
export async function knownExports(dir) {
  const names = new Set();
  for (const f of await readdir(dir)) {
    if (!/\.tsx?$/.test(f) || f.includes('.stories.')) continue;
    const src = await readFile(path.join(dir, f), 'utf8');
    for (const m of src.matchAll(/export\s+(?:function|const)\s+([A-Za-z_]\w*)/g)) names.add(m[1]);
  }
  return names;
}

/** 키트 전체를 읽는다. */
export async function loadKit(kitDir) {
  const shells = [];
  for (const id of (await readdir(path.join(kitDir, 'shells'))).sort()) {
    if (id.startsWith('_')) continue;
    const dir = path.join(kitDir, 'shells', id);
    if (!(await stat(dir)).isDirectory()) continue;
    const json = JSON.parse(await readFile(path.join(dir, 'shell.json'), 'utf8'));
    shells.push({ ...json, _dir: `shells/${id}`, _hasTsx: await exists(path.join(dir, 'shell.tsx')), _hasExample: json.예시 ? await exists(path.join(dir, json.예시)) : false });
  }
  const groups = [];
  for (const g of (await readdir(path.join(kitDir, 'policy'))).sort()) {
    const dir = path.join(kitDir, 'policy', g);
    if (!(await stat(dir)).isDirectory()) continue;
    const head = splitFront(await readFile(path.join(dir, '_갈래.md'), 'utf8'));
    const cards = [];
    for (const f of (await readdir(dir)).sort()) {
      if (f === '_갈래.md' || !f.endsWith('.md')) continue;
      const { front, body } = splitFront(await readFile(path.join(dir, f), 'utf8'));
      cards.push({ ...front, 제목: titleOf(body), _file: `policy/${g}/${f}` });
    }
    groups.push({ ...head.front, 결정표: decisionTable(head.body), cards, _dir: `policy/${g}`, _folder: g });
  }
  return { shells, groups };
}

const CARD_FIELDS = ['id', '갈래', '유형', '조건', '기본', '강도', '종류', '적용 셸', '부품', '검사', '보장'];
/** 사용자 행동 분류. 폴더(=결정)를 묶는 표시일 뿐 층이 아니다. */
export const 분류들 = ['조회', '선택', '입력', '삭제', '피드백', '이동', '표시'];
export const STEP_KINDS = ['기억', '기억글자', '누르기', '보인다', '안보인다', '개수', '막힘없음', '비활성', '활성', '바쁨', '입력', '떠나기', '값', '글자', '기다리기', '실패로열기', '다시열기'];

/** 카드 단계가 경로에서 찾는 이름들 */
export function pathNames(card) {
  const names = new Set();
  for (const g of card.보장 ?? []) {
    for (const step of g.단계 ?? []) {
      const [kind, v] = Object.entries(step)[0];
      if (kind === '막힘없음' || kind === '기다리기' || kind === '다시열기') continue;
      if (typeof v === 'string') names.add(v);
      else if (kind === '누르기') names.add(v.경로);
      else if (kind === '개수') { names.add(v.대상); if (v.같음?.경로) names.add(v.같음.경로); }
      else if (kind === '입력') { names.add(v.곳); names.add(v.값); }
      else if (kind === '값' || kind === '글자') { names.add(v.곳); if (v.포함?.경로) names.add(v.포함.경로); }
    }
  }
  return [...names];
}

/** 형식 검사. 틀이 스스로를 지키는 부분이다. */
export async function validateKit(kit, componentsDir) {
  const errors = [], warnings = [];
  const parts = await knownExports(componentsDir);
  const shellIds = new Set(kit.shells.map((s) => s.id));
  const cardIds = new Set();

  for (const s of kit.shells) {
    const at = s._dir;
    for (const k of ['id', '이름', '쓰는 때', '쓰지 않는 때', '슬롯', '부품', '최소 데이터']) if (s[k] == null) errors.push(`${at}: '${k}' 없음`);
    if (!s._hasTsx) errors.push(`${at}: shell.tsx 없음`);
    if (s.예시 && !s._hasExample) errors.push(`${at}: 예시 파일 '${s.예시}' 가 없음`);
    if (s.id !== at.split('/')[1]) errors.push(`${at}: id(${s.id}) 가 폴더 이름과 다름`);
    for (const n of s['쓰지 않는 때'] ?? []) if (!shellIds.has(n.이웃)) warnings.push(`${at}: 이웃 '${n.이웃}' 셸이 아직 없음`);
    for (const p of s.부품 ?? []) if (!parts.has(p)) errors.push(`${at}: 부품 '${p}' 가 부품 목록에 없음`);
    for (const st of ['empty', 'error', 'loading']) if (!s.슬롯?.[st]?.상태) errors.push(`${at}: 상태 슬롯 '${st}' 가 없음`);
  }

  for (const g of kit.groups) {
    const at = g._dir;
    if (!g.갈래 || !g.상황) errors.push(`${at}/_갈래.md: 갈래·상황 없음`);
    if (!분류들.includes(g.분류)) errors.push(`${at}/_갈래.md: 분류는 ${분류들.join('|')} 중 하나`);
    if (g.갈래 !== g._folder) errors.push(`${at}/_갈래.md: 갈래 이름(${g.갈래})이 폴더 이름과 다름`);
    if (!g.결정표.length) errors.push(`${at}/_갈래.md: 결정표 없음`);
    if (!g.결정표.some((r) => /정보가 없다/.test(r.조건))) errors.push(`${at}/_갈래.md: "정보가 없다" 기본값 줄이 없음`);
    const types = new Set(g.cards.map((c) => c.유형));
    for (const r of g.결정표) if (!types.has(r.유형)) errors.push(`${at}/_갈래.md: 결정표의 유형 '${r.유형}' 카드가 없음`);
    for (const c of g.cards) if (!g.결정표.some((r) => r.유형 === c.유형)) errors.push(`${c._file}: 결정표에 없는 유형`);
    const defaults = g.cards.filter((c) => c.기본 === true);
    if (defaults.length !== 1) errors.push(`${at}: 기본 카드가 ${defaults.length}장 (한 장이어야 함)`);
    const fallback = g.결정표.find((r) => /정보가 없다/.test(r.조건));
    if (fallback && defaults[0] && fallback.유형 !== defaults[0].유형) errors.push(`${at}: 기본값 줄(${fallback.유형})과 기본 카드(${defaults[0].유형})가 다름`);

    for (const c of g.cards) {
      const cat = c._file;
      for (const k of CARD_FIELDS) if (c[k] == null) errors.push(`${cat}: '${k}' 없음`);
      if (cardIds.has(c.id)) errors.push(`${cat}: id '${c.id}' 중복`);
      cardIds.add(c.id);
      if (c.갈래 !== g.갈래) errors.push(`${cat}: 갈래(${c.갈래})가 폴더와 다름`);
      if (!c.제목) errors.push(`${cat}: # 제목(상황 문장) 없음`);
      if (!['필수', '권장'].includes(c.강도)) errors.push(`${cat}: 강도는 필수|권장`);
      if (!['결과 보장', '경로 제약'].includes(c.종류)) errors.push(`${cat}: 종류는 결과 보장|경로 제약`);
      if (!['스크립트', '시나리오', '스크린샷'].includes(c.검사)) errors.push(`${cat}: 검사는 스크립트|시나리오|스크린샷`);
      for (const s of c['적용 셸'] ?? []) if (s !== '전부' && !shellIds.has(s)) errors.push(`${cat}: 적용 셸 '${s}' 없음`);
      for (const p of c.부품 ?? []) if (!parts.has(p)) errors.push(`${cat}: 부품 '${p}' 가 부품 목록에 없음`);
      const row = g.결정표.find((r) => r.유형 === c.유형 && !/정보가 없다/.test(r.조건));
      if (row && row.조건 !== c.조건) warnings.push(`${cat}: 조건 문구가 결정표와 다름`);
      for (const b of c.보장 ?? []) {
        if (!b.문장) errors.push(`${cat}: 보장에 문장 없음`);
        if (c.검사 === '시나리오' && !(b.단계?.length)) errors.push(`${cat}: 시나리오 검사인데 '${b.문장}' 에 단계가 없음`);
        for (const step of b.단계 ?? []) {
          const kind = Object.keys(step)[0];
          if (!STEP_KINDS.includes(kind)) errors.push(`${cat}: 모르는 단계 '${kind}'`);
        }
      }
    }
  }
  return { errors, warnings };
}

/** index.json 모양 — 에이전트가 처음 읽는 한 장. 제목·조건만 싣는다. */
export function toIndex(kit) {
  return {
    $설명: '자동 생성 — scripts/agent-kit/build-index.mjs. 손으로 고치지 않는다.',
    shells: kit.shells.filter((s) => !s.예비).map((s) => ({ id: s.id, 이름: s.이름, '쓰는 때': s['쓰는 때'], '쓰지 않는 때': s['쓰지 않는 때'], 파일: s._dir, ...(s.예시 ? { 예시: `${s._dir}/${s.예시}` } : {}) })),
    '맞는 셸이 없을 때': kit.shells.filter((s) => s.예비).map((s) => ({ id: s.id, 이름: s.이름, '쓰는 때': s['쓰는 때'], 파일: s._dir })),
    policy: [...kit.groups].sort((a, b) => 분류들.indexOf(a.분류) - 분류들.indexOf(b.분류)).map((g) => ({
      분류: g.분류,
      갈래: g.갈래,
      상황: g.상황,
      '여럿 가능': g['여럿 가능'] === true || undefined,
      결정표: g.결정표.map((r) => ({ ...r, id: g.cards.find((c) => c.유형 === r.유형)?.id })),
      카드: g.cards.map((c) => ({ id: c.id, 유형: c.유형, 제목: c.제목, 강도: c.강도, 종류: c.종류, '적용 셸': c['적용 셸'], 파일: c._file })),
    })),
  };
}
