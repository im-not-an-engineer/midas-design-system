/**
 * shadcn 호환 레지스트리 생성기.
 *
 * 배포 방식만 shadcn을 차용한다 — 제품은 `npx shadcn add <url>` 로 **소스를 자기 레포에 복사해**
 * 소유하고, 우리는 토큰 계약과 스타일 층만 중앙에서 관리한다.
 *
 * 우리 저장소에는 계약 하나 + 아키타입 파일 몇 개지만, 바깥에는 제품군별 프리셋으로 보인다.
 * (원래 설계의 "프로필은 공개 인터페이스, 축은 내부 조립 방식")
 *
 * 프리셋은 아키타입을 **굳혀서** 내보낸다 — 제품은 [data-archetype] 다축 전환이 필요 없고
 * :root + 다크만 받는다. 다축 전환은 우리 테마 랩에만 남는다.
 */
import { resolveOne, listLayers } from '../packages/tokens/lib.mjs';
import { readFile, readdir, writeFile, rm, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOKENS_SRC = path.join(root, 'packages/tokens/src');
const REACT_SRC = path.join(root, 'packages/react/src');
const OUT = path.join(root, 'registry');
/** 배포 주소. 레지스트리 항목이 서로를 가리킬 때 쓴다. */
const BASE = process.env.REGISTRY_URL ?? 'https://im-not-an-engineer.github.io/midas-design-system';

/**
 * 바깥에 보이는 이름 ↔ 내부 축. packages/tokens/presets.json 이 유일한 출처다 —
 * 스토리북 툴바도 같은 파일을 읽으므로 둘이 어긋날 수 없다.
 * product:false 인 것은 축 검증용이라 배포하지 않는다.
 */
const ALL_PRESETS = JSON.parse(await readFile(path.join(root, 'packages/tokens/presets.json'), 'utf8')).presets;
const PRESETS = Object.fromEntries(Object.entries(ALL_PRESETS).filter(([, v]) => v.product));

/**
 * packages/react/package.json 이 선언한 것만 레지스트리에 실어 보낼 수 있다.
 * 여기 없는 패키지를 import 했다면 우리 저장소에서만 우연히 도는 것이다 —
 * 스토리북 앱이나 루트가 대신 깔아준 경우다. 바깥 제품에는 없다.
 */
const REACT_PKG = JSON.parse(await readFile(path.join(root, 'packages/react/package.json'), 'utf8'));
const DECLARED = new Set([...Object.keys(REACT_PKG.dependencies ?? {}), ...Object.keys(REACT_PKG.peerDependencies ?? {})]);

/** 소비 저장소에서의 위치. shadcn 규약(@/components/ui, @/lib)을 따른다. */
const TARGET = {
  component: (name) => `components/ui/${name}.tsx`,
  lib: (file) => `lib/ax/${file}`,
};

/** 우리 저장소의 import 경로 → 복사된 뒤의 경로. */
function rewriteImports(code) {
  return code
    .replace(/from '\.\.\/lib\/([a-z]+)'/g, "from '@/lib/ax/$1'")
    .replace(/from '\.\/([a-z-]+)'/g, "from '@/components/ui/$1'")
    .replace(/from '@ax\/tokens'/g, "from './contract'");
}

/**
 * 파일이 설치를 요구하는 npm 패키지.
 *
 * 예전에는 `@base-ui/react` 하나만 찾았다. 그래서 다른 라이브러리를 쓰는 컴포넌트를
 * 만들면 레지스트리 JSON 의 dependencies 가 비어 나가고, 바깥 제품은 `npx shadcn add`
 * 로 **설치되지 않은 패키지를 import 하는 파일**을 받았다. 우리 빌드는 통과하고
 * 제품이 실행할 때 터진다 — 그래서 눈에 띄지 않는다.
 *
 * 상대 경로가 아닌 것만 골라 패키지 이름까지 자른다(@base-ui/react/menu → @base-ui/react).
 * 주석은 먼저 지운다 — 설명 안에 적어둔 예시 import 가 의존성으로 새지 않게.
 */
const BUNDLED = new Set([
  'react', 'react-dom', // 제품이 이미 갖고 있다 (peerDependencies)
  '@ax/tokens',         // rewriteImports 가 './contract' 로 바꾼다 — 함께 복사되는 파일이다
]);

function npmDeps(code) {
  const src = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const out = new Set();
  for (const [, spec] of src.matchAll(/\bfrom\s*'([^']+)'/g)) {
    if (/^[./]/.test(spec) || spec.startsWith('@/')) continue; // 상대 경로 · 별칭
    const seg = spec.split('/');
    const pkg = spec.startsWith('@') ? seg.slice(0, 2).join('/') : seg[0];
    if (!BUNDLED.has(pkg)) out.add(pkg);
  }
  return [...out].sort();
}

