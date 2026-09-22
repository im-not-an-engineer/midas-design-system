# AX 디자인시스템

**스토리북:** https://im-not-an-engineer.github.io/midas-design-system/ (`main` 푸시마다 자동 배포)

제품이 그대로 받아 쓰는 디자인시스템 라이브러리. **코드가 source of truth이며 Figma는 아니다.**

```
packages/tokens   @ax/tokens   토큰. 프레임워크 무관(CSS 변수 + JSON).
packages/react    @ax/react    React 컴포넌트. 헤드리스(Base UI)에 토큰을 바인딩한 스타일 층.
apps/playground                테마 축이 실제로 도는지 확인하는 검증용 화면.
apps/storybook                 검수 장치. 툴바에서 아키타입·브랜드·모드를 바꾸며 모든 상태를 확인한다.
```

## 제품에서 쓰는 법

```tsx
import '@ax/react/styles.css';
import { AxTheme, Button } from '@ax/react';

export default function App() {
  return (
    <AxTheme archetype="workbench" brand="default">
      <Button intent="primary">저장</Button>
    </AxTheme>
  );
}
```

제품이 정하는 것은 두 가지뿐이다 — **아키타입 하나**와 **브랜드 하나**.

## 이 저장소의 구조 (왜 이렇게 나눴는가)

디자인시스템을 하나의 덩어리로 보지 않고 층으로 나눴다. 층마다 '빌릴지 만들지'가 다르다.

| 층 | 무엇 | 여기서는 |
|---|---|---|
| ① 동작·접근성 | 포커스 트랩, 키보드 조작, ARIA | **빌린다** (Base UI) |
| ② 토큰·테마 | 브랜드·밀도·모드별 값과 그 구조 | **소유한다** (`packages/tokens`) |
| ③ 스타일 층 | ①에 ②를 바인딩한 바로 쓸 수 있는 컴포넌트 | **소유한다** (`packages/react`) |
| ④ 패턴 | 조립된 화면 부품, 레이아웃 blueprint | 아직 없음 — 다음 단계 |
| ⑤ 에이전트 컨텍스트 | 컴포넌트 메타데이터, AGENTS.md, MCP | 씨앗만 (`AGENTS.md`) |

완제품 디자인시스템(Material, Ant 등)을 통째로 가져와 색만 바꾸는 방식은 쓰지 않는다.
색을 바꿔도 그 시스템처럼 보이고, 오버라이드가 쌓이고, LLM이 학습 데이터에서 본
그 시스템의 기본 관례로 계속 회귀하기 때문이다.

## 토큰 구조

```
1. Primitive   palette.slate.900 / palette.stone.900 / palette.blue.600   ← 재질. CSS로 나가지 않는다
      ↓
   Ramp        ramp.neutral = {palette.slate}   ramp.accent = {palette.blue}   ← 역할. 브랜드가 정한다. CSS로 나가지 않는다
      ↓
2. Semantic    color.fg.default = {ramp.neutral.900}   --color-fg-default        ← 계약. 컴포넌트는 이 이름만 쓴다
      ↓
3. Component   (아직 없음. 예외가 생길 때만 만든다.)
```

**2층이 계약이다.** 키 집합이 모든 테마에서 같고, 테마는 그중 일부만 덮어쓴다.
현재 계약 토큰 150개 — 전체 목록은 `packages/tokens/dist/contract.json`.

**램프가 있는 이유.** 시맨틱이 `palette.slate.900`을 직접 가리키면, 그레이를 웜그레이로
바꾸려는 브랜드는 slate를 참조하는 80여 개 키를 전부 다시 적어야 한다 — 그건 테마가
아니라 시맨틱 복제다. 시맨틱은 `ramp.neutral.900`(역할)만 보고, **어느 재질이 neutral인지는
브랜드가 한 줄로 정한다.** 역할 램프는 6개: `neutral` `accent` `info` `success` `warning` `danger`.
`info`가 `accent`와 별개인 이유는 브랜드색이 주황이어도 정보 알림은 파랑이어야 하기 때문이다.

**장식 램프.** 역할 램프 외에 `decorative1` 이 있다. 뜻이 없고 서로 구분되기만 하면 되는
색 — 기능 아이콘, 카테고리 칩 — 을 위한 자리다. 계약 이름은 **반드시 번호로** 짓는다
(`color.decorative.1`). `decorative.purple` 처럼 색 이름을 넣으면 브랜드가 배정을 바꾼
순간 이름이 거짓말이 된다. 슬롯 하나당 비용은 네 줄이다 — 램프 배정 1, 계약 2(`subtle`·`fg`),
`mode/dark.json` 2.

