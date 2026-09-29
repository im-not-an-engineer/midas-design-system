import * as React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { SideNav, type SideNavGroup } from './side-nav';

/**
 * 앱 틀. 모든 화면이 같이 쓰는 바깥 틀이다 — 시험 대상이 아니다.
 * 위 = 제품 이름 + 사용자, 왼쪽 = 왼쪽 메뉴(임시), 가운데 = 페이지 셸이 들어가는 자리.
 */
export function AppFrame({
  product,
  user,
  nav,
  children,
}: {
  product: string;
  user?: { name: string };
  nav: SideNavGroup[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-subtle font-sans text-fg-default">
      <header className="sticky top-0 z-sticky flex items-center justify-between border-b border-solid border-border-subtle bg-surface-base px-inset-lg py-inset-sm">
        <span className="text-body-lg font-semibold leading-ui">{product}</span>
        {user && <Avatar name={user.name} size="sm" />}
      </header>
      <div className="flex flex-1">
        <aside className="w-[240px] shrink-0 border-r border-solid border-border-subtle bg-surface-base">
          <SideNav groups={nav} />
        </aside>
        <main className="min-w-0 flex-1 p-inset-xl">{children}</main>
      </div>
    </div>
  );
}
