/**
 * 컴포넌트가 '반쯤만' 추가되는 걸 막는다.
 *
 * 컴포넌트 하나는 파일 하나로 끝나지 않는다. 네 자리에 모두 들어가야 제 몫을 한다.
 *
 *   components/<이름>.tsx          부품 자체
 *   components/<이름>.stories.tsx  컴포넌트 목록에 뜬다
 *   index.ts 의 export             제품이 `import { X } from '@ax/react'` 로 쓸 수 있다
 *   lab/gallery.tsx                테마 랩에서 색을 바꿀 때 같이 움직이는 게 보인다
 *
 * 세 번째를 빠뜨리는 게 제일 위험하다. 레지스트리에는 나가는데(build-registry 는
 * 디렉터리를 직접 읽는다) 패키지에서는 못 불러온다. 빌드도 타입체크도 통과한다.
 *
 * 그래서 export 누락만 빌드를 막고, 스토리·갤러리는 경고로 알린다 —
 * 정적으로 보여주기 어려운 컴포넌트가 실제로 있기 때문이다(GALLERY_EXEMPT).
 */
import { readFile, readdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COMPONENTS = path.join(root, 'packages/react/src/components');
const INDEX = path.join(root, 'packages/react/src/index.ts');
const GALLERY = path.join(root, 'apps/storybook/src/lab/gallery.tsx');

/**
 * 갤러리에 없어도 되는 것. 트리거를 눌러야 나타나거나(Toast) 열어두면 화면을
 * 가려서(NavigationMenu) 한 화면에 깔 수 없는 컴포넌트다.
 * 새로 넣을 때는 '왜 못 까는지'를 여기 함께 적는다 — 이유 없이 늘면 검사가 무의미해진다.
 */
const GALLERY_EXEMPT = {
  'navigation-menu': '드롭다운이 열리면 아래 구역을 덮어 한 화면에 못 깐다',
  toast: '띄우려면 버튼을 눌러야 한다 — 정적으로 존재하지 않는다',
};

/**
 * 만들 순서. needs 가 다 갖춰진 것부터 손대야 두 번 일하지 않는다.
 * 여기 있는 건 '계획'이라 없어도 검사에 실패하지 않는다 — 다음에 뭘 할지만 알려준다.
 */
const PLANNED = [
  { name: 'badge', why: 'status-* 토큰 16개의 유일한 소비처. 지금은 갤러리에 인라인 span 으로만 있다' },
  { name: 'spinner', why: 'AGENTS.md ¶5 가 "없다"고 적어둔 자리. Button 의 loading 도 여기 막혀 있다' },
  { name: 'chip', needs: ['badge'], why: '고를 수 있는 태그. 알약 모양을 Badge 와 공유한다' },
  { name: 'alert', needs: ['badge'], why: '인라인 상태 배너. Badge 와 같은 status-* 를 쓴다' },
  { name: 'card', why: 'surface-raised · radius-surface 의 소비처. 지금은 갤러리가 직접 그린다' },
  { name: 'calendar', why: 'Base UI 에 없다 — 먼저 build-registry 의 의존성 추출기를 고쳐야 한다' },
  { name: 'date-picker', needs: ['calendar'], why: '날짜 + 시간. Calendar + Popover + Select 조합' },
];

const exists = (p) => access(p).then(() => true, () => false);

export async function checkComponents() {
  const files = (await readdir(COMPONENTS)).filter((f) => f.endsWith('.tsx') && !f.includes('.stories.'));
  const names = files.map((f) => f.replace(/\.tsx$/, '')).sort();
  const index = await readFile(INDEX, 'utf8');
  const gallery = await readFile(GALLERY, 'utf8');

  const errors = [];
  const warnings = [];

  for (const name of names) {
    const source = await readFile(path.join(COMPONENTS, `${name}.tsx`), 'utf8');

    // index.ts 가 이 파일을 가리키는가. 경로로 보면 이름이 조금 달라도(Select/SelectRoot…) 잡힌다.
    if (!index.includes(`'./components/${name}'`)) {
      errors.push(`${name} — index.ts 에 export 가 없다. 레지스트리에는 나가지만 @ax/react 에서 못 불러온다`);
    }

    if (!(await exists(path.join(COMPONENTS, `${name}.stories.tsx`)))) {
      warnings.push(`${name} — 스토리가 없다. 컴포넌트 목록에 안 뜬다`);
    }

    // 이 파일이 내보내는 이름 중 하나라도 갤러리에서 쓰이는가.
    const exported = [...source.matchAll(/export (?:function|const) ([A-Z]\w+)/g)].map((m) => m[1]);
    const inGallery = exported.some((n) => new RegExp(`<${n}[\\s/>]`).test(gallery));
    if (!inGallery && !(name in GALLERY_EXEMPT)) {
      warnings.push(`${name} — 테마 랩 갤러리에 없다. 색을 바꿔도 같이 움직이는지 볼 수 없다`);
    }
  }

  const have = new Set(names);
  const next = PLANNED.filter((p) => !have.has(p.name));
  const ready = next.filter((p) => (p.needs ?? []).every((d) => have.has(d)));
  const blocked = next.filter((p) => !(p.needs ?? []).every((d) => have.has(d)));

  return { names, errors, warnings, ready, blocked };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { names, errors, warnings, ready, blocked } = await checkComponents();

  for (const w of warnings) console.log(`  ! ${w}`);
  for (const e of errors) console.error(`  ✗ ${e}`);

  if (errors.length) {
    console.error(`\n✗ 컴포넌트 ${names.length}개 · export 누락 ${errors.length}개`);
    process.exit(1);
  }
  console.log(`✓ 컴포넌트 ${names.length}개 — 파일·스토리·export·갤러리 네 자리 모두 채움` +
    (warnings.length ? ` (경고 ${warnings.length}개)` : ''));

  if (ready.length) {
    console.log('\n  다음에 만들 것 (앞선 것이 다 있어 바로 착수 가능):');
    for (const p of ready) console.log(`    ${p.name.padEnd(12)} ${p.why}`);
  }
  if (blocked.length) {
    console.log('\n  아직 막힌 것:');
    for (const p of blocked) {
      const missing = (p.needs ?? []).filter((d) => !names.includes(d));
      console.log(`    ${p.name.padEnd(12)} ${missing.join(', ')} 먼저 — ${p.why}`);
    }
  }
}