**재질 이름은 색으로만 짓는다.** `slate` `blue` `purple` 은 누가 쓰든 참인 이름이다.
`brand` 나 제품 이름을 재질에 붙이면 (1) 제품이 둘 이상일 때 "어느 제품의 브랜드인지"
답할 수 없고, (2) 다른 제품이 같은 색을 쓰고 싶어도 이름 때문에 못 쓴다. palette는
모든 제품의 **합집합**이고, 어느 재질도 특정 제품의 소유가 아니다.

## 브랜드가 정하는 것 — 포인트 컬러 교체가 아니다

브랜드 파일(`packages/tokens/src/brand/<이름>.json`)이 할 수 있는 일은 두 가지다.

**(a) 램프 교체 — 색군 전체가 바뀐다.**
```json
{ "ramp": { "neutral": { "$ramp": "{palette.stone}" }, "accent": { "$ramp": "{palette.red}" } } }
```
`$ramp`는 빌드가 palette의 모든 단계로 펼치는 축약이다. 램프는 통째로만 바꾼다(규칙 6).
포인트 컬러만 다른 브랜드(`vivid`)는 `accent` 한 줄이 전부다.

**(b) 시맨틱 재매핑 — 스타일 논리가 바뀐다.**
```json
{ "color": { "action": { "primary": { "bg": { "default": { "$value": "{ramp.neutral.900}" } } } } } }
```
"이 브랜드의 primary 버튼은 브랜드색이 아니라 무채색"처럼 매핑 자체를 바꾼다.
(b)를 했으면 **`brand/<이름>.dark.json`이 반드시 있어야 한다**(규칙 5) — 전역 dark.json은
ramp 기준으로 적혀 있어 램프 교체에는 자동으로 따라오지만, 매핑을 바꾼 키는 브랜드가
다크 값을 직접 정해야 하기 때문이다.

`mono` 브랜드가 (a)+(b)의 실물 예시다: 웜그레이 + 무채색 primary + 다크에서 반전된 버튼.

**브랜드 추가 = 파일 추가.** `build.mjs`를 고치지 않는다. 디렉터리에 있는 파일이 곧 등록이다.

**왜 런타임 `var()` 체인이 아니라 빌드 시점 해석인가.** CSS 커스텀 프로퍼티 안의 `var()`는
'선언된 요소'에서 치환된다. `:root`에 `--color-fg-default: var(--ramp-neutral-900)`을 두고
자식 div가 `--ramp-neutral-900`을 바꿔도, 부모에서 이미 굳은 값이 내려온다. 그래서 모든
값을 (브랜드 × 모드) 조합별로 빌드 시점에 리터럴로 굳힌다. 조합은 브랜드 수 × 2라 비용이 없다.

## 테마 축 세 개

축은 서로 독립이고, 각자 자기 몫만 건드린다.

| 축 | 언제 정해지나 | 무엇을 바꾸나 | 현재 값 |
|---|---|---|---|
| `archetype` | 제품이 한 번 고름 | **치수만** (크기·간격·모서리·글자 크기) | `base` `workbench` `consumer` |
| `brand` | 제품이 한 번 고름 | **색만** — 램프 교체 + 선택적 시맨틱 재매핑 | `default` `vivid` `mono` |
| `mode` | 런타임에 바뀜 | 색 | `light` `dark` |

```html
<div data-archetype="workbench" data-brand="vivid" data-mode="dark">
```

테마 전환은 DOM 어트리뷰트 변경이다. 재렌더링이 없다.

아키타입이 '밀도'가 아니라 '문법'인 이유: 제품 팀은 "밀도 0.8"을 고르지 않고
"우리는 이런 종류의 제품"이라고 말한다. 그리고 실제로 함께 움직이는 건 밀도 하나가
아니라 묶음이다 — 간격, 레이블 위치, 확인 방식, 피드백 방식. 제품 팀에게는
아키타입 이름 하나만 노출하고, 그 안의 축은 시스템이 관리한다.

## 테마가 바꿀 수 있는 것의 범위 = 계약의 어휘

