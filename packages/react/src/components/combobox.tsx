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
 * 알약이 늘면 입력칸이 아래로 자란다. 높이를 고정하면 세 개째부터 글자가 잘린다.
 */
const CHIP_FIELD = [
  'flex w-full flex-wrap items-center gap-inline-sm',
  'min-h-control-md h-auto py-inset-xs',
].join(' ');

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
  className?: string;
}

export function ComboboxMultiple({
  items,
  placeholder = '검색…',
  size = 'md',
  emptyText = '일치하는 항목이 없습니다',
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
          {(selected: ComboboxItem[]) =>
            selected.map((item) => (
              <Base.Chip key={item.value} className={cn(CHIP, CHIP_SIZE.sm, 'cursor-default data-highlighted:border-border-focus')}>
                {item.label}
                <Base.ChipRemove aria-label={`${item.label} 지우기`} className={CHIP_REMOVE}>
                  <X aria-hidden />
                </Base.ChipRemove>
              </Base.Chip>
            ))
          }
        </Base.Value>
        {/* 알약 줄에 섞여 서는 입력칸이라 테두리·면·높이를 전부 지운다 — 상자는 바깥이 갖는다. */}
        <Base.Input
          placeholder={placeholder}
          data-size={size}
          className="min-w-[80px] flex-1 border-none bg-transparent p-0 font-sans text-body leading-ui text-field-fg-default outline-none placeholder:text-field-fg-placeholder"
        />
      </Base.Chips>
      <Popup container={container} emptyText={emptyText} anchor={field} />
    </Base.Root>
  );
}
