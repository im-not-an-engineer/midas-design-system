# AX 디자인시스템

**스토리북:** https://im-not-an-engineer.github.io/midas-design-system/ (`main` 푸시마다 자동 배포)

제품이 그대로 받아 쓰는 디자인시스템 라이브러리. **코드가 source of truth이며 Figma는 아니다.**

```
packages/tokens   @ax/tokens   토큰. 프레임워크 무관(CSS 변수 + JSON).
packages/react    @ax/react    React 컴포넌트. 헤드리스(Base UI)에 토큰을 바인딩한 스타일 층.
apps/playground                테마 축이 실제로 도는지 확인하는 검증용 화면.
apps/storybook                 검수 장치. 툴바에서 프리셋·모드를 바꾸며 모든 상태를 확인한다.
```

## 제품에서 쓰는 법

```tsx
import '@ax/react/styles.css';
import { AxTheme, Button } from '@ax/react';

export default function App() {
  return (
    <AxTheme brand="default">
      <Button intent="primary">저장</Button>
    </AxTheme>
  );
}
```

제품이 정하는 것은 **브랜드 하나**뿐이다. 치수(크기·간격·모서리·글자 크기)는 이 저장소에
한 벌만 있다 — 다른 치수가 필요한 제품은 이 저장소를 포크해 `semantic/` 을 직접 고친다(「치수」 절).

## 이 저장소의 구조 (왜 이렇게 나눴는가)

디자인시스템을 하나의 덩어리로 보지 않고 층으로 나눴다. 층마다 '빌릴지 만들지'가 다르다.

| 층 | 무엇 | 여기서는 |
|---|---|---|
| ① 동작·접근성 | 포커스 트랩, 키보드 조작, ARIA | **빌린다** (Base UI) |
| ② 토큰·테마 | 브랜드·밀도·모드별 값과 그 구조 | **소유한다** (`packages/tokens`) |
| ③ 스타일 층 | ①에 ②를 바인딩한 바로 쓸 수 있는 컴포넌트 | **소유한다** (`packages/react`) |
| ④ 패턴 | 조립된 화면 부품, 레이아웃 blueprint | 아직 없음 — 다음 단계 |
| ⑤ 에이전트 컨텍스트 | 컴포넌트 메타데이터, AGENTS.md, MCP | 씨앗만 (`AGENTS.md`) |

**아이콘도 ① 처럼 빌린다** — 세트는 lucide(`lucide-react`)이고, 컴포넌트는 `packages/react/src/lib/icons.ts` 를 거쳐서만 쓴다. 세트를 갈아끼울 일이 생기면 그 파일만 고친다.

완제품 디자인시스템(Material, Ant 등)을 통째로 가져와 색만 바꾸는 방식은 쓰지 않는다.
색을 바꿔도 그 시스템처럼 보이고, 오버라이드가 쌓이고, LLM이 학습 데이터에서 본
그 시스템의 기본 관례로 계속 회귀하기 때문이다.

## 토큰 구조

```
1. Primitive   palette.slate.900 / palette.stone.900 / palette.blue.600   ← 재질. CSS로 나가지 않는다
      ↓
2. Semantic    color.fg.default = {palette.slate.900}   --color-fg-default     ← 계약. 컴포넌트는 이 이름만 쓴다
      ↓
3. Component   (아직 없음. 예외가 생길 때만 만든다.)
```

**2층이 계약이다.** 키 집합이 모든 테마에서 같고, 테마는 그중 일부만 덮어쓴다.
현재 계약 토큰 158개 — 전체 목록은 `packages/tokens/dist/contract.json`.

**예전엔 가운데 ramp(역할 램프) 층이 있었다 — 걷어냈다.** 시맨틱이 `ramp.neutral.900`(역할)을
보고 브랜드가 "neutral = slate"를 한 줄로 정하는 구조였다. 이득은 하나 — 색군을 한 줄로 통째로
바꾼다 — 였는데, 실제로 다른 스타일이 필요한 경우는 거의 다 **이름표 재배정**이었고 분기도
드물어서(반년에 한 건 정도) 한 칸의 혼란("어디를 고쳐야 하지?")만 남았다. 지금은 시맨틱이
재질의 단계를 직접 가리키고, 다른 브랜드는 필요한 키를 다른 재질·단계로 덮는다. 걷어낼 때
모든 조합(브랜드 × 아키타입 × 모드 18가지, 값 2,844개)의 결과가 한 글자도 바뀌지 않는 것을
확인했다.

