/**
 * 토큰 빌드 로직.
 *
 * CLI(build.mjs)와 테마 랩 개발 서버가 **이 파일 하나를** 함께 쓴다.
 * 랩의 미리보기가 실제 빌드 결과와 어긋날 수 없게 하기 위해서다 — 미리보기를
 * 클라이언트에서 따로 흉내 내면 규칙과 조용히 멀어진다.
 *
 * 구조:  palette(재질) ← ramp(역할, 브랜드가 정함) ← semantic(계약) ← 컴포넌트
 *
 * 강제하는 규칙:
 *   1. palette와 ramp는 CSS로 나가지 않는다.
 *   2. delta는 2층 계약에 이미 있는 키만 덮을 수 있다.
 *   3. 브랜드와 아키타입은 같은 키를 건드릴 수 없다 (브랜드=색, 아키타입=치수).
 *   4. dark.json은 2층의 모든 색 키를 명시적으로 덮어야 한다.
 *   5. 브랜드가 시맨틱 색 키를 덮었으면 brand/<이름>.dark.json이 그 키들을 전부 덮어야 한다.
 *   6. 램프는 $ramp 축약으로 통째로만 바꾼다.
 *   8. 같은 치수 사다리 안의 단계는 반드시 커져야 한다 (sm < md < lg). 같아도 실패.
 *      (7은 소스 포맷 규칙으로 build.mjs에 있다 — 랩은 항상 정규화해 쓰므로 여기서 볼 게 없다.)
 */
import StyleDictionary from 'style-dictionary';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

/** 2층 계약의 최상위 이름. 여기 없는 최상위(palette, ramp)는 CSS로 나가지 않는다. — 규칙 1 */
export const CONTRACT_ROOTS = new Set(['color', 'size', 'space', 'radius', 'border', 'focusRing', 'elevation', 'motion', 'opacity', 'z', 'font']);

/** 토큰 경로 → CSS 변수 이름. Tailwind v4 네임스페이스에 그대로 얹는다. */
const NAME_MAP = [
  [['color'],                 (p) => `color-${p.slice(1).join('-')}`],
  [['size', 'control'],       (p) => `spacing-control-${p.slice(2).join('-')}`],
  [['size', 'icon'],          (p) => `spacing-icon-${p.slice(2).join('-')}`],
  [['size', 'row'],           (p) => `spacing-row-${p.slice(2).join('-')}`],
  [['space'],                 (p) => `spacing-${p.slice(1).join('-')}`],
  [['radius'],                (p) => `radius-${p.slice(1).join('-')}`],
  [['border', 'width'],       (p) => `border-width-${p.slice(2).join('-')}`],
  [['focusRing'],             (p) => `focus-ring-${p.slice(1).join('-')}`],
  // Tailwind의 shadow 유틸리티는 값을 빌드 시점에 인라인해서 런타임 테마 교체가 안 된다.
  // 그래서 --shadow-* 네임스페이스를 피하고, styles.css에서 var()를 읽는 유틸리티를 직접 만든다.
  [['elevation'],             (p) => `elevation-${p.slice(1).join('-')}`],
  [['font', 'family'],        (p) => `font-${p.slice(2).join('-')}`],
  [['font', 'size'],          (p) => `text-${p.slice(2).join('-')}`],
  [['font', 'weight'],        (p) => `font-weight-${p.slice(2).join('-')}`],
  [['font', 'lineHeight'],    (p) => `leading-${p.slice(2).join('-')}`],
  [['font', 'letterSpacing'], (p) => `tracking-${p.slice(2).join('-')}`],
  [['motion', 'duration'],    (p) => `duration-${p.slice(2).join('-')}`],
  [['motion', 'easing'],      (p) => `ease-${p.slice(2).join('-')}`],
  [['opacity'],               (p) => `opacity-${p.slice(1).join('-')}`],
  [['z'],                     (p) => `z-${p.slice(1).join('-')}`],
];
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
export function cssVarName(tokenPath) {
  for (const [prefix, fn] of NAME_MAP) if (prefix.every((seg, i) => tokenPath[i] === seg)) return `--${kebab(fn(tokenPath))}`;
  return null;
}

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
/** 깊은 병합. b가 이긴다. 토큰 노드({$value…})는 통째로 교체한다. */
function deepMerge(a, b) {
  if (!isObj(a) || !isObj(b)) return b;
  if ('$value' in b || '$ramp' in b) return b;
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = k in a ? deepMerge(a[k], v) : v;
  return out;
}