테마로 바꾸고 싶은 게 있으면 **그 속성이 먼저 토큰이어야 한다.** 컴포넌트가 참조하지
않는 속성은 어떤 테마도 바꿀 수 없다. 변화의 폭은 세 단계로 넓어진다.

**1단계 — 램프 교체 (색군 전체).** `brand/<이름>.json` 한 줄. accent를 바꾸면 버튼·링크·
포커스링·선택 행이 한 번에 따라온다.

**2단계 — 시맨틱 재매핑 (그 역할이 무슨 색인가).** "이 테마의 primary는 브랜드색이 아니라
무채색" 같은 결정. `mono` 브랜드가 실물 예시다:
```json
{ "color": { "action": { "primary": { "bg": { "default": { "$value": "{ramp.neutral.900}" } } } } } }
```

**3단계 — 계약에 키 추가 (색이 아닌 속성).** 여기가 폭을 실제로 넓히는 지점이다.
예를 들어 "어떤 테마는 컨트롤에 약한 그림자"를 하려면 `elevation.control` 이라는 키가
있어야 하고, Button·Input이 그걸 참조해야 한다. 지금 그 키가 있고 `consumer` 아키타입만
켜 둔다 — `base`/`workbench`는 그림자 없음.

| 무엇을 바꾸고 싶나 | 어디를 고치나 | 비용 |
|---|---|---|
| 색군 전체 | 브랜드의 `ramp` | 한 줄 |
| 특정 역할의 색 | 브랜드의 `color.*` (파생 브랜드면 `.dark`도) | 키 단위 |
| 색이 아닌 속성(그림자·테두리 굵기…) | `semantic/`에 키 추가 + 컴포넌트가 참조 | 1회, 전 테마에 열림 |
| 특정 컴포넌트만의 예외 | 3층 컴포넌트 토큰 (아직 비어 있음) | 필요해질 때 |

2층 키를 잘게 쪼갤수록 유연해지지만 유지가 어려워진다. 그래서 **역할 × 강조도 × 상태**
수준을 유지하고, 정말 한 컴포넌트에만 필요한 예외가 생기면 그때 3층을 연다.

## 규칙 일곱 가지 (빌드가 강제한다)

1. **1층은 CSS로 나가지 않는다.** `--palette-blue-600` 같은 변수는 존재하지 않는다.
2. **테마 delta는 계약에 있는 키만 덮을 수 있다.** 새 키를 만들면 빌드 실패.
3. **브랜드와 아키타입은 같은 키를 건드릴 수 없다.** 겹치면 빌드 실패.
   (둘 다 제품 결정 시점의 축이라 겹치면 어느 쪽이 이기는지가 CSS 작성 순서에
   의존하게 되고, 그게 drift의 시작이다.)
4. **`mode/dark.json`은 2층의 모든 색 키를 명시적으로 덮어야 한다.** ramp 기준으로 적으므로
   브랜드와 무관하다. 색 키를 추가하고 다크를 빼먹으면 에러 없이 라이트 값이 다크 화면에
   그대로 뜬다. 값이 같아도 적는다 — "같다"도 결정이다.
5. **브랜드가 시맨틱 색 키를 덮었으면 `brand/<이름>.dark.json`이 그 키들을 전부 덮어야 한다.**
6. **램프는 `$ramp` 축약으로 통째로만 바꾼다.** 단계 하나만 바꾸면 그레이 계단이 어긋난다.
7. **토큰 소스 JSON은 한 가지 포맷이어야 한다.** 테마 랩이 저장할 때 파일을 통째로 다시 쓰므로,
   포맷이 제각각이면 값 하나를 바꿔도 파일 전체가 바뀐 것으로 보여 **협업 시 충돌이 난다.**
   `npm run format:tokens` 로 고친다.

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

### 프리셋 추가 (제품군이 늘 때)

1. `packages/tokens/src/archetype/<이름>.json` — 기존 파일(`workbench.json` 등)을 복사해 값만 바꾼다.
   **치수만** 넣는다. 색을 넣으면 규칙 3이 막는다.
2. `packages/tokens/presets.json` 에 한 덩어리 추가:
   ```json
   "console": { "product": true, "archetype": "console", "brand": "default",
                "label": "콘솔", "title": "…", "description": "…" }
   ```
3. `npm run verify` — 축 파일을 빼먹었으면 **무엇을 만들어야 하는지 알려주며 막는다.**

