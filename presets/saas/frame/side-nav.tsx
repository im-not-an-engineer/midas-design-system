import * as React from 'react';
import { SideNav as Nav, SideNavGroup as Group, SideNavItem as Item } from '@/components/ui/side-nav';

/**
 * 왼쪽 메뉴 — 디자인시스템의 SideNav 를 앱 틀이 쓰는 모양(묶음 배열)으로 잇는 얇은 어댑터.
 * (처음에는 SideNav 부품이 없어 임시로 만들었다. 부품이 생겨 이 파일만 바꿨다 — 셸 · 화면은 그대로다.)
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
}

export function SideNav({ groups, label = '주 메뉴' }: { groups: SideNavGroup[]; label?: string }) {
  return (
    <Nav aria-label={label} className="py-inset-md">
      {groups.map((g) => (
        <Group key={g.label} label={g.label}>
          {g.items.map((it) => (
            <Item key={it.href} href={it.href} active={it.current}>
              <span className="min-w-0 flex-1 truncate">{it.label}</span>
              {it.count != null && <span className="text-caption text-fg-muted">{it.count}</span>}
            </Item>
          ))}
        </Group>
      ))}
    </Nav>
  );
}
