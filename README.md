# AX 디자인시스템

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
현재 계약 토큰 145개 — 전체 목록은 `packages/tokens/dist/contract.json`.

**램프가 있는 이유.** 시맨틱이 `palette.slate.900`을 직접 가리키면, 그레이를 웜그레이로
바꾸려는 브랜드는 slate를 참조하는 80여 개 키를 전부 다시 적어야 한다 — 그건 테마가
아니라 시맨틱 복제다. 시맨틱은 `ramp.neutral.900`(역할)만 보고, **어느 재질이 neutral인지는
브랜드가 한 줄로 정한다.** 램프는 6개: `neutral` `accent` `info` `success` `warning` `danger`.
`info`가 `accent`와 별개인 이유는 브랜드색이 주황이어도 정보 알림은 파랑이어야 하기 때문이다.

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

## 규칙 여섯 가지 (빌드가 강제한다)

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

## 토큰 고치는 법

| 하고 싶은 것 | 고칠 파일 |
|---|---|
| 색·간격 원재료 추가 | `packages/tokens/src/primitive/` |
| 계약에 키 추가·삭제 | `packages/tokens/src/semantic/` |
| 새 브랜드 | `packages/tokens/src/brand/<이름>.json` (시맨틱을 덮었으면 `<이름>.dark.json`도) |
| 새 아키타입 | `packages/tokens/src/archetype/<이름>.json` |
| 새 재질(색 램프) | `packages/tokens/src/primitive/color.json` — 그레이는 단계 집합(0~1000)이 slate와 같아야 한다 |

고친 뒤 `npm run build:tokens`. `dist/`는 생성물이므로 직접 고치지 않는다.

## 스토리 작성 규칙

- 컴포넌트 옆에 `<이름>.stories.tsx`. 계약 린트가 스토리도 검사하므로 스토리 안 레이아웃도 계약 토큰만 쓴다.
- 컴포넌트마다 **상태 매트릭스 스토리**(intent × size × disabled/invalid…)를 하나 둔다. 아키타입을
  바꿨을 때 모든 칸이 같이 움직이는지 보는 용도다. 오버레이는 `open` 고정 스토리를 하나 더 둔다(스냅샷용).
- 툴바 세 축은 `contract.json`의 `axes`에서 읽는다. 브랜드·아키타입을 추가하면 툴바가 따라온다.

## 알려진 한계

- **아키타입이 아직 토큰 delta뿐이다.** 문서상 아키타입은 organism 변형, 레이아웃
  blueprint, 인터랙션 정책까지 포함해야 하는데, 그건 ④층이 생긴 뒤에 붙는다.
- **컴포넌트가 5개뿐이다.** 의도된 것이다 — 레퍼런스 구현을 사람이 직접 써서
  나머지를 LLM으로 확장할 때의 입력으로 삼는다.
- **복합 컴포넌트가 없다.** 가상화 테이블, 칸반, 날짜 선택 등은 TanStack Table,
  dnd-kit 같은 전문 라이브러리를 이 토큰으로 감싸는 '래핑 층'으로 붙인다.
  추가 작업의 크기는 베이스 선택보다 이 래핑 층 설계에 좌우된다.
- **헤드리스는 Base UI다.** Radix 제작자들이 만든 후속 라이브러리로, v1.0이 2025-12-11에
  나왔고 이후 매달 마이너 릴리스가 이어지고 있다. Radix보다 컴포넌트 표면이 넓고
  (Combobox, Select, Toast, NumberField, ScrollArea, Drawer 등) prop API가 일관적이며,
  패키지에 LLM용 마크다운 문서를 동봉해 ⑤층에 바로 쓸 수 있다.
  헤드리스에 직접 의존하는 지점은 `packages/react/src/components/` 안에 한정돼 있다.
