import * as React from 'react';
import { Tabs as Base } from '@base-ui/react/tabs';
import { cn } from '../lib/cn';

/**
 * 내비 가족 — Tabs. 같은 층의 뷰를 바꾼다. 페이지 이동이면 NavigationMenu, 접기/펼치기면 Accordion.
 *
 * 생김새 세 가지. 동작은 Base UI 가 다 하고, 셋의 차이는 전부 우리 클래스다.
 *
 *   line   (기본) 밑줄이 미끄러진다. 페이지 안의 주 구획을 가를 때.
 *   pill   눌린 조각이 떠 보인다. 같은 자료를 다른 방식으로 볼 때(목록/보드/달력).
 *   folder 선택된 탭이 아래 줄을 끊고 내용과 이어진다. 탭이 곧 문서철일 때.
 *
 * line·pill 의 표시자는 Base UI 가 주는 --active-tab-* 변수로 움직인다 — 탭 개수·너비를
 * 몰라도 되고, 위치가 바뀌면 미끄러진다. folder 는 표시자가 없다(탭 자체가 면을 갖는다).
 */

export type TabsVariant = 'line' | 'pill' | 'folder';

/** TabsList 가 정한 생김새를 Tab 이 알아야 한다. prop 으로 내리면 쓰는 쪽이 매번 적어야 한다. */
const VariantCtx = React.createContext<TabsVariant>('line');

export const Tabs = Base.Root;

const LIST: Record<TabsVariant, string> = {
  // 탭 상자를 선에서 4px 띄운다 — 호버 배경이 선에 닿으면 붙어 보인다.
  line:
    'gap-inline-xs ' +
    'data-[orientation=horizontal]:border-b data-[orientation=horizontal]:border-solid data-[orientation=horizontal]:border-border-default data-[orientation=horizontal]:pb-inset-xs ' +
    'data-[orientation=vertical]:flex-col data-[orientation=vertical]:border-r data-[orientation=vertical]:border-solid data-[orientation=vertical]:border-border-default data-[orientation=vertical]:pr-inset-xs',
  // 세그먼트와 같은 그릇. Toolbar·ToggleGroup 과 같은 면이라 한 화면에 섞여도 어긋나지 않는다.
  pill:
    'w-fit gap-inline-xs rounded-control border-width-default border-solid border-border-default bg-surface-sunken p-inset-xs ' +
    'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
  // 띄우지 않는다 — 선택된 탭이 이 줄을 덮어야 문서철처럼 보인다.
  folder:
    'gap-inline-xs ' +
    'data-[orientation=horizontal]:border-b data-[orientation=horizontal]:border-solid data-[orientation=horizontal]:border-border-default ' +
    'data-[orientation=vertical]:flex-col data-[orientation=vertical]:border-r data-[orientation=vertical]:border-solid data-[orientation=vertical]:border-border-default',
};

const INDICATOR: Record<TabsVariant, string | null> = {
  line:
    'absolute bg-action-primary-bg-default transition-[left,width,top,height] duration-normal ease-standard ' +
    'data-[orientation=horizontal]:bottom-[-1px] data-[orientation=horizontal]:h-[2px] data-[orientation=horizontal]:left-(--active-tab-left) data-[orientation=horizontal]:w-(--active-tab-width) ' +
    'data-[orientation=vertical]:right-[-1px] data-[orientation=vertical]:w-[2px] data-[orientation=vertical]:top-(--active-tab-top) data-[orientation=vertical]:h-(--active-tab-height)',
  // 네 변을 다 쓴다 — 조각이 통째로 뜨는 모양이라 가로·세로 둘 다 자리를 잡아야 한다.
  pill:
    'absolute rounded-control bg-surface-raised shadow-raised transition-[left,width,top,height] duration-normal ease-standard ' +
    'left-(--active-tab-left) w-(--active-tab-width) top-(--active-tab-top) h-(--active-tab-height)',
  folder: null,
};

const TAB: Record<TabsVariant, string> = {
  line: 'rounded-control hover:not-data-disabled:text-fg-default data-active:not-data-disabled:text-fg-default',
  // 표시자가 먼저 깔리고 탭이 그 위에 선다. relative 가 없으면 자리를 잡은 표시자가
  // 글자를 덮어 버린다 — 표시자를 뒤로 보내는 z 값을 만들지 않고 이렇게 푼다.
  pill: 'relative rounded-control hover:not-data-disabled:not-data-active:text-fg-default data-active:not-data-disabled:text-fg-default',
  // 위 모서리만 둥글게. 아래는 각져야 내용과 이어 붙은 것으로 보인다 — 네 귀가 다
  // 둥글면 탭이 내용에서 떠서 pill 처럼 읽힌다.
  // 아래 테두리는 면 색으로 칠해 지우고, 테두리 두께만큼 끌어내려 목록의 밑줄을 덮는다.
  folder:
    'rounded-t-control rounded-b-none mb-[calc(var(--border-width-default)*-1)] ' +
    'border-width-default border-solid border-transparent ' +
    'hover:not-data-disabled:not-data-active:text-fg-default ' +
    'data-active:not-data-disabled:border-border-default data-active:not-data-disabled:border-b-surface-base ' +
    'data-active:not-data-disabled:bg-surface-base data-active:not-data-disabled:text-fg-default',
};

export interface TabsListProps extends React.ComponentProps<typeof Base.List> {
  /** 기본 line. pill 은 '박스/버튼형', folder 는 문서철형. */
  variant?: TabsVariant;
}

export function TabsList({ variant = 'line', className, children, ...props }: TabsListProps) {
  const indicator = INDICATOR[variant];
  return (
    <VariantCtx.Provider value={variant}>
      <Base.List data-variant={variant} className={cn('relative flex', LIST[variant], className)} {...props}>
        {/* 표시자를 children 보다 먼저 둔다. 둘 다 자리를 잡은 요소라 나중에 온 쪽이
            위에 그려지는데, pill 은 표시자가 글자 뒤에 있어야 한다. */}
        {indicator != null && <Base.Indicator className={indicator} />}
        {children}
      </Base.List>
    </VariantCtx.Provider>
  );
}

export function Tab({ className, ...props }: React.ComponentProps<typeof Base.Tab>) {
  const variant = React.useContext(VariantCtx);
  return (
    <Base.Tab
      className={cn(
        'inline-flex h-control-md items-center justify-center gap-inline-md px-inset-md',
        'font-sans text-heading-xs font-semibold leading-ui text-fg-muted whitespace-nowrap select-none cursor-pointer',
        'transition-colors duration-fast ease-standard ax-focus-ring',
        'data-disabled:text-fg-disabled data-disabled:cursor-not-allowed',
        '[&_svg]:size-icon-sm',
        TAB[variant],
        className,
      )}
      {...props}
    />
  );
}

export function TabsPanel({ className, ...props }: React.ComponentProps<typeof Base.Panel>) {
  return <Base.Panel className={cn('pt-inset-md font-sans text-body text-fg-default outline-none', className)} {...props} />;
}
