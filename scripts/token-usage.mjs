/**
 * 어느 계약 토큰이 어느 컴포넌트에 쓰이는가.
 *
 * 왜 필요한가: 테마 랩에서 값 하나를 바꾸면 그게 어디까지 번지는지 화면에 안 나온다.
 * space.stack.xs 를 2px에서 4px로 올리면 Field·Radio·Switch·Toast·Dialog 가 전부
 * 같이 움직이는데, 그걸 모르면 "이 자리만 넓히려던 것"이 화면 전체를 흔든다.
 *
 * 어떻게 아는가: Tailwind 에게 클래스를 주면 그 클래스가 쓰는 CSS 변수를 돌려준다.
 * (h-control-md → --spacing-control-md) 추출기는 계약 린트 것을 그대로 쓴다 —
 * 따로 만들면 린트가 보는 것과 여기가 보는 것이 조용히 갈라진다.
 *
 * 한계: 보간으로 만든 클래스는 잡지 못한다(규칙 1-1이 금지하고 있어 실제로는 없다).
 */
import { extractCandidates, loadDesign, root } from './check-contract.mjs';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const COMPONENTS = path.join(root, 'packages/react/src/components');
const STYLES = path.join(root, 'packages/react/src/lib/styles.ts');

/** styles.ts 를 `export const NAME = …` 단위로 자른다. 이름 → 그 정의의 소스 조각. */
function splitConstants(src) {
  const hits = [...src.matchAll(/export const ([A-Z][A-Z0-9_]*)\s*[:=]/g)];
  return Object.fromEntries(hits.map((m, i) =>
    [m[1], src.slice(m.index, i + 1 < hits.length ? hits[i + 1].index : src.length)]));
}

export async function buildUsageIndex() {
  const design = await loadDesign();
  const contract = new Set(Object.keys(JSON.parse(
    await readFile(path.join(root, 'packages/tokens/dist/contract.json'), 'utf8')).tokens));
  const constants = splitConstants(await readFile(STYLES, 'utf8'));

  const varsOf = (source) => {
    const found = extractCandidates(source);
    const out = new Set();
    if (!found.length) return out;
    for (const css of design.candidatesToCss(found.map((f) => f.candidate))) {
      if (!css) continue;
      for (const m of css.matchAll(/var\((--[a-z0-9-]+)/g)) if (contract.has(m[1])) out.add(m[1]);
    }
    return out;
  };

  const usage = {};
  const byComponent = {};

  for (const f of (await readdir(COMPONENTS)).sort()) {
    if (!f.endsWith('.tsx') || f.includes('.stories.')) continue;
    const name = f.replace(/\.tsx$/, '');
    let source = await readFile(path.join(COMPONENTS, f), 'utf8');

    // 그 컴포넌트가 가져다 쓰는 lib/styles 상수도 함께 본다. 빼먹으면 FIELD_CONTROL
    // 안에만 있는 field 토큰들이 "아무 데도 안 쓰임"으로 보인다.
    const imported = /import\s*\{([^}]*)\}\s*from\s*'\.\.\/lib\/styles'/.exec(source);
    if (imported) {
      for (const raw of imported[1].split(',')) {
        const n = raw.trim().split(/\s+as\s+/)[0].trim();
        if (constants[n]) source += `\n${constants[n]}`;
      }
    }

    const vars = varsOf(source);
    byComponent[name] = [...vars].sort();
    for (const v of vars) (usage[v] ??= new Set()).add(name);
  }

  return {
    usage: Object.fromEntries(Object.entries(usage).map(([k, v]) => [k, [...v].sort()])),
    byComponent,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { usage, byComponent } = await buildUsageIndex();
  const contract = Object.keys(JSON.parse(
    await readFile(path.join(root, 'packages/tokens/dist/contract.json'), 'utf8')).tokens);
  const unused = contract.filter((t) => !usage[t]);
  const arg = process.argv[2];
  if (arg) {
    const hit = usage[arg.startsWith('--') ? arg : `--${arg}`];
    console.log(hit ? `${arg}\n  ${hit.join(', ')}` : `${arg} — 쓰는 컴포넌트 없음`);
  } else {
    console.log(`✓ 컴포넌트 ${Object.keys(byComponent).length}개 · 쓰이는 계약 토큰 ${Object.keys(usage).length}/${contract.length}`);
    console.log(`  어디에도 안 쓰이는 토큰 ${unused.length}개`);
    console.log(`  토큰 하나를 보려면: npm run token-usage -- --color-fg-muted`);
  }
}
