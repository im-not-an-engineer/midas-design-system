import * as React from 'react';
import { Menubar as Base } from '@base-ui/react/menubar';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { cn } from '../lib/cn';

/**
 * 내비 가족 — Menubar. 데스크톱 앱식 상단 메뉴 줄(파일 · 편집 · 보기). 안에는 우리 Menu 컴포넌트를 그대로 쓴다.
 *
 *   <Menubar>
 *     <Menu><MenubarTrigger>파일</MenubarTrigger><MenuContent>…</MenuContent></Menu>
 *   </Menubar>
 */
export function Menubar({ className, ...props }: React.ComponentProps<typeof Base>) {
  return <Base className={cn('inline-flex w-fit items-center gap-inline-xs rounded-surface border border-solid border-border-default bg-surface-raised p-inset-xs', className)} {...props} />;
}

/** 메뉴바 안의 트리거. 일반 Button 대신 이걸 쓴다 — 열림 상태(data-popup-open)가 배경으로 표시된다. */
export function MenubarTrigger({ className, ...props }: React.ComponentProps<typeof BaseMenu.Trigger>) {
  return (
    <BaseMenu.Trigger
      className={cn(
        'inline-flex h-control-sm items-center px-inset-sm rounded-control',
        'font-sans text-body leading-ui text-fg-default select-none cursor-pointer',
        'transition-colors duration-fast ease-standard ax-focus-ring',
        'hover:bg-surface-hover data-popup-open:bg-surface-hover data-highlighted:bg-surface-hover',
        'data-disabled:text-fg-disabled data-disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  );
}
