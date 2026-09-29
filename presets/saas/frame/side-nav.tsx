import * as React from 'react';
import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from '@/components/ui/collapsible';
import { ChevronDown } from '@/lib/ax/icons';
import { cn } from '@/lib/ax/cn';
import { POPUP_GROUP_LABEL } from '@/lib/ax/styles';

/**
 * 왼쪽 메뉴 — **임시.** 부품 패키지에 아직 왼쪽 메뉴가 없어서 기존 모양을 빌려 만든 것이다.
 *   묶음 제목 = 메뉴 그룹 제목(POPUP_GROUP_LABEL), 항목 = 메뉴 항목 크기, 현재 위치 = 선택 면.
 * 진짜 부품이 생기면 이 파일만 바꾼다. 셸·화면은 이 파일의 props 만 안다.
 */
export interface SideNavItem {
  label: string;
  href: string;
  /** 지금 보고 있는 곳 */
  current?: boolean;
  /** 오른쪽 끝 숫자 (처리할 건수 등) */
  count?: number;
}
export interface SideNavGroup {
  label: string;
  items: SideNavItem[];
  /** 접을 수 있는 묶음인가. 기본 true */
  collapsible?: boolean;
}

const ITEM = cn(
  'flex h-control-md items-center gap-inline-sm rounded-control px-inset-sm',
  'text-body leading-ui text-fg-default ax-focus-ring',
  'hover:bg-surface-hover aria-[current=page]:bg-surface-selected aria-[current=page]:font-medium',
);

function Items({ items }: { items: SideNavItem[] }) {
  return (
    <ul className="flex flex-col gap-stack-xs">
      {items.map((it) => (
        <li key={it.href}>
          <a href={it.href} aria-current={it.current ? 'page' : undefined} className={ITEM}>
            <span className="min-w-0 flex-1 truncate">{it.label}</span>
            {it.count != null && <span className="text-caption text-fg-muted">{it.count}</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function SideNav({ groups, label = '주 메뉴' }: { groups: SideNavGroup[]; label?: string }) {
  return (
    <nav aria-label={label} className="flex flex-col gap-stack-lg p-inset-sm">
      {groups.map((g) =>
        g.collapsible === false ? (
          <div key={g.label} className="flex flex-col gap-stack-xs">
            <div className={POPUP_GROUP_LABEL}>{g.label}</div>
            <Items items={g.items} />
          </div>
        ) : (
          <Collapsible key={g.label} defaultOpen className="flex flex-col gap-stack-xs">
            <CollapsibleTrigger
              className={cn(POPUP_GROUP_LABEL, 'group flex w-full items-center justify-between rounded-control ax-focus-ring hover:text-fg-default')}
            >
              {g.label}
              <ChevronDown aria-hidden className="size-icon-sm transition-transform duration-fast group-data-[panel-open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsiblePanel>
              <Items items={g.items} />
            </CollapsiblePanel>
          </Collapsible>
        ),
      )}
    </nav>
  );
}
