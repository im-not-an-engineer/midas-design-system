import * as React from 'react';
import { Combobox as Base } from '@base-ui/react/combobox';
import { cn } from '../lib/cn';
import { Check, ChevronDown, X } from '../lib/icons';
import type { Size } from '../lib/types';
import { usePortalContainer } from '../lib/theme';
import { FIELD_CONTROL, FIELD_CONTROL_SIZE, POPUP_SURFACE, POPUP_ITEM, POPUP_ITEM_PICK, POPUP_ITEM_INDENT, POPUP_ITEM_MARKER, POPUP_EMPTY, CHIP, CHIP_SIZE } from '../lib/styles';

/**
 * 폼 컨트롤 가족 — Combobox. 긴 목록에서 타이핑으로 걸러 하나를 고른다.
 * 10개 이하면 Select가 더 낫다. 자유 입력을 허용하려면 Autocomplete.
 *
 * 하나만 고르면 Combobox, 여럿이면 ComboboxMultiple 이다. 부품을 나눈 이유는 Base UI 의
 * Root 가 `multiple` 에 따라 값의 타입을 바꾸기 때문이다 — 하나로 합치면 값이
 * `ComboboxItem | ComboboxItem[]` 이 되어 쓰는 쪽이 매번 어느 쪽인지 따져야 한다.
 */

export interface ComboboxItem {
  value: string;
  label: string;
  disabled?: boolean;
}

/** 입력 오른쪽에 붙는 지우기·열기 버튼. 컨트롤 높이 안에 들어가는 아이콘 급 크기. */
const INLINE_BUTTON = [
    // 20px 정사각에 control 모서리(6px)는 과하다 — 체크박스와 같이 절반을 쓴다.
  'inline-flex shrink-0 items-center justify-center size-icon-lg rounded-[calc(var(--radius-control)/2)]',
  'text-fg-muted cursor-pointer transition-colors duration-fast ease-standard',
  'hover:bg-surface-hover hover:text-fg-default',
  'data-disabled:pointer-events-none data-disabled:text-fg-disabled',
  '[&_svg]:size-icon-sm',
].join(' ');

export interface ComboboxProps
  extends Omit<React.ComponentProps<typeof Base.Root<ComboboxItem, false>>, 'items' | 'children' | 'multiple'> {
  items: ComboboxItem[];
  placeholder?: string;
  size?: Size;
  /** 필터 결과가 없을 때 문구. */
  emptyText?: React.ReactNode;
  className?: string;
}

/**
 * 오른쪽 버튼 묶음이 앉는 자리와, 글자가 거기 닿지 않게 비워 둘 폭.
 * 컨트롤의 좌우 여백(FIELD_CONTROL_SIZE)과 눈으로 맞춘다 — lg 만 여백이 12px 인데
 * 버튼을 4px 에 붙이면 왼쪽 12 / 오른쪽 7 로 한쪽으로 쏠려 보인다.
 */
const TRAILING: Record<Size, { pos: string; pad: string }> = {
  sm: { pos: 'right-inset-xs', pad: 'pr-[calc(var(--spacing-icon-lg)*2+var(--spacing-inset-sm))]' },
  md: { pos: 'right-inset-xs', pad: 'pr-[calc(var(--spacing-icon-lg)*2+var(--spacing-inset-sm))]' },
  lg: { pos: 'right-inset-sm', pad: 'pr-[calc(var(--spacing-icon-lg)*2+var(--spacing-inset-lg))]' },
};

export function Combobox({ items, placeholder = '검색…', size = 'md', emptyText = '일치하는 항목이 없습니다', className, ...props }: ComboboxProps) {
  const container = usePortalContainer();
  return (
    <Base.Root items={items} {...props}>
      <Base.InputGroup className={cn('relative flex w-full items-center', className)}>
        <Base.Input
          placeholder={placeholder}
          data-size={size}
          className={cn(FIELD_CONTROL, FIELD_CONTROL_SIZE[size], TRAILING[size].pad)}
        />
        <div className={cn('absolute flex items-center', TRAILING[size].pos)}>
          <Base.Clear aria-label="선택 지우기" className={INLINE_BUTTON}>
            <X aria-hidden />
          </Base.Clear>
          <Base.Trigger aria-label="목록 열기" className={INLINE_BUTTON}>
            <ChevronDown aria-hidden />
          </Base.Trigger>
        </div>
      </Base.InputGroup>
      <Popup container={container} emptyText={emptyText} />
    </Base.Root>
  );
}