이것만으로 스토리북 툴바와 레지스트리 배포에 동시에 나타난다(같은 파일을 읽으므로).

**프리셋마다 색을 다르게 하려면 브랜드도 필요하다.** 지금 `saas`와 `landing`은
`brand: "default"` 를 공유하므로 색이 같다. 랜딩만 다른 accent 를 쓰려면
`brand/landing.json` 을 만들고 프리셋이 그걸 가리키게 한다 — 시맨틱 매핑까지 바꾸면
규칙 5에 따라 `brand/landing.dark.json` 도 함께 만들어야 한다.

### 토큰 키 추가 (테마로 바꿀 수 있는 것을 늘릴 때)

1. `semantic/color.json` 또는 `semantic/layout.json` 에 키 추가 — **역할 이름**으로 짓는다
   (`surface.inverse` ○ / `surface.cardHeader` ✗ — 컴포넌트 이름이 들어가면 3층 소관)
2. 색이면 `mode/dark.json` 에도 값을 적는다 — 안 적으면 규칙 4가 막는다
3. 컴포넌트가 그 토큰을 **참조하게** 한다. 이걸 빼먹으면 키만 있고 아무것도 안 바뀐다
4. `npm run verify`

### 장식 색 슬롯 추가 (아이콘·칩 색을 늘릴 때)

1. 색을 만든다 — `npm run ramp -- '#헥스'`. 중복 경고가 뜨면 기존 재질로 될 일인지 먼저 본다
2. `primitive/color.json` 에 재질 추가 (이름은 색으로)
3. `brand/default.json` 에 `ramp.decorativeN` 한 줄
4. `semantic/color.json` 의 `color.decorative` 에 `N: { subtle, fg }`
5. `mode/dark.json` 에 같은 두 키 (규칙 4가 강제한다)

장식색이 브랜드를 따라야 하면 `brand/<이름>.json` 에서 `decorativeN` 을 덮는다.
안 덮으면 모든 브랜드가 같은 장식색을 쓴다 — 지금은 그쪽이 기본이다.

### UI 폴리싱 (대부분의 작업)

테마 랩에서 값을 바꾸고 저장한다. 저장 위치는 패널에 표시된다 —
치수는 고른 프리셋의 아키타입 파일로, 색은 팔레트나 계약으로 간다.

## 토큰 고치는 법

| 하고 싶은 것 | 고칠 파일 |
|---|---|
| 색·간격 원재료 추가 | `packages/tokens/src/primitive/` |
| 계약에 키 추가·삭제 | `packages/tokens/src/semantic/` |
| 새 브랜드 | `packages/tokens/src/brand/<이름>.json` (시맨틱을 덮었으면 `<이름>.dark.json`도) |
| 새 아키타입 | `packages/tokens/src/archetype/<이름>.json` |
| 새 재질(색 램프) | `packages/tokens/src/primitive/color.json` — 그레이는 단계 집합(0~1000)이 slate와 같아야 한다 |

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
| `saas` | archetype `workbench` | 고밀도 업무 도구. 컨트롤 28px, 각진 모서리 |
| `landing` | archetype `consumer` | 마케팅 페이지. 컨트롤 44px, 둥근 모서리, 옅은 그림자 |

**프리셋은 아키타입을 굳혀서 내보낸다.** 제품은 `[data-archetype]` 다축 전환을 받지 않고
`:root` + 다크만 받는다 — 제품 코드에는 선택지 자체가 없으므로 "뭘 써야 하지"가 생기지 않는다.

**제품팀에게는 프리셋 이름만 보여준다.** 스토리북 툴바도 `프리셋` 하나로 줄여 두었다 —
아키타입·브랜드라는 내부 축은 테마 랩에서만 다룬다. 바깥 이름과 내부 축은
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
| 재질 — 팔레트 | 램프 단계의 실제 색 | `primitive/color.json` |
| 역할 — 램프 | 어느 재질이 neutral/accent인가 | 툴바에서 고른 `brand/<이름>.json` |
| 치수 | 컨트롤 높이·여백·모서리·글자 크기 | 아키타입이 base면 `semantic/`, 아니면 `archetype/<이름>.json` |
| 매핑 — 시맨틱 색 | "primary는 브랜드색이 아니라 무채색" 같은 결정 | `semantic/color.json` (기본 브랜드에서만) |