const readJson = async (p) => JSON.parse(await readFile(p, 'utf8'));

/**
 * 소스 파일들을 순서대로 읽어 하나의 토큰 객체로 합친다.
 * overlay는 { '<src 기준 상대경로>': <부분 JSON> } 형태의 초안이다 — 파일에 쓰기 전의 편집 내용.
 */
async function loadTokens(src, files, overlay = {}) {
  let merged = {};
  for (const rel of files) {
    let json = await readJson(path.join(src, rel));
    if (overlay[rel]) json = deepMerge(json, overlay[rel]);
    merged = deepMerge(merged, json);
  }
  return merged;
}

/** $ramp 축약 펼치기 — 규칙 6. "neutral": { "$ramp": "{palette.stone}" } → 모든 단계로. */
function expandRamps(tokens) {
  const ramp = tokens.ramp;
  if (!ramp) throw new Error('brand/default.json 에 ramp 정의가 없습니다.');
  for (const [name, group] of Object.entries(ramp)) {
    if (name.startsWith('$')) continue;
    const short = group.$ramp;
    if (!short) throw new Error(`ramp.${name} 은 $ramp 축약으로만 정의할 수 있습니다 (단계 일부만 바꾸는 것은 금지). — 규칙 6`);
    const m = /^\{palette\.([a-zA-Z0-9]+)\}$/.exec(short);
    if (!m) throw new Error(`ramp.${name}.$ramp 값은 "{palette.<재질>}" 형식이어야 합니다: ${short}`);
    const material = tokens.palette?.[m[1]];
    if (!material) throw new Error(`ramp.${name} 이 가리키는 palette.${m[1]} 이 없습니다.`);
    const steps = Object.keys(material).filter((k) => !k.startsWith('$'));
    ramp[name] = Object.fromEntries(steps.map((s) => [s, { $type: 'color', $value: `{palette.${m[1]}.${s}}` }]));
  }
  return tokens;
}

/** 합쳐진 토큰 객체를 해석해 { cssVar: {value, path, type, description} } 평면 맵으로. */
async function flattenTokens(tokens) {
  const captured = {};
  const sd = new StyleDictionary({
    tokens: structuredClone(tokens),
    usesDtcg: true,
    log: { warnings: 'disabled', verbosity: 'silent', errors: { brokenReferences: 'throw' } },
    preprocessors: ['ax-ramp'],
    hooks: {
      preprocessors: { 'ax-ramp': (t) => expandRamps(t) },
      formats: {
        capture: ({ dictionary }) => {
          for (const t of dictionary.allTokens) {
            if (!CONTRACT_ROOTS.has(t.path[0])) continue; // 규칙 1
            const name = cssVarName(t.path);
            if (!name) throw new Error(`이름 규칙이 없는 토큰 경로: ${t.path.join('.')}`);
            captured[name] = { value: String(t.$value ?? t.value), path: t.path.join('.'), type: t.$type ?? t.type, description: t.$description ?? null };
          }
          return '';
        },
      },
    },
    platforms: {
      capture: {
        transforms: ['attribute/cti', 'name/kebab', 'color/css', 'fontFamily/css', 'cubicBezier/css', 'shadow/css/shorthand'],
        files: [{ destination: 'noop.txt', format: 'capture' }],
      },
    },
  });
  await sd.formatPlatform('capture');
  return captured;
}