**장식색.** 뜻이 없고 서로 구분되기만 하면 되는 색 — 기능 아이콘, 카테고리 칩 — 은
`color.decorative.*` 에 둔다. 계약 이름은 **반드시 번호로** 짓는다(`color.decorative.1`).
`decorative.purple` 처럼 색 이름을 넣으면 브랜드가 재질을 바꾼 순간 이름이 거짓말이 된다.
슬롯 하나당 비용은 네 줄이다 — 계약 2(`subtle`·`fg`), `mode/dark.json` 2.

**재질 이름은 색으로만 짓는다.** `slate` `blue` `purple` 은 누가 쓰든 참인 이름이다.
`brand` 나 제품 이름을 재질에 붙이면 (1) 제품이 둘 이상일 때 "어느 제품의 브랜드인지"
답할 수 없고, (2) 다른 제품이 같은 색을 쓰고 싶어도 이름 때문에 못 쓴다. palette는
모든 제품의 **합집합**이고, 어느 재질도 특정 제품의 소유가 아니다.

## 브랜드가 정하는 것 — 포인트 컬러 교체가 아니다

기본 브랜드(`default`)는 따로 파일이 없다 — `semantic/color.json` 과 `mode/dark.json` 이 곧 기본이다.
다른 브랜드 파일(`packages/tokens/src/brand/<이름>.json`)은 **이름표 일부를 다른 재질·단계로 덮는다.**

```json
{ "color": { "action": { "primary": { "bg": { "default": { "$value": "{palette.stone.900}" } } } } } }
```

"이 브랜드의 primary 버튼은 브랜드색이 아니라 무채색", "회색 계열을 웜그레이로" 같은 결정이
전부 이 한 가지 방법으로 된다. 덮은 키는 **`brand/<이름>.dark.json`에서 다크 값도 정해야
한다**(규칙 5) — 안 그러면 전역 dark.json 의 기본 값이 그 키를 되돌려 버린다.

검증용 브랜드 둘이 있다: `vivid`(강조 계열 9키를 orange 로), `mono`(회색 계열을 stone 으로,
primary·포커스·링크를 무채색으로, 강조를 red 로 — 59키). 덮는 키가 많아질수록 그 브랜드는 "테마"라기보다
"다른 시스템"에 가까워진다 — 빌드 출력에 개수가 매번 찍힌다.

**브랜드 추가 = 파일 추가.** `build.mjs`를 고치지 않는다. 디렉터리에 있는 파일이 곧 등록이다.

**왜 런타임 `var()` 체인이 아니라 빌드 시점 해석인가.** CSS 커스텀 프로퍼티 안의 `var()`는
'선언된 요소'에서 치환된다. `:root`에 `--color-fg-default: var(--palette-slate-900)`을 두고
자식 div가 `--palette-slate-900`을 바꿔도, 부모에서 이미 굳은 값이 내려온다. 그래서 모든
값을 (브랜드 × 모드) 조합별로 빌드 시점에 리터럴로 굳힌다. 조합은 브랜드 수 × 2라 비용이 없다.

## 테마 축 두 개

축은 서로 독립이고, 각자 자기 몫만 건드린다. 둘 다 **색만** 바꾼다.

| 축 | 언제 정해지나 | 무엇을 바꾸나 | 현재 값 |
|---|---|---|---|
| `brand` | 제품이 한 번 고름 | 이름표 일부를 다른 재질·단계로 덮기 | `default` `vivid` `mono` |
| `mode` | 런타임에 바뀜 | 라이트/다크 | `light` `dark` |

```html
<div data-brand="vivid" data-mode="dark">
```

테마 전환은 DOM 어트리뷰트 변경이다. 재렌더링이 없다.

## 치수 — 축이 아니다

컨트롤 높이·여백·모서리·글자 크기는 `semantic/layout.json`·`typography.json` **한 벌**이다.
지금 값은 고밀도 업무 도구 기준(컨트롤 28/32/36, 본문 13px)이다.

