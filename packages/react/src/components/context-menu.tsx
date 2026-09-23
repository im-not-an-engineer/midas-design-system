import * as React from 'react';
import { ContextMenu as Base } from '@base-ui/react/context-menu';
import { cn } from '../lib/cn';
import { Check, ChevronRight, CircleSmall } from '../lib/icons';
import { usePortalContainer } from '../lib/theme';
import { POPUP_SURFACE, POPUP_ITEM, POPUP_ITEM_PICK, POPUP_ITEM_INDENT, POPUP_ITEM_MARKER, POPUP_GROUP_LABEL, POPUP_SEPARATOR } from '../lib/styles';

/**
 * 오버레이 가족 — ContextMenu. 우클릭·길게 누르기로 커서 위치에 뜨는 메뉴. 파트·스타일은 Menu와 같다.
 * 트리거는 버튼이 아니라 '영역'이다 — 테이블 행, 카드, 캔버스.
 */

export const ContextMenu = Base.Root;
export const ContextMenuTrigger = Base.Trigger;
export const ContextMenuSub = Base.SubmenuRoot;
export const ContextMenuRadioGroup = Base.RadioGroup;

export function ContextMenuContent({ className, ...props }: React.ComponentProps<typeof Base.Popup>) {
  const container = usePortalContainer();
  return (
    <Base.Portal container={container ?? undefined}>
      <Base.Positioner className="z-popover">
        <Base.Popup className={cn(POPUP_SURFACE, className)} {...props} />
      </Base.Positioner>
    </Base.Portal>
  );
}

export function ContextMenuItem({ className, destructive, ...props }: React.ComponentProps<typeof Base.Item> & { destructive?: boolean }) {
  return <Base.Item className={cn(POPUP_ITEM, destructive && 'text-status-danger-fg data-highlighted:bg-status-danger-subtle', className)} {...props} />;
}

export function ContextMenuGroup({ label, children, ...props }: React.ComponentProps<typeof Base.Group> & { label?: React.ReactNode }) {
  return (
    <Base.Group {...props}>
      {label != null && <Base.GroupLabel className={POPUP_GROUP_LABEL}>{label}</Base.GroupLabel>}
      {children}
    </Base.Group>
  );
}

export function ContextMenuSeparator({ className, ...props }: React.ComponentProps<typeof Base.Separator>) {
  return <Base.Separator className={cn(POPUP_SEPARATOR, className)} {...props} />;
}

export function ContextMenuCheckboxItem({ className, children, ...props }: React.ComponentProps<typeof Base.CheckboxItem>) {
  return (
    <Base.CheckboxItem className={cn(POPUP_ITEM, POPUP_ITEM_PICK, POPUP_ITEM_INDENT, className)} {...props}>
      <span className={POPUP_ITEM_MARKER}><Base.CheckboxItemIndicator aria-hidden><Check /></Base.CheckboxItemIndicator></span>
      {children}
    </Base.CheckboxItem>
  );
}

export function ContextMenuRadioItem({ className, children, ...props }: React.ComponentProps<typeof Base.RadioItem>) {
  return (
    <Base.RadioItem className={cn(POPUP_ITEM, POPUP_ITEM_PICK, POPUP_ITEM_INDENT, className)} {...props}>
      <span className={POPUP_ITEM_MARKER}><Base.RadioItemIndicator aria-hidden><CircleSmall fill="currentColor" /></Base.RadioItemIndicator></span>
      {children}
    </Base.RadioItem>
  );
}

export function ContextMenuSubTrigger({ className, children, ...props }: React.ComponentProps<typeof Base.SubmenuTrigger>) {
  return (
    <Base.SubmenuTrigger className={cn(POPUP_ITEM, 'justify-between', className)} {...props}>
      {children}<ChevronRight aria-hidden className="text-fg-subtle" />
    </Base.SubmenuTrigger>
  );
}

export function ContextMenuSubContent({ className, ...props }: React.ComponentProps<typeof Base.Popup>) {
  const container = usePortalContainer();
  return (
    <Base.Portal container={container ?? undefined}>
      <Base.Positioner className="z-popover" side="inline-end" align="start" sideOffset={2}>
        <Base.Popup className={cn(POPUP_SURFACE, className)} {...props} />
      </Base.Positioner>
    </Base.Portal>
  );
}