/**
 * 이름만 내보내면 제품은 **설치하는 그 시점의 최신판**을 받는다. 우리가 보고 만든
 * 판이 아니다. 라이브러리가 큰자리를 올리면(1.x → 2.0) 사용법이 바뀌므로,
 * 우리가 복사해준 파일이 그 제품에서만 조용히 깨진다.
 *
 * 그래서 `^` 로 천장을 씌운다 — "1.8.0 이상, 단 2.0 은 우리가 확인 안 했으니 말고".
 * 금지가 아니라 결정권을 우리 쪽으로 가져오는 것이다. base-ui 2.0 이 나오면
 * 우리 저장소에서 올려보고 고친 뒤 package.json 을 갱신하면, 여기도 따라 올라간다.
 *
 * 범위는 packages/react/package.json 에서 읽는다 — 버전을 두 군데 적으면 갈라진다.
 */
function withRange(pkg) {
  const v = REACT_PKG.dependencies?.[pkg] ?? REACT_PKG.peerDependencies?.[pkg];
  if (!v) return pkg;                                  // assertDeclared 가 먼저 막는다
  return /^\d/.test(v) ? `${pkg}@^${v}` : `${pkg}@${v}`; // 이미 범위면 그대로 넘긴다
}

function assertDeclared(where, deps) {
  const undeclared = deps.filter((d) => !DECLARED.has(d));
  if (undeclared.length) throw new Error(
    `${where} 가 packages/react/package.json 에 없는 패키지를 import 합니다:\n  ${undeclared.join('\n  ')}\n` +
    `그 패키지를 packages/react 의 dependencies 에 먼저 추가하세요. 이대로 내보내면 ` +
    `바깥 제품이 받는 파일의 import 가 어디에도 닿지 않습니다.`);
}

// ── 아주 작은 CSS 파서 ──────────────────────────────────────────────────────
// styles.css 를 유일한 출처로 삼기 위한 것. 손으로 옮겨 적으면 반드시 어긋난다.
// 우리가 쓰는 문법(at-rule, 중첩 블록, 선언)만 다룬다.
function parseCss(src) {
  let i = 0;
  const skipWs = () => { while (i < src.length && /\s/.test(src[i])) i++; };
  const readBlock = () => {
    const out = {};
    for (;;) {
      skipWs();
      if (i >= src.length || src[i] === '}') { i++; return out; }
      let start = i;
      while (i < src.length && src[i] !== '{' && src[i] !== ';' && src[i] !== '}') i++;
      const head = src.slice(start, i).trim();
      if (src[i] === '{') { i++; out[head] = readBlock(); }
      else {
        i++; // ; 소비
        const c = head.indexOf(':');
        if (c > 0) out[head.slice(0, c).trim()] = head.slice(c + 1).trim();
        else if (head) out[head] = {}; // 본문 없는 at-rule
      }
    }
  };
  const out = {};
  while (i < src.length) {
    skipWs();
    if (i >= src.length) break;
    const start = i;
    while (i < src.length && src[i] !== '{' && src[i] !== ';') i++;
    const head = src.slice(start, i).trim();
    if (src[i] === '{') { i++; if (head) out[head] = readBlock(); }
    else { i++; if (head) out[head] = {}; }
  }
  return out;
}

