import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { cn } from '../lib/cn';

/**
 * 내비 가족 — SideNav. 화면 왼쪽의 2뎁스 메뉴(LNB).
 *
 * 상단 글로벌 메뉴는 NavigationMenu 다. 이건 한 구역 안의 페이지들을 세로로 늘어놓는다.
 * 헤드리스 라이브러리를 쓰지 않는다 — 링크 목록이라 브라우저가 이미 키보드·읽기를 다 해준다.
 *
 * 구조는 nav > (묶음 제목 + ul > li > a). 항목은 링크라 `render` 로 라우터 링크를 넘긴다.
 *
 *   <SideNav aria-label="전표">
 *     <SideNavGroup label="범주명">
 *       <SideNavItem active render={<Link to="/a" />}>2뎁스 메뉴명</SideNavItem>
 *     </SideNavGroup>
 *   </SideNav>
 *
 * 토큰 매핑:
 *   항목 여백 → 좌우 --spacing-inset-lg · 위아래 inset-sm 과 inset-md 의 가운데(workbench·base 10)
 *   묶음 제목 → SideNav 전용(GROUP_LABEL). 팝업 묶음 제목과 따로 논다 — 한쪽을 바꿔도 다른 쪽은 그대로다
 *   제목 ↔ 항목 → --spacing-stack-sm
 *   현재 페이지 → --color-surface-sunken + semibold (상단 ghost 탭과 같은 표시)
 *   묶음 사이 → --spacing-stack-lg
 */

/**
 * 묶음 제목. 팝업 묶음 제목(POPUP_GROUP_LABEL)을 빌려 쓰다가 떼어 냈다(2026-09-29, 사람의 결정) —
 * 여백·색을 덮어쓰고 있어서 이미 다른 부품이었고, 팝업 쪽을 바꿀 때마다 LNB 가 같이 바뀌었다.
 * 좌우 여백은 항목(ITEM)과 같아야 제목 글자와 항목 글자의 왼쪽 끝이 한 줄에 선다.
 * 색은 항목보다 한 단계 옅게 — 늘 보이는 메뉴라 제목이 뒤로 물러나야 한다.
 */
const GROUP_LABEL = 'px-inset-lg py-inset-xs text-caption font-semibold text-fg-subtle';

export function SideNav({ className, ...props }: React.ComponentProps<'nav'>) {
  return <nav className={cn('flex flex-col gap-stack-lg font-sans', className)} {...props} />;
}

export interface SideNavGroupProps extends React.ComponentProps<'div'> {
  /** 묶음 제목. 없으면 항목만 늘어놓는다. */
  label?: React.ReactNode;
}

export function SideNavGroup({ label, className, children, ...props }: SideNavGroupProps) {
  const id = React.useId();
  return (
    <div className={cn('flex flex-col gap-stack-sm', className)} {...props}>
      {label != null && <span id={id} className={GROUP_LABEL}>{label}</span>}
      <ul aria-labelledby={label != null ? id : undefined} className="m-0 flex list-none flex-col p-0">
        {children}
      </ul>
    </div>
  );
}

const ITEM = [
  // 위아래 10 은 척도에 없어 inset-sm(8)과 inset-md(12)의 가운데로 만든다 — 두 단계 사이라 밀도를 따라간다.
  'flex min-h-control-md items-center gap-inline-md rounded-control px-inset-lg py-[calc((var(--spacing-inset-sm)+var(--spacing-inset-md))/2)]',
  'text-body leading-ui text-fg-default no-underline cursor-pointer select-none',
  'transition-colors duration-fast ease-standard ax-focus-ring',
  // 현재 페이지는 호버해도 그대로 둔다 — 회색이 선택 색을 덮으면 어디에 있는지 잠깐 사라진다.
  'hover:not-data-active:not-aria-disabled:bg-surface-hover',
  // 현재 페이지는 상단 ghost 탭과 같은 회색 면 + semibold. 호버 면과 색이 같아 굵기로 가른다(2026-09-29, 사람의 결정).
  'data-active:bg-surface-sunken data-active:font-semibold',
  'aria-disabled:text-fg-disabled aria-disabled:cursor-not-allowed',
  '[&_svg]:size-icon-md [&_svg]:shrink-0 [&_svg]:text-fg-muted',
].join(' ');

export interface SideNavItemProps extends useRender.ComponentProps<'a'> {
  /** 지금 보고 있는 페이지. aria-current="page" 가 붙어 화면 읽기 프로그램도 안다. */
  active?: boolean;
  /** 권한이 없는 메뉴처럼 보이되 못 가는 것. 링크가 눌리지 않게 막는다. */
  disabled?: boolean;
}

export function SideNavItem({ active, disabled, className, render, ref, onClick, ...props }: SideNavItemProps) {
  const link = useRender({
    defaultTagName: 'a',
    render,
    ref,
    props: {
      ...props,
      'aria-current': active ? 'page' : undefined,
      'aria-disabled': disabled || undefined,
      'data-active': active ? '' : undefined,
      onClick: disabled ? (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault() : onClick,
      className: cn(ITEM, className),
    },
  });
  return <li>{link}</li>;
}