**미리보기는 흉내가 아니다.** 개발 서버가 `packages/tokens/lib.mjs`(빌드와 같은 코드)로
실제 해석한 값을 돌려준다(~13ms). 클라이언트에서 따로 계산하면 랩에서 본 것과 빌드
결과가 갈라지고, 그 순간 도구를 믿을 수 없게 된다.

### 실제 브랜드 색 입히기

브랜드가 주는 건 보통 "메인 색 한 개"인데 토큰이 필요로 하는 건 11단계다. 단계를
손으로 찍으면 명도 간격이 기존 램프와 어긋나 accent만 바꿨는데 화면 전체의 리듬이 깨진다.
그래서 **기존 램프의 명도·채도 곡선을 빌려 쓰고 색상만 갈아끼운다**(OKLCH).

랩에서: `브랜드 색에서 램프 만들기` → 헥스 붙여넣기 → `램프 만들기` → 저장.
`accent에 바로 배정`을 켜두면 버튼·링크·포커스링·선택 행이 한 번에 따라온다.

명령줄에서도 같은 생성기를 쓴다:

```bash
npm run ramp -- '#1b62d4'          # 기준 blue, 결과 JSON을 stdout으로
npm run ramp -- '#1b62d4' orange   # 기준 램프를 지정
```

브랜드 색은 **어느 한 단계에 그대로 들어간다**(기본은 명도가 가장 가까운 단계).
가이드의 헥스가 화면 어디에도 없으면 "우리 색이 아니다"라는 말을 듣게 되기 때문이다.
생성기는 신뢰 시험을 통과했다 — `blue.600` 하나로 blue 램프를 되만들면 원본과
최대 OKLab 거리 0.0012(사실상 동일)다.

**재질을 새로 만들기 전에 중복을 확인한다.** 생성기가 기존 재질과의 거리를 먼저 찍는다 —
색상각과 채도비를 둘 다 본다(`slate`와 `blue`는 색상각이 6°지만 채도가 0.037 대 0.215라
전혀 다른 색이므로 겹쳤다고 보지 않는다). 겹치지 않을 때는 색상환 어디에 앉는지도 알려준다.

```
$ npm run ramp -- '#2f8ede'
기존 재질과의 거리 (각 재질의 채도가 가장 높은 단계 기준):
  azure     색상각   0°  채도비 0.98  ← 겹칩니다
  blue      색상각  16°  채도비 0.68  ← 겹칩니다

⚠ azure, blue 와 색상각·채도가 모두 가깝습니다.
  새 재질을 만들기 전에, 기존 재질을 ramp에 배정하는 것으로 끝나지 않는지 확인하세요.
```

막지는 않는다 — 판단은 사람이 한다. 재질이 늘수록 "비슷한 게 이미 있나"를 알기 어려워지는
것이 palette가 커질 때의 유일한 실질 비용이다(CSS로 나가지 않으므로 제품 쪽 비용은 0이다).

나중에 실제 값이 정해지면 바꿀 곳은 두 군데뿐이다:
`primitive/color.json` 의 `palette.azure`(생성기가 씀)와
`brand/default.json` 의 `ramp.accent` 한 줄.

**저장은 규칙 1~6을 모두 통과해야 한다.** 하나라도 어기면 아무 파일도 쓰지 않고 위반
내용을 그대로 보여준다 — 예를 들어 색 키를 추가하고 다크를 빼먹으면 규칙 4가 막는다.

랩은 개발 서버에서만 동작한다. 배포된 스토리북에서는 읽기 전용 안내가 뜬다.

## 스토리 작성 규칙

- 컴포넌트 옆에 `<이름>.stories.tsx`. 계약 린트가 스토리도 검사하므로 스토리 안 레이아웃도 계약 토큰만 쓴다.
- 컴포넌트마다 **상태 매트릭스 스토리**(intent × size × disabled/invalid…)를 하나 둔다. 아키타입을
  바꿨을 때 모든 칸이 같이 움직이는지 보는 용도다. 오버레이는 `open` 고정 스토리를 하나 더 둔다(스냅샷용).
- 툴바 세 축은 `contract.json`의 `axes`에서 읽는다. 브랜드·아키타입을 추가하면 툴바가 따라온다.

## 알려진 한계

- **아키타입이 아직 토큰 delta뿐이다.** 문서상 아키타입은 organism 변형, 레이아웃
  blueprint, 인터랙션 정책까지 포함해야 하는데, 그건 ④층이 생긴 뒤에 붙는다.
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