/**
 * 목록 팝업. 단일·복수가 똑같이 쓴다 — 다르게 적으면 반드시 갈라진다.
 *
 * `anchor` 는 복수 선택에서만 준다. 기본 기준점은 입력칸인데, 복수에서는 입력칸이
 * 알약 옆에 끼어 있는 좁은 칸이라 알약이 늘수록 목록이 같이 좁아진다. 상자 전체를
 * 기준점으로 잡아야 목록 너비가 칸 너비와 같게 유지된다.
 */
function Popup({ container, emptyText, anchor }: { container: HTMLElement | null; emptyText: React.ReactNode; anchor?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <Base.Portal container={container ?? undefined}>
      <Base.Positioner anchor={anchor} sideOffset={4} className="z-popover">
        <Base.Popup className={cn(POPUP_SURFACE, 'w-(--anchor-width) max-h-[min(var(--available-height),320px)] overflow-y-auto')}>
          <Base.Empty className={POPUP_EMPTY}>{emptyText}</Base.Empty>
          <Base.List>
            {(item: ComboboxItem) => (
              <Base.Item key={item.value} value={item} disabled={item.disabled} className={cn(POPUP_ITEM, POPUP_ITEM_PICK, POPUP_ITEM_INDENT, 'data-selected:font-medium')}>
                <Base.ItemIndicator className={POPUP_ITEM_MARKER}>
                  <Check aria-hidden />
                </Base.ItemIndicator>
                <span className="truncate">{item.label}</span>
              </Base.Item>
            )}
          </Base.List>
        </Base.Popup>
      </Base.Positioner>
    </Base.Portal>
  );
}

/**
 * 고른 것이 알약으로 쌓이는 입력칸. 알약 생김새는 Chip 과 같은 `CHIP` 을 쓴다 —
 * 같은 화면에 두 종류의 알약이 있으면 사용자는 둘을 같은 것으로 읽는다.
 *
 * **한 줄로 고정한다.** 알약이 늘 때 칸이 아래로 자라면 그 아래 있던 것들이 밀려
 * 내려가 폼 전체가 들썩인다. 넘치는 것은 `+N` 하나로 접고(`maxVisible`), 이름이 길면
 * 남은 알약 안에서 말줄임으로 줄어든다.
 */
const CHIP_FIELD = 'flex w-full flex-nowrap items-center gap-inline-sm overflow-hidden';

/** 알약 안의 지우기 단추. 알약 높이 안에 들어가야 해서 아이콘 급으로 작다. */
const CHIP_REMOVE = [
  'inline-flex shrink-0 items-center justify-center size-icon-sm rounded-pill',
  '-mr-inset-xs cursor-pointer text-fg-muted',
  'transition-colors duration-fast ease-standard ax-focus-ring',
  'hover:bg-surface-hover hover:text-fg-default',
  '[&_svg]:size-[calc(var(--spacing-icon-sm)*0.75)]',
].join(' ');

export interface ComboboxMultipleProps
  extends Omit<React.ComponentProps<typeof Base.Root<ComboboxItem, true>>, 'items' | 'children' | 'multiple'> {
  items: ComboboxItem[];
  placeholder?: string;
  size?: Size;
  emptyText?: React.ReactNode;
  /**
   * 한 줄에 설 수 있는 **자리 수**. 알약을 몇 개까지 펼치느냐가 아니라, 알약과 `+N` 이
   * 함께 나눠 쓰는 칸 수다.
   *
   *   고른 것이 자리 수 이하  →  전부 펼친다
   *   자리 수를 넘으면        →  한 자리를 `+N` 에 내주고 나머지만 펼친다
   *
   * 이렇게 세는 이유: `+N` 도 자리를 차지한다. "알약 3개까지"로 세면 3개 + `+N` 이
   * 되어 넷이 서고, 그러면 서로 밀어내 이름이 한 글자씩만 남는다.
   *
   * 기본 3 은 **320px 칸에서 세 글자 이름 셋이 온전히 서는 수**다(실측: 74×3 + 검색칸
   * 64 + 간격 12 = 298, 속폭 302). 넷을 고르면 2개 + `+2` 가 되어 270 으로 여유가 생긴다.
   */
  maxVisible?: number;
  className?: string;
}

