import * as React from 'react';
import { Select as Base } from '@base-ui/react/select';
import { cn } from '../lib/cn';
import { Check, ChevronDown } from '../lib/icons';
import type { Size } from '../lib/types';
import { usePortalContainer } from '../lib/theme';
import { FIELD_CONTROL, FIELD_CONTROL_SIZE, POPUP_SURFACE, POPUP_ITEM, POPUP_GROUP_LABEL, POPUP_SEPARATOR } from '../lib/styles';

/**
 * 폼 컨트롤 가족 — Select. 정해진 목록에서 하나를 고른다.
 * 검색이 필요하면 Combobox, 자유 입력 + 제안이면 Autocomplete.
 *
 * 트리거는 Input과 같은 field 스타일, 팝업은 Menu와 같은 popup 스타일을 쓴다 — 새 토큰 없음.
 * 팝업은 네이티브 select처럼 트리거 위에 겹치지 않고 아래로 연다(웹 앱 관례).
 */

export interface SelectItem<V extends string = string> {
  value: V;
  label: React.ReactNode;
  disabled?: boolean;
}

// ── 조립용 파트 ─────────────────────────────────────────────────────────────
export const SelectRoot = Base.Root;
export const SelectGroup = Base.Group;

export function SelectTrigger({ size = 'md', className, children, ...props }: React.ComponentProps<typeof Base.Trigger> & { size?: Size }) {
  return (
    <Base.Trigger
      data-size={size}
      className={cn(FIELD_CONTROL, FIELD_CONTROL_SIZE[size], 'inline-flex items-center justify-between gap-inline-sm text-left cursor-pointer', className)}
      {...props}
    >
      {children}
      <Base.Icon className="flex shrink-0 text-fg-muted [&_svg]:size-icon-sm">
        <ChevronDown aria-hidden />
      </Base.Icon>
    </Base.Trigger>
  );
}

export function SelectValue(props: React.ComponentProps<typeof Base.Value>) {
  return <Base.Value className="truncate" {...props} />;
}

export function SelectContent({ className, children, ...props }: React.ComponentProps<typeof Base.Popup>) {
  const container = usePortalContainer();
  return (
    <Base.Portal container={container ?? undefined}>
      <Base.Positioner sideOffset={4} alignItemWithTrigger={false} className="z-popover">
        <Base.Popup className={cn(POPUP_SURFACE, 'min-w-(--anchor-width)', className)} {...props}>
          <Base.List>{children}</Base.List>
        </Base.Popup>
      </Base.Positioner>
    </Base.Portal>
  );
}

export function SelectOption({ className, children, ...props }: React.ComponentProps<typeof Base.Item>) {
  return (
    <Base.Item className={cn(POPUP_ITEM, 'pl-inset-lg data-selected:font-medium', className)} {...props}>
      <Base.ItemIndicator className="absolute left-inset-xs flex size-icon-sm items-center justify-center">
        <Check aria-hidden />
      </Base.ItemIndicator>
      <Base.ItemText className="truncate">{children}</Base.ItemText>
    </Base.Item>
  );
}

export function SelectGroupLabel({ className, ...props }: React.ComponentProps<typeof Base.GroupLabel>) {
  return <Base.GroupLabel className={cn(POPUP_GROUP_LABEL, className)} {...props} />;
}

export function SelectSeparator({ className, ...props }: React.ComponentProps<typeof Base.Separator>) {
  return <Base.Separator className={cn(POPUP_SEPARATOR, className)} {...props} />;
}

// ── 바로 쓰는 조립품 ─────────────────────────────────────────────────────────
export interface SelectProps<V extends string = string>
  extends Omit<React.ComponentProps<typeof Base.Root<V>>, 'items' | 'children' | 'multiple'> {
  items: SelectItem<V>[];
  placeholder?: string;
  size?: Size;
  className?: string;
}

/** 목록에서 하나 고르기. 그룹·구분선이 필요하면 SelectRoot + 파트로 조립한다. */
export function Select<V extends string = string>({ items, placeholder = '선택', size = 'md', className, ...props }: SelectProps<V>) {
  return (
    <Base.Root items={items} {...props}>
      <SelectTrigger size={size} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((it) => (
          <SelectOption key={it.value} value={it.value} disabled={it.disabled}>
            {it.label}
          </SelectOption>
        ))}
      </SelectContent>
    </Base.Root>
  );
}
