import * as React from 'react';
import { Popover as Base } from '@base-ui/react/popover';
import { cn } from '../lib/cn';
import { usePortalContainer } from '../lib/theme';
import { POPUP_SURFACE, TITLE_DESC_MARGIN } from '../lib/styles';

/**
 * 오버레이 가족 — Popover. 트리거 옆에 붙는 작은 패널(필터, 설정, 도움말). 포커스를 받는다.
 * 읽기만 하는 짧은 글은 Tooltip, 큰 작업은 Dialog.
 */

export const Popover = Base.Root;
/** <PopoverTrigger render={<Button />}>열기</PopoverTrigger> */
export const PopoverTrigger = Base.Trigger;
export const PopoverClose = Base.Close;

export interface PopoverContentProps extends React.ComponentProps<typeof Base.Popup> {
  side?: React.ComponentProps<typeof Base.Positioner>['side'];
  align?: React.ComponentProps<typeof Base.Positioner>['align'];
  sideOffset?: number;
}

export function PopoverContent({ side = 'bottom', align = 'center', sideOffset = 8, className, ...props }: PopoverContentProps) {
  const container = usePortalContainer();
  return (
    <Base.Portal container={container ?? undefined}>
      <Base.Positioner side={side} align={align} sideOffset={sideOffset} className="z-popover">
        <Base.Popup className={cn(POPUP_SURFACE, 'min-w-[200px] max-w-[360px] p-inset-md', className)} {...props} />
      </Base.Positioner>
    </Base.Portal>
  );
}

export function PopoverTitle({ className, ...props }: React.ComponentProps<typeof Base.Title>) {
  return <Base.Title className={cn('text-body font-semibold leading-ui text-fg-default', className)} {...props} />;
}
export function PopoverDescription({ className, ...props }: React.ComponentProps<typeof Base.Description>) {
  return <Base.Description className={cn(TITLE_DESC_MARGIN, 'text-caption leading-normal text-fg-muted', className)} {...props} />;
}