export function ComboboxMultiple({
  items,
  placeholder = '검색…',
  size = 'md',
  emptyText = '일치하는 항목이 없습니다',
  maxVisible = 3,
  className,
  ...props
}: ComboboxMultipleProps) {
  const container = usePortalContainer();
  // 목록이 기준 삼을 상자. 안쪽 입력칸이 아니라 이 상자에 맞춰야 너비가 안 흔들린다.
  const field = React.useRef<HTMLDivElement>(null);
  return (
    <Base.Root items={items} multiple {...props}>
      <Base.Chips ref={field} className={cn(FIELD_CONTROL, FIELD_CONTROL_SIZE[size], CHIP_FIELD, className)}>
        <Base.Value>
          {(selected: ComboboxItem[]) => {
            // `+N` 도 한 자리를 차지한다. 넘칠 때만 그 자리를 떼어준다.
            const overflow = selected.length > maxVisible;
            const shown = overflow ? selected.slice(0, maxVisible - 1) : selected;
            return (
            <>
              {shown.map((item) => (
                // CHIP 은 '줄어들지 마라'(shrink-0)가 기본이다. 여기서만 뒤집는다 —
                // 이름이 길면 알약이 줄어들어 말줄임으로 들어가야 한 줄에 남는다.
                // min-w-0 은 그 줄어듦이 글자까지 닿게 한다(없으면 글자 너비에서 멈춘다).
                <Base.Chip key={item.value} className={cn(CHIP, CHIP_SIZE.sm, 'shrink min-w-0 cursor-default data-highlighted:border-border-focus')}>
                  <span className="truncate">{item.label}</span>
                  <Base.ChipRemove aria-label={`${item.label} 지우기`} className={CHIP_REMOVE}>
                    <X aria-hidden />
                  </Base.ChipRemove>
                </Base.Chip>
              ))}
              {/* 접힌 개수. 누르는 것이 아니라 읽는 것이라 알약 모양만 빌린다 — 지우기
                  단추도 없다. 목록을 열면 무엇이 접혔는지 체크 표시로 보인다. */}
              {overflow && (
                <span className={cn(CHIP, CHIP_SIZE.sm, 'cursor-default text-fg-muted')}>
                  +{selected.length - shown.length}
                </span>
              )}
            </>
            );
          }}
        </Base.Value>
        {/* 알약 줄에 섞여 서는 입력칸이라 테두리·면·높이를 전부 지운다 — 상자는 바깥이 갖는다.
            안내 글자는 알약이 하나라도 있으면 감춘다. Base.Value 가 자기 엘리먼트를 안 그리므로
            알약이 없을 때만 이 입력칸이 첫 자식이 된다 — 그걸 조건으로 쓴다. */}
        <Base.Input
          placeholder={placeholder}
          data-size={size}
          className={cn(
            // 64px 은 한글 네 글자쯤 보이는 폭이다. 80 이었을 때는 320px 칸에 이름 셋이
            // 12px 모자라 잘렸다 — 검색은 보통 한두 글자 치고 고르는 동작이라 여기를 줄였다.
            'min-w-[64px] flex-1 border-none bg-transparent p-0',
            'font-sans text-body leading-ui text-field-fg-default outline-none',
            'placeholder:text-field-fg-placeholder',
            '[&:not(:first-child)]:placeholder:text-transparent',
          )}
        />
      </Base.Chips>
      <Popup container={container} emptyText={emptyText} anchor={field} />
    </Base.Root>
  );
}