/** JSON 객체에 '적힌' 토큰 경로. $ramp는 ramp.<이름> 하나로 친다. ramp 아래 직접 $value는 규칙 6 위반. */
function writtenPathsOf(json, label = '') {
  const out = [];
  const walk = (node, trail) => {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue;
      const here = [...trail, k];
      if (isObj(v) && '$ramp' in v) out.push(here.join('.'));
      else if (isObj(v) && '$value' in v) {
        if (here[0] === 'ramp') throw new Error(`${label}: ramp.${here.slice(1).join('.')} 에 단계 값을 직접 적었습니다. 램프는 $ramp 로 통째로만 바꿉니다. — 규칙 6`);
        out.push(here.join('.'));
      } else if (isObj(v)) walk(v, here);
    }
  };
  walk(json, []);
  return out;
}

/** 규칙 2: variant가 base에 없는 키를 만들면 실패. 값이 다른 키만 돌려준다. */
function diff(base, variant, label) {
  const out = {};
  for (const [k, v] of Object.entries(variant)) {
    if (!(k in base)) throw new Error(`${label}: 계약에 없는 키를 만들었습니다: ${k} (${v.path}) — 규칙 2`);
    if (base[k].value !== v.value) out[k] = v.value;
  }
  return out;
}

/**
 * 규칙 8 — 치수 사다리. 같은 사다리 안의 단계는 반드시 커져야 한다.
 * 테마 랩은 드롭다운에서 아무 scale 단계나 고를 수 있어서 md ≥ lg 같은 뒤집힘을 막을 게 없다.
 * font.size는 본문·제목 두 사다리로 나눈다 — bodyLg와 headingSm은 굵기로 갈리는 다른 역할이라
 * 같은 px여도 정상이다(기본 계약에서 둘 다 16). radius는 뺀다 — scale.radius가 16 다음 바로 full로
 * 끝나서 consumer가 surface=overlay=16인 게 실수가 아니다. 단계를 늘릴지는 사람이 정한다.
 */
const LADDERS = [
  ['size.control',  ['sm', 'md', 'lg']],
  ['size.icon',     ['sm', 'md', 'lg']],
  ['size.row',      ['sm', 'md', 'lg']],
  ['space.inset',   ['xs', 'sm', 'md', 'lg', 'xl']],
  ['space.stack',   ['xs', 'sm', 'md', 'lg', 'xl']],
  ['space.inline',  ['xs', 'sm', 'md', 'lg']],
  ['space.section', ['sm', 'md', 'lg']],
  ['font.size',     ['caption', 'body', 'bodyLg'],                          '본문'],
  ['font.size',     ['headingSm', 'headingMd', 'headingLg', 'display'],    '제목'],
];

/** 해석된 값 맵({cssVar: value})에서 사다리를 검사한다. 뒤집힌 곳을 문장으로 돌려준다. */
function ladderViolations(base, values, label) {
  const byPath = Object.fromEntries(Object.values(base).map((t) => [t.path, t]));
  const px = (v) => { const n = parseFloat(v); if (Number.isNaN(n)) throw new Error(`${label}: 치수 값을 숫자로 읽을 수 없습니다: ${v}`); return n; };
  const out = [];
  for (const [prefix, steps, sub] of LADDERS) {
    const name = sub ? `${prefix} ${sub}` : prefix;
    const rungs = steps.map((step) => {
      const t = byPath[`${prefix}.${step}`];
      if (!t) throw new Error(`규칙 8의 사다리 ${name} 에 ${prefix}.${step} 이 없습니다. 계약 키가 바뀌었으면 lib.mjs 의 LADDERS 도 고치세요.`);
      const cssVar = Object.keys(base).find((k) => base[k] === t);
      return { step, value: values[cssVar] };
    });
    for (let i = 1; i < rungs.length; i++) {
      const a = rungs[i - 1], b = rungs[i];
      if (!(px(a.value) < px(b.value))) out.push(`${name.padEnd(18)} ${a.step}(${a.value}) ≥ ${b.step}(${b.value})`);
    }
  }
  return out;
}

