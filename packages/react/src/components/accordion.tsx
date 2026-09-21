import * as React from 'react';
import { Accordion as Base } from '@base-ui/react/accordion';
import { cn } from '../lib/cn';

/**
 * 내비 가족 — Accordion. 여러 섹션을 접고 펼친다(FAQ, 설정 묶음). 하나만이면 Collapsible.
 *
 *   <Accordion><AccordionItem value="a" title="질문">답변</AccordionItem></Accordion>
 * 제목·트리거·패널을 한 겹으로 접었다 — 에이전트가 Header/Trigger/Panel을 따로 조립하다 순서를 틀리는 걸 막는다.
 */

export const Accordion = ({ className, ...props }: React.ComponentProps<typeof Base.Root>) => (
  <Base.Root className={cn('flex w-full flex-col', className)} {...props} />
);

const Chevron = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden
    className="shrink-0 text-fg-muted transition-transform duration-normal ease-standard group-data-panel-open:rotate-180">
    <path d="M4 6l4 4 4-4" />
  </svg>
);

export interface AccordionItemProps extends Omit<React.ComponentProps<typeof Base.Item>, 'title'> {
  title: React.ReactNode;
}

export function AccordionItem({ title, className, children, ...props }: AccordionItemProps) {
  return (
    <Base.Item className={cn('group border-b border-solid border-border-default', className)} {...props}>
      <Base.Header className="m-0">
        <Base.Trigger
          className={cn(
            'flex w-full items-center justify-between gap-inline-md py-inset-md text-left',
            'font-sans text-body font-medium leading-ui text-fg-default cursor-pointer',
            'ax-focus-ring rounded-control hover:not-data-disabled:text-fg-default',
            'data-disabled:text-fg-disabled data-disabled:cursor-not-allowed',
            '[&_svg]:size-icon-sm',
          )}
        >
          {title}
          <Chevron />
        </Base.Trigger>
      </Base.Header>
      <Base.Panel
        className={cn(
          'h-(--accordion-panel-height) overflow-hidden',
          'transition-[height] duration-normal ease-standard data-starting-style:h-0 data-ending-style:h-0',
        )}
      >
        <div className="pb-inset-md font-sans text-body leading-normal text-fg-muted">{children}</div>
      </Base.Panel>
    </Base.Item>
  );
}
