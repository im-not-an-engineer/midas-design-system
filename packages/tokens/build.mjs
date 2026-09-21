/**
 * 토큰 빌드.
 *
 * 구조:  palette(1층, 재질) ← ramp(역할 램프, 브랜드가 정함) ← semantic(2층, 계약) ← 컴포넌트
 *
 * 브랜드가 정하는 것 두 가지:
 *   (a) 어느 재질이 어느 역할인가        ramp.neutral = {palette.stone}   → 그레이 80여 개가 한 번에 웜톤
 *   (b) 시맨틱 매핑 자체 (선택)          action.primary.bg = {ramp.neutral.900} → 무채색 primary
 * (b)를 했으면 brand/<이름>.dark.json 으로 다크 값도 책임진다.
 *
 * 모든 값은 빌드 시점에 (브랜드 × 모드) 조합별로 해석해 리터럴로 내보낸다. 런타임 var() 체인은
 * 쓰지 않는다 — 커스텀 프로퍼티 안의 var()는 '선언된 요소'에서 치환되므로, 자식 요소가 램프를
 * 바꿔도 부모에서 이미 굳은 값이 내려온다. 조합은 브랜드×2 뿐이라 비용이 없다.
 *
 * 빌드가 강제하는 규칙:
 *   1. 1층(palette)과 ramp는 CSS로 내보내지 않는다. 컴포넌트가 원재료를 직접 집을 수 없다.
 *   2. delta는 2층 계약에 이미 있는 키만 덮을 수 있다.
 *   3. 브랜드와 아키타입은 같은 키를 건드릴 수 없다 (브랜드=색, 아키타입=치수).
 *   4. dark.json은 2층의 모든 색 키를 명시적으로 덮어야 한다. ramp 기준으로 적으므로 브랜드와 무관하다.
 *   5. 브랜드가 시맨틱 색 키를 덮었으면 brand/<이름>.dark.json이 그 키들을 전부 덮어야 한다.
 *   6. 램프는 $ramp 축약으로 통째로만 바꾼다. 단계 일부만 바꾸면 실패.
 */
import StyleDictionary from 'style-dictionary';
import { mkdir, writeFile, rm, readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');

/** 2층 계약의 최상위 이름. 여기 없는 최상위(palette, ramp)는 CSS로 나가지 않는다. — 규칙 1 */
const CONTRACT_ROOTS = new Set(['color', 'size', 'space', 'radius', 'border', 'focusRing', 'elevation', 'motion', 'opacity', 'z', 'font']);

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
  [['elevation'],             (p) => `shadow-${p.slice(1).join('-')}`],
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
function cssVarName(tokenPath) {
  for (const [prefix, fn] of NAME_MAP) if (prefix.every((seg, i) => tokenPath[i] === seg)) return `--${kebab(fn(tokenPath))}`;
  return null;
}

/**
 * $ramp 축약 펼치기 — 규칙 6.
 *   "neutral": { "$ramp": "{palette.stone}" }  →  neutral.0 = {palette.stone.0}, neutral.50 = … (palette가 가진 모든 단계)
 * 램프를 통째로만 바꿀 수 있게 하는 장치다. 단계 하나만 바꾸면 그레이 계단이 어긋난다.
 */
function expandRamps(tokens) {
  const ramp = tokens.ramp;
  if (!ramp) throw new Error('brand/default.json 에 ramp 정의가 없습니다.');
  for (const [name, group] of Object.entries(ramp)) {
    if (name.startsWith('$')) continue;
    const short = group.$ramp;
    if (!short) {
      throw new Error(`ramp.${name} 은 $ramp 축약으로만 정의할 수 있습니다 (단계 일부만 바꾸는 것은 금지). — 규칙 6`);
    }
    const m = /^\{palette\.([a-zA-Z0-9]+)\}$/.exec(short);
    if (!m) throw new Error(`ramp.${name}.$ramp 값은 "{palette.<재질>}" 형식이어야 합니다: ${short}`);
    const material = tokens.palette?.[m[1]];
    if (!material) throw new Error(`ramp.${name} 이 가리키는 palette.${m[1]} 이 없습니다.`);
    const steps = Object.keys(material).filter((k) => !k.startsWith('$'));
    ramp[name] = Object.fromEntries(steps.map((s) => [s, { $type: 'color', $value: `{palette.${m[1]}.${s}}` }]));
  }
  return tokens;
}

/** 한 조합(소스 파일 묶음)을 빌드해 { cssVar: {value, path, type, description} } 평면 맵으로 돌려준다. */
async function flatten(sources) {
  const captured = {};
  const sd = new StyleDictionary({
    source: sources,
    log: { warnings: 'disabled', verbosity: 'silent', errors: { brokenReferences: 'throw' } },
    preprocessors: ['ax-ramp'],
    hooks: {
      preprocessors: { 'ax-ramp': (tokens) => expandRamps(tokens) },
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
        buildPath: path.join(dist, '.tmp') + '/',
        files: [{ destination: 'noop.txt', format: 'capture' }],
      },
    },
  });
  await sd.buildAllPlatforms();
  return captured;
}