**예전엔 `archetype/` 층이 있었다 — 걷어냈다.** `workbench`·`consumer` 델타가 치수 30여 개를
덮고, 프리셋이 아키타입 × 브랜드를 조합하는 구조였다. "한 저장소가 치수 델타로 여러 제품을
감당한다"는 전제의 산물인데, 운영 방식이 "기본 시스템 하나를 주고, 다른 시스템이 필요한
제품은 저장소를 포크해 토큰을 다시 짠다"로 정해지면서 전제가 사라졌다. 남는 건 배울 개념
하나와 제약(브랜드∩아키타입=∅, 두 파일 동시 수정, 제품으로 새는 `Archetype` 타입)뿐이었다.
걷어낼 때 `saas` 프리셋이 제품에 내보내는 값이 한 글자도 바뀌지 않는 것을 확인했다.

**다른 치수가 필요하면** 프리셋을 늘리지 말고 포크한 저장소의 `semantic/` 을 고친다.
출발점 견본이 `packages/tokens/templates/` 에 있다 — `workbench.json`(지금 기본과 같은 고밀도),
`consumer.json`(터치 타깃 36/44/48, 둥근 모서리, 본문 16px). 빌드에는 쓰이지 않는다.

## 테마가 바꿀 수 있는 것의 범위 = 계약의 어휘

테마로 바꾸고 싶은 게 있으면 **그 속성이 먼저 토큰이어야 한다.** 컴포넌트가 참조하지
않는 속성은 어떤 테마도 바꿀 수 없다. 변화의 폭은 세 단계로 넓어진다.

**1단계 — 이름표 재배정 (그 자리가 무슨 색인가).** 강조색을 바꾸든, primary 를 무채색으로
하든, 회색을 웜톤으로 하든 전부 이것이다 — 브랜드 파일에서 해당 키를 다른 재질·단계로 덮는다.
`mono` 브랜드가 실물 예시다:
```json
{ "color": { "action": { "primary": { "bg": { "default": { "$value": "{palette.stone.900}" } } } } } }
```

**2단계 — (비움)** 예전엔 "램프 교체"가 따로 있었다. ramp 층을 걷어내면서 1단계로 합쳤다.

**3단계 — 계약에 키 추가 (색이 아닌 속성).** 여기가 폭을 실제로 넓히는 지점이다.
예를 들어 "어떤 테마는 컨트롤에 약한 그림자"를 하려면 `elevation.control` 이라는 키가
있어야 하고, Button·Input이 그걸 참조해야 한다. 지금 그 키가 있고 기본값은 그림자 없음이다 —
`templates/consumer.json` 이 켜는 예다.

| 무엇을 바꾸고 싶나 | 어디를 고치나 | 비용 |
|---|---|---|
| 색 (색군 전체든 한 자리든) | 브랜드의 `color.*` + `.dark` | 키 단위 |
| 색이 아닌 속성(그림자·테두리 굵기…) | `semantic/`에 키 추가 + 컴포넌트가 참조 | 1회, 전 테마에 열림 |
| 특정 컴포넌트만의 예외 | 3층 컴포넌트 토큰 (아직 비어 있음) | 필요해질 때 |

2층 키를 잘게 쪼갤수록 유연해지지만 유지가 어려워진다. 그래서 **역할 × 강조도 × 상태**
수준을 유지하고, 정말 한 컴포넌트에만 필요한 예외가 생기면 그때 3층을 연다.

## 규칙 여덟 가지 (빌드가 강제한다)

1. **1층은 CSS로 나가지 않는다.** `--palette-blue-600` 같은 변수는 존재하지 않는다.
2. **테마 delta는 계약에 있는 키만 덮을 수 있다.** 새 키를 만들면 빌드 실패.
3. **(폐지)** — "브랜드와 아키타입은 같은 키를 건드릴 수 없다"였다. 아키타입 층을 걷어내면서
   없앴다. 번호는 다른 곳이 가리키고 있어 비워 둔다.
