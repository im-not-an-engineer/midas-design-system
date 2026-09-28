import * as React from 'react';
import { Tabs as Base } from '@base-ui/react/tabs';
import { cn } from '../lib/cn';

/**
 * 내비 가족 — Tabs. 같은 층의 뷰를 바꾼다. 페이지 이동이면 NavigationMenu, 접기/펼치기면 Accordion.
 * 밑줄 인디케이터는 Base UI가 주는 --active-tab-left/width로 움직인다 — 탭 개수·너비를 몰라도 된다.
 */

export const Tabs = Base.Root;

export function TabsList({ className, children, ...props }: React.ComponentProps<typeof Base.List>) {
  return (
    <Base.List
      className={cn(
        'relative flex gap-inline-xs',
        // 탭 상자를 선에서 4px 띄운다 — 호버 배경이 선에 닿으면 붙어 보인다.
        // 표시자는 absolute 라 padding box 기준이고, 여백을 줘도 선 위에 그대로 남는다.
        'data-[orientation=horizontal]:border-b data-[orientation=horizontal]:border-solid data-[orientation=horizontal]:border-border-default data-[orientation=horizontal]:pb-inset-xs',
        'data-[orientation=vertical]:flex-col data-[orientation=vertical]:border-r data-[orientation=vertical]:border-solid data-[orientation=vertical]:border-border-default data-[orientation=vertical]:pr-inset-xs',
        className,
      )}
      {...props}
    >
      {children}
      <Base.Indicator
        className={cn(
          'absolute bg-action-primary-bg-default transition-[left,width,top,height] duration-normal ease-standard',
          'data-[orientation=horizontal]:bottom-[-1px] data-[orientation=horizontal]:h-[2px] data-[orientation=horizontal]:left-(--active-tab-left) data-[orientation=horizontal]:w-(--active-tab-width)',
          'data-[orientation=vertical]:right-[-1px] data-[orientation=vertical]:w-[2px] data-[orientation=vertical]:top-(--active-tab-top) data-[orientation=vertical]:h-(--active-tab-height)',
        )}
      />
    </Base.List>
  );
}

export function Tab({ className, ...props }: React.ComponentProps<typeof Base.Tab>) {
  return (
    <Base.Tab
      className={cn(
        'inline-flex h-control-md items-center justify-center gap-inline-md px-inset-md rounded-control',
        'font-sans text-heading-xs font-semibold leading-ui text-fg-muted whitespace-nowrap select-none cursor-pointer',
        'transition-colors duration-fast ease-standard ax-focus-ring',
        'hover:not-data-disabled:text-fg-default data-active:not-data-disabled:text-fg-default',
        'data-disabled:text-fg-disabled data-disabled:cursor-not-allowed',
        '[&_svg]:size-icon-sm',
        className,
      )}
      {...props}
    />
  );
}

export function TabsPanel({ className, ...props }: React.ComponentProps<typeof Base.Panel>) {
  return <Base.Panel className={cn('pt-inset-md font-sans text-body text-fg-default outline-none', className)} {...props} />;
}