const namesIn = async (src, dir) =>
  (await readdir(path.join(src, dir))).map((f) => /^([a-z0-9.-]+)\.json$/.exec(f)?.[1]).filter(Boolean).sort(); // 점 허용: mono.dark.json

/** 층별 파일 목록. 파일이 곧 등록이다 — 브랜드·아키타입을 추가할 때 코드를 고치지 않는다. */
export async function listLayers(src) {
  const primitive = (await readdir(path.join(src, 'primitive'))).filter((f) => f.endsWith('.json')).sort().map((f) => `primitive/${f}`);
  const semantic = (await readdir(path.join(src, 'semantic'))).filter((f) => f.endsWith('.json')).sort().map((f) => `semantic/${f}`);
  const all = await namesIn(src, 'brand');
  return {
    primitive, semantic,
    archetypes: await namesIn(src, 'archetype'),
    brands: all.filter((n) => n !== 'default' && !n.endsWith('.dark')),
    brandDarks: new Set(all.filter((n) => n.endsWith('.dark')).map((n) => n.replace(/\.dark$/, ''))),
  };
}

/**
 * 한 조합만 해석한다. 테마 랩 미리보기용 — 전체 빌드(~8회 flatten)의 1/4 비용.
 * 규칙 검사는 하지 않는다(저장할 때 buildAll이 한다).
 */
export async function resolveOne(src, { overlay = {}, brand = 'default', archetype = 'base', mode = 'light' } = {}) {
  const L = await listLayers(src);
  const files = [...L.primitive, ...L.semantic, 'brand/default.json'];
  if (brand !== 'default') files.push(`brand/${brand}.json`);
  if (archetype !== 'base') files.push(`archetype/${archetype}.json`);
  if (mode === 'dark') {
    files.push('mode/dark.json');
    if (brand !== 'default' && L.brandDarks.has(brand)) files.push(`brand/${brand}.dark.json`);
  }
  const flat = await flattenTokens(await loadTokens(src, files, overlay));
  return Object.fromEntries(Object.entries(flat).map(([k, t]) => [k, t.value]));
}