4. **`mode/dark.json`은 2층의 모든 색 키를 명시적으로 덮어야 한다.** 기본 브랜드의 다크다. 색 키를 추가하고 다크를 빼먹으면 에러 없이 라이트 값이 다크 화면에
   그대로 뜬다. 값이 같아도 적는다 — "같다"도 결정이다.
5. **브랜드가 시맨틱 색 키를 덮었으면 `brand/<이름>.dark.json`이 그 키들을 전부 덮어야 한다.**
6. **(폐지)** — "램프는 통째로만 바꾼다"였다. ramp 층을 걷어내면서 없앴다. 번호는 다른 곳이 가리키고 있어 비워 둔다.
7. **토큰 소스 JSON은 한 가지 포맷이어야 한다.** 테마 랩이 저장할 때 파일을 통째로 다시 쓰므로,
   포맷이 제각각이면 값 하나를 바꿔도 파일 전체가 바뀐 것으로 보여 **협업 시 충돌이 난다.**
   `npm run format:tokens` 로 고친다.
8. **같은 치수 사다리 안의 단계는 반드시 커져야 한다.** `size.control` `sm < md < lg`,
   `space.inset` `xs < … < xl` 처럼. 같아도 실패 — `size="lg"` 가 `md` 와 같아지면 prop 이
   거짓말이 된다. 테마 랩 드롭다운은 아무 단계나 고를 수 있으므로 저장 시 여기서 잡는다.
   `font.size` 는 본문(caption·body·bodyLg)과 제목(headingSm~display) 두 사다리로 따로 본다 —
   bodyLg 와 headingSm 은 굵기로 갈리는 다른 역할이라 같은 px 여도 정상이다. radius 는 뺀다.

그리고 계약 린트가 하나 더 있다:

7. **계약에 없는 클래스를 쓰면 빌드 실패.** `h-9`, `p-4`, `bg-blue-500`, `rounded-lg`는
   Tailwind 기본 테마를 비웠기 때문에 애초에 존재하지 않는다. Tailwind는 모르는
   클래스를 만나도 에러를 내지 않고 조용히 아무것도 만들지 않으므로,
   `npm run lint:contract`가 대신 잡는다.

## 합성 (`render`)

Base UI는 `asChild`가 아니라 `render` prop으로 합성한다.

```tsx
<DialogTrigger render={<Button intent="primary" />}>열기</DialogTrigger>
<Button render={<a href="/docs" />}>문서</Button>
```

합성 대상이 되는 커스텀 컴포넌트는 **받은 props를 그대로 펼치고 ref를 전달해야 한다.**
`mergeProps`로 한 번 더 감싸면 Base UI가 자기 이벤트 핸들러를 알아보지 못해
메뉴가 열렸다가 바로 닫히는 식으로 조용히 깨진다.

## 명령어

```bash
npm run verify          # 전체 검증 (토큰 빌드 → 계약 린트 → 패키지 빌드 → 타입 검사 → 소비 앱 빌드)
npm run build           # 토큰 + 린트 + React 패키지
npm run build:tokens    # 토큰만
npm run lint:contract   # 계약 린트만
npm run format:tokens   # 토큰 소스 JSON 포맷 맞추기 (규칙 7)
npm run build:registry  # 레지스트리 JSON 생성
npm run dev             # playground 개발 서버
npm run storybook       # 스토리북 (localhost:6006). 스토리는 컴포넌트 옆 *.stories.tsx
npm run build-storybook # 정적 빌드 → apps/storybook/storybook-static
```

## 환경

Node 22 이상 (`.nvmrc` = 26). `npm install` 한 번이면 워크스페이스 전체가 설치된다.

## 배포

`main`에 푸시하면 GitHub Actions(`.github/workflows/storybook.yml`)가 토큰 빌드 → 계약 린트 →
컴포넌트 빌드 → 타입 검사 → 스토리북 빌드 → GitHub Pages 배포를 순서대로 한다. 앞 단계가
실패하면 배포하지 않는다. 저장소 Settings → Pages → Source를 **GitHub Actions**로 두어야 한다.

## 자주 하는 작업 — 절차

### 프리셋 추가 (색이 다른 제품이 늘 때)

1. `packages/tokens/src/brand/<이름>.json` — 덮을 색 키만 적는다. 시맨틱 매핑을 바꿨으면
   규칙 5에 따라 `<이름>.dark.json` 도 함께.
