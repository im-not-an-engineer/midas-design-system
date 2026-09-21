import * as React from 'react';
import { Collapsible as Base } from '@base-ui/react/collapsible';
import { cn } from '../lib/cn';

/** 내비 가족 — Collapsible. 영역 하나를 접고 펼친다("고급 옵션 보기"). 트리거는 보통 <CollapsibleTrigger render={<Button intent="ghost" />}>. */
export const Collapsible = Base.Root;
export const CollapsibleTrigger = Base.Trigger;

export function CollapsiblePanel({ className, children, ...props }: React.ComponentProps<typeof Base.Panel>) {
  return (
    <Base.Panel
      className={cn('h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-normal ease-standard data-starting-style:h-0 data-ending-style:h-0', className)}
      {...props}
    >
      <div className="pt-inset-sm">{children}</div>
    </Base.Panel>
  );
}
