# 에이전트 상시 규칙

이 파일은 **항상 컨텍스트에 있어야 한다.** 컴포넌트 정보는 필요할 때 찾아보면 되지만,
아래 규칙은 찾아보는 대상이 아니라 전제다.

에이전트가 화면을 망치는 주된 방식은 버튼을 틀리게 쓰는 게 아니라, 여백·글자·색의
기반을 자기 가정으로 채우는 것이다. 컴포넌트 검색은 온디맨드라 "카드 만들어줘"라고
하면 카드와 버튼 정보만 돌아오고, 나머지는 LLM이 학습 데이터에서 본 관례로 메운다.
그래서 기반 지식은 상시 규칙으로 둔다.

---

## 1. 값을 직접 쓰지 않는다

`h-9`, `p-4`, `text-sm`, `bg-blue-500`, `rounded-lg`, `gap-2` — **이런 클래스는 존재하지 않는다.**
Tailwind 기본 테마를 비웠기 때문이다. 쓸 수 있는 건 계약 토큰에서 나온 것뿐이다.

| 하고 싶은 것 | 쓸 것 |
|---|---|
| 컨트롤 높이 | `h-control-sm` `h-control-md` `h-control-lg` |
| 안쪽 여백 | `p-inset-xs` … `p-inset-xl` (`px-`, `py-` 동일) |
| 세로 간격 | `gap-stack-xs` … `gap-stack-xl` |
| 가로 간격 | `gap-inline-xs` … `gap-inline-lg` |
| 큰 덩어리 사이 | `gap-section-sm` `gap-section-md` `gap-section-lg` |
| 모서리 | `rounded-control` `rounded-surface` `rounded-overlay` `rounded-pill` |
| 글자 크기 | `text-caption` `text-body` `text-body-lg` `text-heading-sm/md/lg` `text-display` |
| 줄 간격 | `leading-tight` `leading-normal` `leading-ui` |
| 면 | `bg-surface-base/subtle/sunken/raised/overlay/hover/selected` |
| 글자·아이콘 색 | `text-fg-default/muted/subtle/on-accent/link/disabled` |
| 테두리 색 | `border-border-default/subtle/strong/focus` |
| 테두리 두께 | `border-width-default` `border-width-strong` — `border`(1px 고정)를 쓰지 않는다 |
| 그림자 | `shadow-control`(컨트롤) `shadow-raised` `shadow-overlay` `shadow-modal` |
| 아이콘 크기 | `size-icon-sm/md/lg` |
| 겹침 순서 | `z-sticky` `z-overlay` `z-modal` `z-popover` `z-toast` |

전체 목록: `packages/tokens/dist/contract.json` (154개)

**계약에 없는 값이 정말 필요하면 클래스를 지어내지 말고 멈춰서 물어본다.**
토큰을 추가하는 건 사람의 결정이다. `npm run lint:contract`가 어차피 빌드를 막는다.

## 1-1. 클래스를 보간으로 만들지 않는다

```tsx
// ✗ Tailwind가 생성하지 못한다 — 화면에서 스타일이 조용히 빠지고 계약 린트도 잡을 수 없다
className={`bg-status-${type}-subtle`}

// ✓ 룩업 맵. 이 저장소 전체가 이 방식이다 (button.tsx의 INTENT, toast.tsx의 TYPE …)
const TONE = { info: 'bg-status-info-subtle', danger: 'bg-status-danger-subtle' };
className={TONE[type]}
```

Tailwind는 소스를 **문자열로** 훑는다. 완성된 클래스 이름이 소스에 없으면 CSS도 없다.
린트는 보간에 붙은 조각을 검증할 수 없으므로 이건 사람이 지켜야 하는 규약이다.

## 2. px를 박지 않는다

특히 높이·여백·글자 크기. 이것들은 아키타입이 통째로 바꾸는 값이다. 한 군데라도
px를 박으면 `workbench`로 바꿨을 때 그 부분만 안 따라와서 화면이 어긋난다.