2. `packages/tokens/presets.json` 에 한 덩어리 추가:
   ```json
   "console": { "product": true, "brand": "console",
                "label": "콘솔", "title": "…", "description": "…" }
   ```
3. `npm run verify` — 브랜드 파일을 빼먹었으면 **무엇을 만들어야 하는지 알려주며 막는다.**

이것만으로 스토리북 툴바와 레지스트리 배포에 동시에 나타난다(같은 파일을 읽으므로).

**치수가 다른 제품은 프리셋이 아니다.** 그건 다른 시스템이므로 저장소를 포크해
`semantic/layout.json`·`typography.json` 을 고친다 — 「치수」 절.

### 토큰 키 추가 (테마로 바꿀 수 있는 것을 늘릴 때)

1. `semantic/color.json` 또는 `semantic/layout.json` 에 키 추가 — **역할 이름**으로 짓는다
   (`surface.inverse` ○ / `surface.cardHeader` ✗ — 컴포넌트 이름이 들어가면 3층 소관)
2. 색이면 `mode/dark.json` 에도 값을 적는다 — 안 적으면 규칙 4가 막는다
3. 컴포넌트가 그 토큰을 **참조하게** 한다. 이걸 빼먹으면 키만 있고 아무것도 안 바뀐다
4. `npm run verify`

### 장식 색 슬롯 추가 (아이콘·칩 색을 늘릴 때)

1. 색을 만든다 — `npm run ramp -- '#헥스'`. 중복 경고가 뜨면 기존 재질로 될 일인지 먼저 본다
2. `primitive/color.json` 에 재질 추가 (이름은 색으로)
3. `semantic/color.json` 의 `color.decorative` 에 `N: { subtle, fg }` — 재질의 단계를 직접 가리킨다
4. `mode/dark.json` 에 같은 두 키 (규칙 4가 강제한다)

장식색이 브랜드를 따라야 하면 `brand/<이름>.json` 에서 `decorative.N` 을 덮는다.
안 덮으면 모든 브랜드가 같은 장식색을 쓴다 — 지금은 그쪽이 기본이다.

### UI 폴리싱 (대부분의 작업)

테마 랩에서 값을 바꾸고 저장한다. 저장 위치는 패널에 표시된다 —
치수는 `semantic/` 으로, 색은 팔레트나 계약(또는 고른 브랜드 파일)으로 간다.

## 토큰 고치는 법

| 하고 싶은 것 | 고칠 파일 |
|---|---|
| 색·간격 원재료 추가 | `packages/tokens/src/primitive/` |
| 계약에 키 추가·삭제 | `packages/tokens/src/semantic/` |
| 새 브랜드 | `packages/tokens/src/brand/<이름>.json` (시맨틱을 덮었으면 `<이름>.dark.json`도) |
| 치수 변경 | `packages/tokens/src/semantic/layout.json` · `typography.json` (한 벌뿐 — 견본은 `templates/`) |
| 새 재질(11단계 색) | `packages/tokens/src/primitive/color.json` — 그레이는 단계 집합(0~1000)이 slate와 같아야 한다 |

고친 뒤 `npm run build:tokens`. `dist/`는 생성물이므로 직접 고치지 않는다.

## 배포 — shadcn 호환 레지스트리

제품은 npm 패키지를 설치하는 대신 **소스를 자기 레포로 복사해 소유한다.**

```bash
npx shadcn add https://im-not-an-engineer.github.io/midas-design-system/r/saas.json     # 프리셋 먼저
npx shadcn add https://im-not-an-engineer.github.io/midas-design-system/r/button.json   # 필요한 컴포넌트
```

프리셋이 토큰(`@theme`) · 다크 · 커스텀 유틸리티 · `lib/ax/*` 를 한 번에 깔고,
컴포넌트 항목은 `components/ui/<이름>.tsx` 로 복사된다. 내부 의존(예: dialog → button)은
`registryDependencies` 로 따라온다.

| 프리셋 | 내부 축 | 성격 |
|---|---|---|
| `saas` | brand `default` | 고밀도 업무 도구. 컨트롤 28px, 각진 모서리 |

