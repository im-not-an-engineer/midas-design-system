/**
 * 계약 린트.
 *
 * 왜 필요한가: Tailwind는 모르는 클래스를 만나도 에러를 내지 않는다. 그냥 아무것도
 * 만들지 않는다. 그래서 `h-9`, `z-modal`, `bg-primary-light` 같은 걸 쓰면 빌드는
 * 초록불인데 화면에서 스타일만 조용히 빠진다. LLM이 계약에 없는 토큰을 발명했을 때
 * 정확히 이 모양으로 실패하고, 사람 리뷰로는 잘 안 걸린다. (이 저장소를 만드는
 * 동안에도 z-modal / duration-fast / inset-0 세 개가 이렇게 통과했다.)
 *
 * 하는 일: 소스의 클래스 문자열을 모아 Tailwind 자신에게 "이거 유효하냐"고 물어보고,
 * 아무것도 만들지 않는 게 하나라도 있으면 빌드를 실패시킨다.
 *
 * 통과 기준이 곧 2층 계약이다 — @theme에서 Tailwind 기본 테마를 비웠기 때문에
 * 계약에 없는 값은 유틸리티 자체가 존재하지 않고, 여기서 걸린다.
 */
import { __unstable__loadDesignSystem } from 'tailwindcss';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const stylesEntry = path.join(root, 'packages/react/src/styles.css');

/** 스캔 대상. 새 패키지를 만들면 여기에 추가한다. */
const SCAN_DIRS = [path.join(root, 'packages/react/src'), path.join(root, 'apps/playground/src')];

/**
 * 후보 추출: 문자열 리터럴 안의 공백으로 나뉜 토큰만 본다.
 *
 * Tailwind 자체 스캐너(oxide)는 소스의 모든 식별자를 후보로 주기 때문에
 * `props`, `isInvalid`, `radix-ui` 까지 클래스로 오인한다. 우리 소스에서는
 * 클래스가 항상 문자열 리터럴 안에 있으므로 이 쪽이 훨씬 정확하다.
 * (대신 규약이 하나 생긴다 — 클래스는 문자열 리터럴로 쓴다.)
 */
function extractCandidates(src) {
  // 주석과 import/export 구문 제거 — 둘 다 클래스가 아닌 문자열이 많다.
  const cleaned = src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/\/\/[^\n]*/g, (m) => ' '.repeat(m.length))
    .replace(/^\s*(import|export)\s+[^\n]*from\s*['"][^'"]*['"];?/gm, (m) => ' '.repeat(m.length));

  const out = [];
  const re = /(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
  let m;
  while ((m = re.exec(cleaned))) {
    // JSX 속성값으로 바로 붙은 문자열은 className일 때만 클래스다.
    // side="inline-end", intent="primary" 같은 prop 값을 클래스로 오인하지 않기 위해서다.
    // cn(...) 인자나 const 배열 안의 문자열은 앞에 `속성=`가 없으므로 그대로 통과한다.
    const attr = /([A-Za-z_$][\w$]*)\s*=\s*\{?\s*$/.exec(cleaned.slice(0, m.index));
    if (attr && attr[1] !== 'className') continue;

    // 객체 키 위치({ 'bottom-right': … }, 앞이 { 또는 , 또는 줄 시작이고 뒤가 :)와
    // 타입/속성 인덱스(['swipeDirection'])는 클래스가 아니다. 삼항(? 'a' : 'b')은 앞이 ?라 남는다.
    const before = cleaned.slice(0, m.index).replace(/\s+$/, '');
    const after = cleaned.slice(m.index + m[0].length).replace(/^\s+/, '');
    const prev = before.slice(-1);
    if (after.startsWith(']')) continue;
    // 타입 유니언·옵셔널 속성 타입의 리터럴('a' | 'b', size?: 'sm')은 클래스가 아니다.
    if (prev === '|' || after.startsWith('|') || /\?\s*:\s*$/.test(before)) continue;
    if (after.startsWith(':') && (prev === '{' || prev === ',' || prev === '' || before.endsWith('\n'))) continue;

    const line = cleaned.slice(0, m.index).split('\n').length;
    for (const raw of m[2].split(/\s+/)) {
      const c = raw.trim();
      if (c) out.push({ candidate: c, line });
    }
  }
  return out;
}

/** 유효하지 않은 후보 중, 애초에 클래스가 아니었던 것들. */
const NOT_A_CLASS = [
  /^[A-Z]/,                       // 컴포넌트 이름
  /^(https?|data|node|file):/,    // URL·스킴
  /\.(ts|tsx|css|js|mjs|json)$/,  // 파일명
  /^@/,                           // 패키지 이름
  /^--/,                          // CSS 변수 이름
  /[{}$()]/,                      // 템플릿 자리표시자
  /^ax-/,                            // 우리가 손으로 쓴 CSS 클래스 (.ax-* 규약)
  /^[^[]*[A-Z]/,                  // 대괄호 앞에 대문자 = camelCase 식별자
  /^[a-z]+$/,                        // 하이픈 없는 소문자 단어 = prop 값 등
  /^\.{0,2}\//,                      // 상대 경로 (./components/dialog)
  /^(data|aria)-[a-z-]+$/,           // 어트리뷰트 이름. data-[state=open]: 같은 변형은 통과시킨다
  /^[^a-z[-]/i,                      // 영문자·대괄호·음수부호로 시작하지 않으면 클래스가 아님 (—, ×, + …)
  /=$|^</,                           // JSX 속성 이름 조각(name=)이나 태그(<Avatar) — 따옴표 짝이 어긋나 새어 들어온 것
];

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(tsx?|jsx?)$/.test(e.name)) yield p;
  }
}