/** styles.css 에서 @import·@source 를 뺀 나머지 = 프리셋이 실어 보낼 CSS. */
async function baseCss() {
  const raw = (await readFile(path.join(REACT_SRC, 'styles.css'), 'utf8'))
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*@(import|source)[^;]*;\s*$/gm, '');
  return parseCss(raw);
}

const isColor = (k) => k.startsWith('--color-');

/** Tailwind 기본 테마를 비우는 초기화. 계약에 없는 값은 유틸리티 자체가 없어야 한다. */
const RESET = ['--color-*','--spacing','--spacing-*','--radius-*','--text-*','--font-*','--font-weight-*',
  '--leading-*','--tracking-*','--shadow-*','--inset-shadow-*','--drop-shadow-*','--ease-*','--animate-*',
  '--blur-*','--aspect-*','--container-*'];

async function main() {
  const layers = await listLayers(TOKENS_SRC);

  // 프리셋이 없는 축을 가리키면 여기서 막는다. 그냥 두면 ENOENT 만 뜨고
  // 무엇을 만들어야 하는지 알 수 없다.
  for (const [name, cfg] of Object.entries(ALL_PRESETS)) {
    const missing = [];
    if (cfg.archetype !== 'base' && !layers.archetypes.includes(cfg.archetype))
      missing.push(`packages/tokens/src/archetype/${cfg.archetype}.json  (치수 delta — 기존 파일을 복사해 시작하세요)`);
    if (cfg.brand !== 'default' && !layers.brands.includes(cfg.brand))
      missing.push(`packages/tokens/src/brand/${cfg.brand}.json  (램프 배정)`);
    if (missing.length) throw new Error(
      `프리셋 "${name}" 이 없는 파일을 가리킵니다:\n  ${missing.join('\n  ')}\n` +
      `presets.json 에 프리셋을 추가할 때는 그 축 파일도 함께 만들어야 합니다.`);
  }
  const base = await baseCss();
  await rm(OUT, { recursive: true, force: true });
  await mkdir(path.join(OUT, 'r'), { recursive: true });

  // ── lib 파일 (프리셋이 함께 설치한다) ──
  const libSources = [];
  const libDeps = new Set();
  for (const f of (await readdir(path.join(REACT_SRC, 'lib'))).sort()) {
    const content = await readFile(path.join(REACT_SRC, 'lib', f), 'utf8');
    for (const d of npmDeps(content)) libDeps.add(d);
    libSources.push({
      path: `lib/ax/${f}`,
      content: rewriteImports(content),
      type: 'registry:lib',
      target: TARGET.lib(f),
    });
  }
  assertDeclared('packages/react/src/lib', [...libDeps]);

  /**
   * lib/ax/contract.ts — 우리 저장소에서 cn.ts·theme.tsx 가 읽던 @ax/tokens 를 대신한다.
   * 제품이 npm 패키지를 따로 설치하지 않아도 되도록 토큰 이름 목록을 복사본 안에 넣는다.
   * (tailwind-merge 가 우리 테마를 알아야 text-body 같은 클래스를 지우지 않는다)
   */
  const contractFile = (presetName, tokens) => ({
    path: 'lib/ax/contract.ts',
    type: 'registry:lib',
    target: TARGET.lib('contract.ts'),
    content:
      `// 자동 생성 — 디자인시스템 레지스트리에서 함께 복사됩니다. 직접 수정하지 마세요.\n` +
      `// 이 프리셋(${presetName})은 밀도·브랜드가 :root 에 굳어 있어 축을 바꿀 일이 없습니다.\n` +
      `// 남는 축은 라이트/다크뿐이고, AxTheme 의 mode 로 바꿉니다.\n\n` +
      `export const cssVars = ${JSON.stringify(Object.keys(tokens), null, 2)} as const;\n\n` +
      `export type Archetype = '${presetName}';\n` +
      `export type Brand = 'default';\n` +
      `export type Mode = 'light' | 'dark';\n`,
  });

  // ── 컴포넌트 ──
  const components = [];
  for (const f of (await readdir(path.join(REACT_SRC, 'components'))).sort()) {
    if (!f.endsWith('.tsx') || f.includes('.stories.')) continue;
    const name = f.replace(/\.tsx$/, '');
    const code = await readFile(path.join(REACT_SRC, 'components', f), 'utf8');
    const npm = npmDeps(code);
    assertDeclared(`components/${f}`, npm);
    const local = [...new Set([...code.matchAll(/from '\.\/([a-z-]+)'/g)].map((m) => m[1]))];
    components.push({ name, code, npm, local });
  }

  const itemUrl = (n) => `${BASE}/r/${n}.json`;

  // ── 프리셋 ──
  const presetNames = [];
  for (const [name, cfg] of Object.entries(PRESETS)) {
    const light = await resolveOne(TOKENS_SRC, { brand: cfg.brand, archetype: cfg.archetype, mode: 'light' });
    const dark = await resolveOne(TOKENS_SRC, { brand: cfg.brand, archetype: cfg.archetype, mode: 'dark' });
    const darkDelta = Object.fromEntries(Object.entries(dark).filter(([k, v]) => isColor(k) && light[k] !== v));

    // @theme 는 css 필드로 못 넣는다 — shadcn 이 그 안의 property:value 를 해석하지 못한다
    // (update-css: Unknown word ...). 토큰은 cssVars.theme 으로 보내고, 나머지 at-rule·선택자만 css 로.
    // cssVars 의 키는 `--` 없이 쓴다.
    const themeVars = Object.fromEntries(
      [...RESET.map((r) => [r, 'initial']), ...Object.entries(light)].map(([k, v]) => [k.replace(/^--/, ''), v]),
    );
    const css = {
      ...base,
      '[data-mode="dark"]': darkDelta,
      '@media (prefers-color-scheme: dark)': { ':root:not([data-mode="light"])': darkDelta },
    };

    await writeFile(path.join(OUT, 'r', `${name}.json`), JSON.stringify({
      $schema: 'https://ui.shadcn.com/schema/registry-item.json',
      name,
      type: 'registry:style',
      extends: 'none', // shadcn 기본 스타일을 물려받지 않는다 — 토큰은 우리 것이다
      title: cfg.title,
      description: cfg.description,
      // lib 파일이 실제로 요구하는 것 + @base-ui/react. 뒤엣것은 lib 이 직접 import 하지는
      // 않지만, 컴포넌트를 하나라도 붙이면 반드시 필요해서 프리셋에 같이 실어 보낸다.
      dependencies: [...new Set([...libDeps, '@base-ui/react'])].sort().map(withRange),
      files: [...libSources, contractFile(name, light)],
      cssVars: { theme: themeVars },
      css,
    }, null, 2) + '\n');
    presetNames.push(name);
  }

  // ── 컴포넌트 항목 ──
  for (const c of components) {
    await writeFile(path.join(OUT, 'r', `${c.name}.json`), JSON.stringify({
      $schema: 'https://ui.shadcn.com/schema/registry-item.json',
      name: c.name,
      type: 'registry:ui',
      dependencies: c.npm.map(withRange),
      registryDependencies: c.local.map(itemUrl),
      files: [{ path: `components/ui/${c.name}.tsx`, content: rewriteImports(c.code), type: 'registry:ui', target: TARGET.component(c.name) }],
    }, null, 2) + '\n');
  }

  // ── 목록 ──
  await writeFile(path.join(OUT, 'r', 'index.json'), JSON.stringify({
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: 'ax-design-system',
    homepage: BASE,
    items: [
      ...presetNames.map((n) => ({ name: n, type: 'registry:style', title: PRESETS[n].title, description: PRESETS[n].description })),
      ...components.map((c) => ({ name: c.name, type: 'registry:ui' })),
    ],
  }, null, 2) + '\n');

  console.log(`✓ 프리셋 ${presetNames.length}개 (${presetNames.join(', ')}) · 컴포넌트 ${components.length}개 · lib ${libSources.length + 1}개`);
  console.log(`  → registry/r/  ·  ${BASE}/r/<이름>.json`);
}

main().catch((e) => { console.error('\n✗ 레지스트리 생성 실패\n' + e.message + '\n'); process.exit(1); });