**프리셋은 브랜드를 굳혀서 내보낸다.** 제품은 `[data-brand]` 전환을 받지 않고
`:root` + 다크만 받는다 — 제품 코드에는 선택지 자체가 없으므로 "뭘 써야 하지"가 생기지 않는다.

**제품팀에게는 프리셋 이름만 보여준다.** 스토리북 툴바도 `프리셋` 하나로 줄여 두었다 —
브랜드라는 내부 축은 테마 랩에서만 다룬다. 바깥 이름과 내부 축은
`packages/tokens/presets.json` 한 곳에서 이어지고, 레지스트리 생성기와 스토리북 툴바가
같은 파일을 읽으므로 둘이 어긋날 수 없다. `product: false` 인 항목(`_mono`, `_vivid`)은
축이 실제로 도는지 보여주는 검증용이라 **배포되지 않는다.**

제품 쪽 요구사항은 **Tailwind v4 + React 18+** 뿐이다. npm 레지스트리도, 인증 토큰도 필요 없다.

### 주의 — `@theme` 은 `css` 필드로 못 보낸다

shadcn 의 CSS 기록기가 `css` 안의 `@theme` 블록을 해석하지 못한다(`update-css: Unknown word …`).
토큰은 `cssVars.theme` 으로 보내고, `@utility` · `@layer` · `@custom-variant` · 선택자 블록만
`css` 로 보낸다. 생성기가 이미 그렇게 나눈다.

## 테마 랩 — 전 컴포넌트를 띄워놓고 토큰을 일괄 조정

```bash
npm run storybook   # 사이드바 맨 위 "테마 랩"
```

왼쪽에 전 컴포넌트, 오른쪽에 편집 패널이 있다. 팔레트 색을 누르면 OS 색상 선택기가
열리고, 바꾸는 즉시 왼쪽 전체가 따라 움직인다. 저장하면 토큰 소스 JSON에 기록된다.

| 패널 | 바꾸는 것 | 기록되는 파일 |
|---|---|---|
| 재질 — 팔레트 | 재질 단계의 실제 색 | `primitive/color.json` |
| 치수 | 컨트롤 높이·여백·모서리·글자 크기 | `semantic/layout.json` · `typography.json` |
| 매핑 — 시맨틱 색 | 이름표마다 재질과 단계를 고른다 — "primary는 무채색" 같은 결정 | `semantic/color.json` (기본 브랜드에서만) |

**미리보기는 흉내가 아니다.** 개발 서버가 `packages/tokens/lib.mjs`(빌드와 같은 코드)로
실제 해석한 값을 돌려준다(~13ms). 클라이언트에서 따로 계산하면 랩에서 본 것과 빌드
결과가 갈라지고, 그 순간 도구를 믿을 수 없게 된다.

### 실제 브랜드 색 입히기

브랜드가 주는 건 보통 "메인 색 한 개"인데 토큰이 필요로 하는 건 11단계다. 단계를
손으로 찍으면 명도 간격이 기존 재질과 어긋나 강조색만 바꿨는데 화면 전체의 리듬이 깨진다.
그래서 **기존 재질의 명도·채도 곡선을 빌려 쓰고 색상만 갈아끼운다**(OKLCH).

랩에서: `브랜드 색에서 재질 만들기` → 헥스 붙여넣기 → `재질 만들기` → 저장. 그다음
「매핑 — 시맨틱 색」에서 그 색을 쓸 이름표(버튼·링크·포커스링…)의 재질을 새 재질로 고른다.

명령줄에서도 같은 생성기를 쓴다:

```bash
npm run ramp -- '#1b62d4'          # 기준 blue, 결과 JSON을 stdout으로
npm run ramp -- '#1b62d4' orange   # 기준 재질을 지정
```

브랜드 색은 **어느 한 단계에 그대로 들어간다**(기본은 명도가 가장 가까운 단계).
가이드의 헥스가 화면 어디에도 없으면 "우리 색이 아니다"라는 말을 듣게 되기 때문이다.
생성기는 신뢰 시험을 통과했다 — `blue.600` 하나로 blue 11단계를 되만들면 원본과
최대 OKLab 거리 0.0012(사실상 동일)다.