async function loadStylesheet(id, base) {
  const resolve = {
    tailwindcss: path.join(root, 'node_modules/tailwindcss/index.css'),
    '@ax/tokens/css': path.join(root, 'packages/tokens/dist/tokens.css'),
  }[id];
  const p = resolve ?? (id.startsWith('.') ? path.resolve(base, id) : null);
  if (!p) throw new Error(`알 수 없는 스타일시트 import: ${id}`);
  return { base: path.dirname(p), content: await readFile(p, 'utf8') };
}

async function main() {
  const design = await __unstable__loadDesignSystem(await readFile(stylesEntry, 'utf8'), {
    base: path.dirname(stylesEntry),
    loadStylesheet,
    loadModule: async () => { throw new Error('플러그인은 쓰지 않습니다'); },
  });

  const failures = [];
  let files = 0;
  let checked = 0;

  for (const dir of SCAN_DIRS) {
    for await (const file of walk(dir)) {
      files++;
      const source = await readFile(file, 'utf8');
      // 클래스가 아닌 문자열을 다루는 파일은 파일 첫 줄에 이 표시로 제외한다.
      if (source.includes('ax-lint-disable-file')) continue;
      const found = extractCandidates(source);
      if (!found.length) continue;
      const results = design.candidatesToCss(found.map((f) => f.candidate));
      results.forEach((css, i) => {
        checked++;
        if (css !== null) return;
        const { candidate, line } = found[i];
        if (NOT_A_CLASS.some((re) => re.test(candidate))) return;
        failures.push({ file: path.relative(root, file), line, candidate });
      });
    }
  }

  if (failures.length) {
    console.error(`\n✗ 계약에 없는 클래스 ${failures.length}개\n`);
    for (const f of failures) console.error(`  ${f.file}:${f.line}  ${f.candidate}`);
    console.error(
      `\n  이 이름들은 아무 CSS도 만들지 않습니다 — 화면에서 스타일이 조용히 빠집니다.\n` +
      `  고치는 법:\n` +
      `    · 2층 계약에 있는 토큰으로 바꾸기 (목록: packages/tokens/dist/contract.json)\n` +
      `    · 정말 계약에 없어야 할 값이면 packages/tokens/src/semantic/ 에 키를 추가하고 토큰 재빌드\n`,
    );
    process.exit(1);
  }

  console.log(`✓ 계약 린트 통과 — 파일 ${files}개, 후보 ${checked}개, 위반 0`);
}

main().catch((e) => { console.error(`\n✗ 린트 실행 실패: ${e.message}\n`); process.exit(1); });
