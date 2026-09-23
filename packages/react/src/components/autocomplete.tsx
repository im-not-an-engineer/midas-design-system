import * as React from 'react';
import { Autocomplete as Base } from '@base-ui/react/autocomplete';
import { cn } from '../lib/cn';
import type { Size } from '../lib/types';
import { usePortalContainer } from '../lib/theme';
import { FIELD_CONTROL, FIELD_CONTROL_SIZE, POPUP_SURFACE, POPUP_ITEM, POPUP_ITEM_PICK, POPUP_EMPTY } from '../lib/styles';

/**
 * 폼 컨트롤 가족 — Autocomplete. 자유 입력이되 제안 목록을 보여준다(검색창, 태그 입력).
 * 값이 반드시 목록 안에 있어야 하면 Combobox.
 */

export interface AutocompleteProps
  extends Omit<React.ComponentProps<typeof Base.Root>, 'items' | 'children'> {
  /** 제안 목록. 문자열 배열. */
  items: string[];
  placeholder?: string;
  size?: Size;
  emptyText?: React.ReactNode;
  className?: string;
}

export function Autocomplete({ items, placeholder = '검색…', size = 'md', emptyText = '제안이 없습니다', className, ...props }: AutocompleteProps) {
  const container = usePortalContainer();
  return (
    <Base.Root items={items} {...props}>
      <Base.Input placeholder={placeholder} data-size={size} className={cn(FIELD_CONTROL, FIELD_CONTROL_SIZE[size], className)} />
      <Base.Portal container={container ?? undefined}>
        <Base.Positioner sideOffset={4} className="z-popover">
          <Base.Popup className={cn(POPUP_SURFACE, 'w-(--anchor-width) max-h-[min(var(--available-height),320px)] overflow-y-auto')}>
            <Base.Empty className={POPUP_EMPTY}>{emptyText}</Base.Empty>
            <Base.List>
              {(item: string) => (
                <Base.Item key={item} value={item} className={cn(POPUP_ITEM, POPUP_ITEM_PICK)}>
                  <span className="truncate">{item}</span>
                </Base.Item>
              )}
            </Base.List>
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}