/** delta 파일에 '적힌' 토큰 경로. $ramp 축약은 ramp.<이름> 하나로 친다. ramp 아래 직접 $value는 규칙 6 위반. */
async function writtenPaths(file) {
  const json = JSON.parse(await readFile(file, 'utf8'));
  const out = [];
  const walk = (node, trail) => {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue;
      const here = [...trail, k];
      if (v && typeof v === 'object' && '$ramp' in v) out.push(here.join('.'));
      else if (v && typeof v === 'object' && '$value' in v) {
        if (here[0] === 'ramp') throw new Error(`${path.basename(file)}: ramp.${here.slice(1).join('.')} 에 단계 값을 직접 적었습니다. 램프는 $ramp 로 통째로만 바꿉니다. — 규칙 6`);
        out.push(here.join('.'));
      } else if (v && typeof v === 'object') walk(v, here);
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

const exists = async (p) => !!(await readFile(p).catch(() => null));
const namesIn = async (dir, pattern = /^([a-z0-9-]+)\.json$/) =>
  (await readdir(path.join(src, dir))).map((f) => pattern.exec(f)?.[1]).filter(Boolean).sort();

const block = (sel, map, indent = '  ') =>
  `${sel} {\n${Object.entries(map).map(([k, v]) => `${indent}${k}: ${v};`).join('\n')}\n}`;
const pick = (map, pred) => Object.fromEntries(Object.entries(map).filter(([k, v]) => pred(k, v)));
const isColor = (k) => k.startsWith('--color-');

async function main() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });

  const PRIMITIVE = [path.join(src, 'primitive/*.json')];
  const SEMANTIC = [path.join(src, 'semantic/*.json')];
  const DEFAULT_BRAND = path.join(src, 'brand/default.json');
  const brandFile = (n) => path.join(src, `brand/${n}.json`);
  const brandDarkFile = (n) => path.join(src, `brand/${n}.dark.json`);
  const modeFile = (n) => path.join(src, `mode/${n}.json`);

  // 파일이 곧 등록이다 — 브랜드/아키타입/모드를 추가할 때 이 스크립트를 고치지 않는다.
  const archetypeNames = await namesIn('archetype');
  const brandNames = (await namesIn('brand')).filter((n) => n !== 'default' && !n.endsWith('.dark'));
  const modeNames = await namesIn('mode'); // 현재 ['dark']. light는 파일이 아니라 기본값이다.
  if (modeNames.length !== 1 || modeNames[0] !== 'dark') throw new Error('현재 빌드는 모드로 dark 하나만 지원합니다.');

  // ── 기준: 기본 브랜드 · 라이트 · 아키타입 없음 ──
  const base = await flatten([...PRIMITIVE, ...SEMANTIC, DEFAULT_BRAND]);
  const contractColorPaths = Object.values(base).filter((t) => t.path.startsWith('color.')).map((t) => t.path);

  // ── 아키타입: 치수만 ──
  const archetypes = {};
  for (const n of archetypeNames)
    archetypes[n] = diff(base, await flatten([...PRIMITIVE, ...SEMANTIC, DEFAULT_BRAND, path.join(src, `archetype/${n}.json`)]), `archetype/${n}`);

  // ── 다크(기본 브랜드 기준) ──
  const darkFull = await flatten([...PRIMITIVE, ...SEMANTIC, DEFAULT_BRAND, modeFile('dark')]);
  const dark = diff(base, darkFull, 'mode/dark');

  // 규칙 4: dark.json은 모든 색 키를 명시적으로 덮는다.
  {
    const covered = new Set(await writtenPaths(modeFile('dark')));
    const missing = contractColorPaths.filter((p) => !covered.has(p));
    if (missing.length) throw new Error(
      `dark 모드가 덮지 않은 색 키 ${missing.length}개:\n  ${missing.join('\n  ')}\n` +
      `라이트 값이 그대로 다크 화면에 뜹니다. src/mode/dark.json 에 ramp 기준으로 값을 적으세요 — 같은 값이어도 적어야 합니다. — 규칙 4`);
  }

  // ── 브랜드: 라이트 delta + (브랜드 × 다크) 보정 ──
  const brands = {};       // name → { light: diff, dark: composite diff }
  for (const n of brandNames) {
    const lightFull = await flatten([...PRIMITIVE, ...SEMANTIC, DEFAULT_BRAND, brandFile(n)]);
    const light = diff(base, lightFull, `brand/${n}`);

    // 규칙 5: 시맨틱을 덮은 브랜드는 다크 값도 책임진다.
    const semanticWrites = (await writtenPaths(brandFile(n))).filter((p) => p.startsWith('color.'));
    const hasDark = await exists(brandDarkFile(n));
    if (semanticWrites.length && !hasDark) throw new Error(
      `brand/${n}.json 이 시맨틱 색 키 ${semanticWrites.length}개를 덮었는데 brand/${n}.dark.json 이 없습니다.\n  ${semanticWrites.join('\n  ')}\n` +
      `전역 dark.json이 이 키들을 accent 기준으로 되돌려 버립니다. brand/${n}.dark.json 에 다크 값을 적으세요. — 규칙 5`);
    if (hasDark) {
      const darkWrites = new Set(await writtenPaths(brandDarkFile(n)));
      const missing = semanticWrites.filter((p) => !darkWrites.has(p));
      if (missing.length) throw new Error(
        `brand/${n}.dark.json 이 덮지 않은 키 ${missing.length}개 (brand/${n}.json 은 덮었음):\n  ${missing.join('\n  ')}\n` +
        `라이트에서 바꾼 매핑은 다크에서도 정해야 합니다. — 규칙 5`);
    }

    // (브랜드 × 다크) 진짜 값 vs 캐스케이드가 만들어낼 값. 차이만 복합 셀렉터 블록으로 낸다.
    const trueDark = await flatten([...PRIMITIVE, ...SEMANTIC, DEFAULT_BRAND, brandFile(n), modeFile('dark'), ...(hasDark ? [brandDarkFile(n)] : [])]);
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

  await rm(path.join(dist, '.tmp'), { recursive: true, force: true });

  // ── tokens.css ──
  const RESET = ['--color-*','--spacing','--spacing-*','--radius-*','--text-*','--font-*','--font-weight-*','--leading-*','--tracking-*','--shadow-*','--inset-shadow-*','--drop-shadow-*','--ease-*','--animate-*','--blur-*','--aspect-*','--container-*'];
  const baseColors = Object.fromEntries(Object.entries(pick(base, isColor)).map(([k, t]) => [k, t.value]));

  const css = [
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
  await writeFile(path.join(dist, 'tokens.css'), css);

  // ── contract.json ──
  const defaultRamp = JSON.parse(await readFile(DEFAULT_BRAND, 'utf8')).ramp;
  const contract = {
    $schema: 'https://ax.design/contract/v1',
    version: 2,
    description: '2층 계약. 이 목록에 없는 CSS 변수/유틸리티는 사용 금지이며 린트가 막습니다.',
    axes: {
      archetype: { values: ['base', ...archetypeNames], owns: '치수(크기·간격·모서리·글자크기)', decidedAt: '제품 결정 시점' },
      brand:     { values: ['default', ...brandNames], owns: '역할 램프(어느 재질이 neutral/accent인가) + 선택적으로 시맨틱 매핑', decidedAt: '제품 결정 시점' },
      mode:      { values: ['light', 'dark'], owns: '색', decidedAt: '런타임' },
    },
    ramps: Object.fromEntries(Object.entries(defaultRamp).filter(([k]) => !k.startsWith('$')).map(([k, v]) => [k, { default: v.$ramp }])),
    tokens: Object.fromEntries(Object.entries(base).map(([k, t]) => [k, { path: t.path, type: t.type, default: t.value, description: t.description }])),
  };
  await writeFile(path.join(dist, 'contract.json'), JSON.stringify(contract, null, 2));

  // ── JS / TS ──
  await writeFile(path.join(dist, 'index.js'),
    `// 자동 생성. 직접 수정하지 마세요.\nconst contract = ${JSON.stringify(contract)};\n` +
    `export const tokens = contract.tokens;\nexport const axes = contract.axes;\nexport const ramps = contract.ramps;\n` +
    `export const cssVars = Object.keys(contract.tokens);\nexport default contract;\n`);
  const lit = (arr) => arr.map((v) => JSON.stringify(v)).join(' | ');
  await writeFile(path.join(dist, 'index.d.ts'),
    `export type TokenName = ${lit(Object.keys(base))};\n\n` +
    `export type Archetype = ${lit(contract.axes.archetype.values)};\nexport type Brand = ${lit(contract.axes.brand.values)};\nexport type Mode = ${lit(contract.axes.mode.values)};\n` +
    `export type Ramp = ${lit(Object.keys(contract.ramps))};\n\n` +
    `export interface TokenMeta { path: string; type?: string; default: string; description: string | null }\n` +
    `export declare const tokens: Record<TokenName, TokenMeta>;\nexport declare const cssVars: TokenName[];\n` +
    `export declare const ramps: Record<Ramp, { default: string }>;\n` +
    `export declare const axes: { archetype: { values: Archetype[] }; brand: { values: Brand[] }; mode: { values: Mode[] } };\n`);

  const n = (m) => String(Object.keys(m).length).padStart(3);
  console.log(`✓ 계약 토큰 ${Object.keys(base).length}개 · 램프 ${Object.keys(contract.ramps).length}개 (${Object.keys(contract.ramps).join(', ')})`);
  for (const [k, m] of Object.entries(archetypes)) console.log(`  아키타입 ${k.padEnd(10)} → ${n(m)}개 덮어씀`);
  for (const [k, b] of Object.entries(brands))     console.log(`  브랜드   ${k.padEnd(10)} → 라이트 ${n(b.light)}개, 다크 보정 ${n(b.dark)}개`);
  console.log(`  모드     dark       → ${n(dark)}개 덮어씀`);
  console.log(`✓ 규칙 1~6 통과 (1층 비노출 · 계약 키만 · 브랜드∩아키타입=∅ · 다크 완전 · 브랜드 다크 책임 · 램프 통째)`);
}

main().catch((e) => { console.error('\n✗ 빌드 실패\n' + e.message + '\n'); process.exit(1); });