예외는 레이아웃 폭(`max-w-[560px]` 같은 것)이다. 이건 밀도가 아니라 가독성 문제라
아키타입과 무관하다.

## 3. 색은 역할로 고른다

`palette.*`(재질)와 `ramp.*`(램프)는 CSS에 존재하지 않는다 — `bg-slate-900`, `bg-ramp-neutral-900` 같은
클래스는 없다. 컴포넌트는 항상 2층 이름(`bg-surface-*`, `text-fg-*`)만 쓴다. 어느 브랜드에서
그 이름이 무슨 색이 되는지는 컴포넌트가 알 필요가 없고, 알려고 해서도 안 된다.

`text-fg-muted`는 "회색"이 아니라 "본문보다 덜 중요한 글자"다. 다크 모드에서는
밝은 회색이 된다. 회색을 원해서 고르면 다크에서 깨진다.

- 파괴적 동작 → `intent="destructive"`. 빨강을 직접 칠하지 않는다.
- 상태 표시 → `status-{info|success|warning|danger}-{subtle|fg|border|solid}`
- 강조색 면 위의 글자 → `text-fg-on-accent`

## 4. prop 이름은 전 컴포넌트가 공유한다

| prop | 값 | 어디에나 |
|---|---|---|
| `size` | `sm` `md` `lg` | 크기가 있는 모든 것 |
| `intent` | `primary` `secondary` `ghost` `destructive` | 누를 수 있는 것 |
| `disabled` | boolean | |
| `invalid` | boolean | 입력 컨트롤 |
| `required` | boolean | 입력 컨트롤 |

`small`, `compact`, `dense`, `variant="danger"` 같은 다른 이름은 없다.
새 컴포넌트를 만들 때도 이 어휘를 쓴다.

## 5. 빠뜨리기 쉬운 상태를 먼저 처리한다

화면을 만들 때 **정상 경로만 만들지 않는다.** 아래는 리뷰에서 가장 자주 지적되는 누락이다.

- **빈 상태** — 목록·테이블에는 항상. `TableEmpty`가 있다. 다음 행동(버튼)을 함께 준다.
- **에러 상태** — 폼 필드는 `Field`의 `invalid` + `FieldError`. 레이블·설명 연결은
  `Field`가 대신 해주므로 `aria-describedby`를 직접 쓰지 않는다.
- **로딩 상태** — 아직 전용 컴포넌트가 없다. 필요하면 만들기 전에 물어본다.
- **비활성 이유** — 버튼을 `disabled`로 두면 왜 못 누르는지 옆에 적는다.

## 6. 오버레이는 우리 컴포넌트를 쓴다

`Dialog`, `Menu`는 Base UI Portal을 테마 컨테이너 안으로 렌더링하도록 이미 연결돼 있다.
`@base-ui/react`를 직접 import해서 쓰면 **페이지는 다크인데 팝업만 라이트로 뜬다.**
새 오버레이(Popover, Tooltip, Select 등)를 추가할 때는 반드시 `usePortalContainer()`를
Portal의 `container`에 넘긴다.

## 6-1. 합성은 `render`로 한다

`asChild`가 아니다.

```tsx
<DialogTrigger render={<Button intent="primary" />}>열기</DialogTrigger>
<MenuTrigger render={<Button />}>메뉴</MenuTrigger>
```

새로 만드는 컴포넌트를 합성 대상으로 쓰려면 **받은 props를 그대로 펼치고 ref를 전달**해야
한다. `mergeProps`로 다시 감싸면 안 된다 — Base UI가 자기 핸들러를 못 알아보고
메뉴가 열렸다 바로 닫힌다.

## 6-2. 메뉴 제목은 `MenuGroup`의 `label`

```tsx
<MenuGroup label="이슈"><MenuItem>이름 바꾸기</MenuItem></MenuGroup>
```