/** 전체 빌드. 규칙 1~6·8을 전부 검사하고 CSS·계약을 돌려준다. 파일은 쓰지 않는다. */
export async function buildAll(src, { overlay = {} } = {}) {
  const L = await listLayers(src);
  const BASE_FILES = [...L.primitive, ...L.semantic, 'brand/default.json'];
  const load = (extra) => loadTokens(src, [...BASE_FILES, ...extra], overlay);
  const written = async (rel) => writtenPathsOf(deepMerge(await readJson(path.join(src, rel)), overlay[rel] ?? {}), path.basename(rel));

  const base = await flattenTokens(await load([]));
  const contractColorPaths = Object.values(base).filter((t) => t.path.startsWith('color.')).map((t) => t.path);

  const archetypes = {};
  for (const n of L.archetypes) archetypes[n] = diff(base, await flattenTokens(await load([`archetype/${n}.json`])), `archetype/${n}`);

  // 규칙 8: 치수 사다리 순서. 기본 계약 + 각 아키타입만 본다 — 브랜드는 규칙 3이 치수를 못 건드리게
  // 막고, 모드는 색만 바꾸므로 치수가 달라지는 축은 아키타입뿐이다.
  {
    const baseValues = Object.fromEntries(Object.entries(base).map(([k, t]) => [k, t.value]));
    const bad = [];
    for (const v of ladderViolations(base, baseValues, '기본 계약')) bad.push(`  기본 계약          ${v}`);
    for (const [n, delta] of Object.entries(archetypes))
      for (const v of ladderViolations(base, { ...baseValues, ...delta }, `archetype/${n}`)) bad.push(`  archetype/${n.padEnd(10)} ${v}`);
    if (bad.length) throw new Error(
      `치수 사다리가 뒤집힌 곳 ${bad.length}개:\n${bad.join('\n')}\n` +
      `같은 사다리 안의 단계는 반드시 커져야 합니다 — 같아도 안 됩니다. 컴포넌트가 size="lg" 를 골랐는데 md 와 같거나 작아지면 크기 prop 이 거짓말이 됩니다. — 규칙 8`);
  }

  const darkFull = await flattenTokens(await load(['mode/dark.json']));
  const dark = diff(base, darkFull, 'mode/dark');

  // 규칙 4: dark.json은 모든 색 키를 명시적으로 덮는다.
  {
    const covered = new Set(await written('mode/dark.json'));
    const missing = contractColorPaths.filter((p) => !covered.has(p));
    if (missing.length) throw new Error(
      `dark 모드가 덮지 않은 색 키 ${missing.length}개:\n  ${missing.join('\n  ')}\n` +
      `라이트 값이 그대로 다크 화면에 뜹니다. src/mode/dark.json 에 ramp 기준으로 값을 적으세요 — 같은 값이어도 적어야 합니다. — 규칙 4`);
  }

  const brands = {};
  for (const n of L.brands) {
    const light = diff(base, await flattenTokens(await load([`brand/${n}.json`])), `brand/${n}`);
    const semanticWrites = (await written(`brand/${n}.json`)).filter((p) => p.startsWith('color.'));
    const hasDark = L.brandDarks.has(n);
    // 규칙 5
    if (semanticWrites.length && !hasDark) throw new Error(
      `brand/${n}.json 이 시맨틱 색 키 ${semanticWrites.length}개를 덮었는데 brand/${n}.dark.json 이 없습니다.\n  ${semanticWrites.join('\n  ')}\n` +
      `전역 dark.json이 이 키들을 accent 기준으로 되돌려 버립니다. brand/${n}.dark.json 에 다크 값을 적으세요. — 규칙 5`);
    if (hasDark) {
      const darkWrites = new Set(await written(`brand/${n}.dark.json`));
      const missing = semanticWrites.filter((p) => !darkWrites.has(p));
      if (missing.length) throw new Error(
        `brand/${n}.dark.json 이 덮지 않은 키 ${missing.length}개 (brand/${n}.json 은 덮었음):\n  ${missing.join('\n  ')}\n` +
        `라이트에서 바꾼 매핑은 다크에서도 정해야 합니다. — 규칙 5`);
    }
    const trueDark = await flattenTokens(await load([`brand/${n}.json`, 'mode/dark.json', ...(hasDark ? [`brand/${n}.dark.json`] : [])]));
    const composite = {};
    for (const [k, t] of Object.entries(trueDark)) {
      if (!(k in base)) throw new Error(`brand/${n}.dark.json: 계약에 없는 키 ${k} — 규칙 2`);
      const predicted = dark[k] ?? light[k] ?? base[k].value;
      if (t.value !== predicted) composite[k] = t.value;
    }
    brands[n] = { light, dark: composite };
  }

  // 규칙 3: 브랜드 ∩ 아키타입 = ∅
  {
    const a = new Set(Object.values(archetypes).flatMap(Object.keys));
    const collision = [...new Set(Object.values(brands).flatMap((b) => [...Object.keys(b.light), ...Object.keys(b.dark)]))].filter((k) => a.has(k));
    if (collision.length) throw new Error(
      `브랜드와 아키타입이 같은 키를 건드립니다 — 축이 섞였습니다:\n  ${collision.join('\n  ')}\n브랜드는 색, 아키타입은 치수입니다. — 규칙 3`);
  }

  const defaultRamp = deepMerge(await readJson(path.join(src, 'brand/default.json')), overlay['brand/default.json'] ?? {}).ramp;
  const contract = {
    $schema: 'https://ax.design/contract/v1',
    version: 2,
    description: '2층 계약. 이 목록에 없는 CSS 변수/유틸리티는 사용 금지이며 린트가 막습니다.',
    axes: {
      archetype: { values: ['base', ...L.archetypes], owns: '치수(크기·간격·모서리·글자크기)', decidedAt: '제품 결정 시점' },
      brand: { values: ['default', ...L.brands], owns: '역할 램프(어느 재질이 neutral/accent인가) + 선택적으로 시맨틱 매핑', decidedAt: '제품 결정 시점' },
      mode: { values: ['light', 'dark'], owns: '색', decidedAt: '런타임' },
    },
    ramps: Object.fromEntries(Object.entries(defaultRamp).filter(([k]) => !k.startsWith('$')).map(([k, v]) => [k, { default: v.$ramp }])),
    tokens: Object.fromEntries(Object.entries(base).map(([k, t]) => [k, { path: t.path, type: t.type, default: t.value, description: t.description }])),
  };

  return { base, archetypes, brands, dark, contract, css: emitCss({ base, archetypes, brands, dark }) };
}