**재질을 새로 만들기 전에 중복을 확인한다.** 생성기가 기존 재질과의 거리를 먼저 찍는다 —
색상각과 채도비를 둘 다 본다(`slate`와 `blue`는 색상각이 6°지만 채도가 0.037 대 0.215라
전혀 다른 색이므로 겹쳤다고 보지 않는다). 겹치지 않을 때는 색상환 어디에 앉는지도 알려준다.

```
$ npm run ramp -- '#2f62e8'
기존 재질과의 거리 (각 재질의 채도가 가장 높은 단계 기준):
  blue      색상각   0°  채도비 0.97  ← 겹칩니다
  slate     색상각   7°  채도비 5.17  (회색 계열 — 색상각 비교 안 함)
  purple    색상각  29°  채도비 0.84

⚠ blue 와 색상각·채도가 모두 가깝습니다.
  새 재질을 만들기 전에, 이름표에 기존 재질을 쓰는 것으로 끝나지 않는지 확인하세요.
```

막지는 않는다 — 판단은 사람이 한다. 재질이 늘수록 "비슷한 게 이미 있나"를 알기 어려워지는
것이 palette가 커질 때의 유일한 실질 비용이다(CSS로 나가지 않으므로 제품 쪽 비용은 0이다).

나중에 실제 브랜드 hex 가 정해지면 `primitive/color.json` 의 `palette.blue` 를 생성기로 다시 만들면 된다 —
이름표가 `palette.blue.*` 를 가리키고 있으니 버튼·링크·포커스링이 전부 따라온다.

**저장은 빌드 규칙을 모두 통과해야 한다.** 하나라도 어기면 아무 파일도 쓰지 않고 위반
내용을 그대로 보여준다 — 예를 들어 색 키를 추가하고 다크를 빼먹으면 규칙 4가 막는다.

랩은 개발 서버에서만 동작한다. 배포된 스토리북에서는 읽기 전용 안내가 뜬다.

## 스토리 작성 규칙

- 컴포넌트 옆에 `<이름>.stories.tsx`. 계약 린트가 스토리도 검사하므로 스토리 안 레이아웃도 계약 토큰만 쓴다.
- 컴포넌트마다 **상태 매트릭스 스토리**(intent × size × disabled/invalid…)를 하나 둔다. 토큰을
  바꿨을 때 모든 칸이 같이 움직이는지 보는 용도다. 오버레이는 `open` 고정 스토리를 하나 더 둔다(스냅샷용).
- 툴바의 프리셋은 `presets.json`, 모드는 `contract.json`의 `axes`에서 읽는다. 브랜드를 추가하면 툴바가 따라온다.

## 알려진 한계

- **Base UI 37개 전부를 스타일 층으로 감쌌다** (+ 우리 Table). 가족 단위로 스타일 조각을
  공유한다(`packages/react/src/lib/styles.ts`): 폼 컨트롤은 `FIELD_CONTROL`·`SELECTION_*`,
  팝업은 `POPUP_*`, 모달은 `MODAL_*`. 37개를 짓는 동안 계약에 추가한 토큰은
  `surface.inverse`·`fg.onInverse` 둘뿐이다 — 계약이 충분했다는 증거.
- **복합 컴포넌트가 없다.** 가상화 테이블, 칸반, 날짜 선택 등은 TanStack Table,
  dnd-kit 같은 전문 라이브러리를 이 토큰으로 감싸는 '래핑 층'으로 붙인다.
  추가 작업의 크기는 베이스 선택보다 이 래핑 층 설계에 좌우된다.
- **헤드리스는 Base UI다.** Radix 제작자들이 만든 후속 라이브러리로, v1.0이 2025-12-11에
  나왔고 이후 매달 마이너 릴리스가 이어지고 있다. Radix보다 컴포넌트 표면이 넓고
  (Combobox, Select, Toast, NumberField, ScrollArea, Drawer 등) prop API가 일관적이며,
  패키지에 LLM용 마크다운 문서를 동봉해 ⑤층에 바로 쓸 수 있다.
  헤드리스에 직접 의존하는 지점은 `packages/react/src/components/` 안에 한정돼 있다.