제목만 단독으로 쓰는 컴포넌트는 없다. Base UI의 GroupLabel이 Group 밖에서
런타임 에러를 내기 때문에 둘을 하나로 묶어뒀다.

## 6-3. 아이콘은 `lib/icons`를 거친다

아이콘 라이브러리를 컴포넌트에서 직접 import하지 않는다.

```tsx
import { ChevronDown } from 'lucide-react';   // ✗
import { ChevronDown } from '../lib/icons';   // ○
```

`lib/icons.ts`는 지금은 재export 한 줄이다. 나중에 프리셋별로 다른 세트가 필요해지면
**이 파일이 아이콘 계약이 된다** — 컴포넌트는 한 줄도 안 바꾸고 여기서 매핑한다.
직접 import가 하나라도 들어가면 그 날 컴포넌트 33개를 다 고쳐야 한다.

아이콘은 `currentColor`로 그려진 것만 쓴다. 색이 박힌 SVG에는 토큰이 닿지 않는다.
크기는 `size-icon-{sm,md,lg}` 계약으로, 컴포넌트 안에서 직접 px를 주지 않는다.

## 7. 파괴적 동작

확인 단계를 둔다. `DialogConfirmFooter`에 `intent="destructive"`.
버튼 순서는 `[취소] [확인]` 고정 — 화면마다 순서가 바뀌면 사용자가 매번 다시 읽어야 한다.

---

## 신뢰 수준

| 해도 되는 것 | 사람에게 물어봐야 하는 것 |
|---|---|
| 기존 컴포넌트로 화면 조립 | 새 토큰 추가 (`semantic/`) |
| 계약 토큰으로 레이아웃 작성 | 새 아키타입·브랜드 추가 |
| 새 컴포넌트를 기존 어휘로 작성 | 헤드리스 라이브러리 교체·추가 |
| `npm run verify` 돌려서 고치기 | 계약 린트를 우회하거나 끄는 것 |

## 프리셋과 토큰을 늘릴 때

- **프리셋 추가** = `archetype/<이름>.json`(치수만) + `presets.json` 한 덩어리. 둘 다 있어야 한다.
- **토큰 키 추가** = `semantic/` 에 역할 이름으로 + 색이면 `mode/dark.json` 에도 + **컴포넌트가 참조하게**.
  세 번째를 빼먹으면 키만 생기고 화면은 그대로다.
- 키 이름에 컴포넌트 이름을 넣지 않는다(`surface.cardHeader` ✗). 그건 3층 소관이고 아직 열지 않았다.
- **재질 이름은 색으로만** 짓는다(`azure` ○ / `brand` ✗ / 제품 이름 ✗). palette는 모든 제품의
  합집합이고, 어느 재질도 특정 제품의 소유가 아니다.
- **장식색은 번호로** 부른다(`color.decorative.1` ○ / `decorative.purple` ✗). 뜻이 없는 색에
  색 이름을 붙이면 브랜드가 배정을 바꾼 순간 이름이 거짓말이 된다.
- 재질을 새로 만들기 전에 `npm run ramp -- '#헥스'` 의 중복 경고를 본다.
- **치수 사다리는 커지는 순서를 지킨다** (`sm < md < lg`, `xs < … < xl`). 같아도 빌드가 막는다(규칙 8).
  아키타입에서 한 단계만 바꿀 때 이웃 단계와 같아지지 않는지 본다. `font.size`는 본문과 제목이
  다른 사다리라 `bodyLg`와 `headingSm`은 같아도 된다.
- 토큰 JSON을 손으로 고쳤으면 `npm run format:tokens` (규칙 7).

## 작업 끝에 반드시

```bash
npm run verify
```

이게 통과하지 않으면 끝난 게 아니다. 특히 계약 린트는 **조용히 사라지는 스타일**을
잡는 장치다 — 클래스 이름이 틀려도 브라우저는 아무 불평을 하지 않는다.