const block = (sel, map, indent = '  ') =>
  `${sel} {\n${Object.entries(map).map(([k, v]) => `${indent}${k}: ${v};`).join('\n')}\n}`;

const RESET = ['--color-*','--spacing','--spacing-*','--radius-*','--text-*','--font-*','--font-weight-*','--leading-*','--tracking-*','--shadow-*','--inset-shadow-*','--drop-shadow-*','--ease-*','--animate-*','--blur-*','--aspect-*','--container-*'];

function emitCss({ base, archetypes, brands, dark }) {
  const baseColors = Object.fromEntries(Object.entries(base).filter(([k]) => k.startsWith('--color-')).map(([k, t]) => [k, t.value]));
  return [
    `/* @ax/tokens — 자동 생성. 직접 수정하지 마세요. src/ 를 고치고 \`npm run build -w @ax/tokens\` 하세요. */`,
    `/* palette(1층)와 ramp(역할 램프)는 의도적으로 내보내지 않습니다. 컴포넌트는 2층 이름만 씁니다. */`,
    ``,
    `@theme {`,
    `  /* Tailwind 기본 테마를 비웁니다 — 계약에 없는 값은 유틸리티 자체가 존재하지 않게. */`,
    RESET.map((r) => `  ${r}: initial;`).join('\n'),
    ``,
    `  /* 2층 계약 — 기본값 (default 브랜드 · 라이트). 모든 테마가 이 키 집합을 공유합니다. */`,
    Object.entries(base).map(([k, t]) => `  ${k}: ${t.value};`).join('\n'),
    `}`,
    ``,
    `/* 명시적 라이트. OS가 다크여도 이 어트리뷰트가 있으면 라이트로 고정됩니다. 브랜드 블록보다 앞에 있어야 브랜드가 이깁니다. */`,
    block(`[data-mode="light"]`, baseColors),
    ``,
    `/* ── 아키타입(문법) — 치수만 ─────────────────────────────────── */`,
    ...Object.entries(archetypes).map(([n, m]) => `\n${block(`[data-archetype="${n}"]`, m)}`),
    ``,
    `/* ── 브랜드 — 색만. 램프 교체와 시맨틱 재매핑이 리터럴로 굳어 있습니다 ── */`,
    ...Object.entries(brands).map(([n, b]) => `\n${block(`[data-brand="${n}"]`, b.light)}`),
    ``,
    `/* ── 다크 (기본 브랜드 기준) ──────────────────────────────────── */`,
    block(`[data-mode="dark"]`, dark),
    `@media (prefers-color-scheme: dark) {\n${block(`  :root:not([data-mode="light"])`, dark, '    ')}\n}`,
    ``,
    `/* ── 브랜드 × 다크 보정 — 램프가 다르거나 시맨틱을 덮은 브랜드의 다크 값 ── */`,
    ...Object.entries(brands).filter(([, b]) => Object.keys(b.dark).length).flatMap(([n, b]) => [
      ``,
      block(`[data-brand="${n}"][data-mode="dark"]`, b.dark),
      `@media (prefers-color-scheme: dark) {\n${block(`  [data-brand="${n}"]:not([data-mode="light"])`, b.dark, '    ')}\n}`,
    ]),
    ``,
  ].join('\n');
}
