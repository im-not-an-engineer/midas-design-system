import * as React from 'react';
import { Combobox as Base } from '@base-ui/react/combobox';
import { cn } from '../lib/cn';
import { Check, ChevronDown, X } from '../lib/icons';
import type { Size } from '../lib/types';
import { usePortalContainer } from '../lib/theme';
import { FIELD_CONTROL, FIELD_CONTROL_SIZE, POPUP_SURFACE, POPUP_ITEM, POPUP_ITEM_PICK, POPUP_ITEM_INDENT, POPUP_ITEM_MARKER, POPUP_EMPTY } from '../lib/styles';

/**
 * 폼 컨트롤 가족 — Combobox. 긴 목록에서 타이핑으로 걸러 하나를 고른다.
 * 10개 이하면 Select가 더 낫다. 자유 입력을 허용하려면 Autocomplete.
 *
 * v1은 단일 선택만 지원한다. 다중 선택(Chips)은 필요해질 때 붙인다.
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

export function Combobox({ items, placeholder = '검색…', size = 'md', emptyText = '일치하는 항목이 없습니다', className, ...props }: ComboboxProps) {
  const container = usePortalContainer();
  return (
    <Base.Root items={items} {...props}>
      <Base.InputGroup className={cn('relative flex w-full items-center', className)}>
        <Base.Input
          placeholder={placeholder}
          data-size={size}
          className={cn(FIELD_CONTROL, FIELD_CONTROL_SIZE[size], 'pr-[calc(var(--spacing-icon-lg)*2+var(--spacing-inset-sm))]')}
        />
        <div className="absolute right-inset-xs flex items-center">
          <Base.Clear aria-label="선택 지우기" className={INLINE_BUTTON}>
            <X aria-hidden />
          </Base.Clear>
          <Base.Trigger aria-label="목록 열기" className={INLINE_BUTTON}>
            <ChevronDown aria-hidden />
          </Base.Trigger>
        </div>
      </Base.InputGroup>
      <Base.Portal container={container ?? undefined}>
        <Base.Positioner sideOffset={4} className="z-popover">
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
    </Base.Root>
  );
}
