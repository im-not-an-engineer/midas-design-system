import * as React from 'react';
import { cn } from '../lib/cn';
import type { Size } from '../lib/types';
import { ChevronDown } from '../lib/icons';
import { Menu, MenuTrigger, MenuContent } from './menu';

/**
 * 레퍼런스 구현 #5 — 데이터 테이블.
 *
 * 헤드리스 라이브러리를 쓰지 않는다. 정렬·가상화·컬럼 리사이즈가 필요해지면
 * TanStack Table을 이 스타일 층 위에 얹는다(래핑 층). 지금 필요한 건 '행 높이와
 * 셀 여백이 아키타입을 따라 움직이는가'이고, 그건 아래 토큰만으로 결정된다.
 *
 * 토큰 매핑:
 *   행 높이   → --spacing-row-{size} (최솟값 — 내용이 길면 자란다). 머리 행은 한 단계 아래
 *   셀 여백   → --spacing-inset-{sm|md|lg}
 *   셀 글자   → --text-content (읽는 글자 — UI 글자인 body 보다 workbench 에서 한 단계 크다)
 *   헤더 배경 → --color-surface-subtle
 *   구분선    → --color-border-subtle
 *   행 호버   → --color-surface-hover
 *   선택 행   → --color-surface-selected
 */

const SizeCtx = React.createContext<Size>('md');
/** 머리 안의 행인지. TableRow 는 하나라 어느 쪽에 놓였는지를 여기서 알린다. */
const HeadCtx = React.createContext(false);

// 세로 여백은 평소에는 행 높이(ROW_H) 안에 묻혀 보이지 않는다. 칸에 행 높이보다 큰 것이
// 들어가 행이 커질 때 위아래 선에 붙지 않게 하는 몫이다 — 표의 행 높이는 최솟값이라 내용만큼 자란다.
// sm 은 촘촘한 표라 예전 여백(좌우 8 · 위아래 4)을 그대로 둔다.
const CELL_PAD: Record<Size, string> = {
  sm: 'px-inset-sm py-inset-xs',
  md: 'px-inset-lg py-inset-md',
  lg: 'px-inset-lg py-inset-md',
};
const ROW_H: Record<Size, string> = {
  sm: 'h-row-sm',
  md: 'h-row-md',
  lg: 'h-row-lg',
};
// 머리 행은 본문보다 한 단계 낮다(sm 은 더 내려갈 데가 없어 그대로). 머리는 열 이름 한 줄뿐이라
// 본문과 같은 높이면 위가 무거워 보인다. 토큰을 따로 두지 않고 같은 사다리의 한 칸 아래를 쓴다.
const HEAD_ROW_H: Record<Size, string> = {
  sm: 'h-row-sm',
  md: 'h-row-sm',
  lg: 'h-row-md',
};
// 머리 칸은 위아래 여백을 한 단계 줄인다. 본문과 같은 inset-md 면 글자 줄높이 + 24 가 머리 최솟값(row-md)을
// 넘어서 최솟값이 아무 일도 하지 않는다 — 머리 높이는 HEAD_ROW_H 가 정하게 둔다.
const HEAD_PAD_Y: Record<Size, string> = {
  sm: 'py-inset-xs',
  md: 'py-inset-sm',
  lg: 'py-inset-sm',
};
// 넘치는 글자는 두 줄로 내리지 않고 말줄임한다. 줄이 들쭉날쭉하면 행을 눈으로 따라가기 어렵다.
// 말줄임은 칸 폭이 정해져 있을 때만 일어난다 — 열 폭을 주지 않으면 표가 넓어지고 가로 스크롤이 생긴다.
const CELL_TEXT = 'overflow-hidden text-ellipsis whitespace-nowrap';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  size?: Size;
  /** 행마다 얇은 구분선. 고밀도 화면에서는 끄는 편이 덜 시끄럽다. */
  divided?: boolean;
  /** 안쪽 <table> 에 붙일 클래스. 폭·여백 같은 바깥 크기는 className 으로 준다. */
  tableClassName?: string;
}

/**
 * className 은 바깥 상자(테두리·모서리·가로 스크롤)가 받는다. 폭을 주면 테두리가 표와 같이 줄어든다.
 * 전에는 안쪽 표가 받아서, w-[560px] 을 주면 표만 줄고 테두리는 줄 끝까지 남았다.
 */
export function Table({ size = 'lg', divided = true, className, tableClassName, ...props }: TableProps) {
  return (
    <SizeCtx.Provider value={size}>
      <div className={cn('w-full overflow-x-auto rounded-surface border-width-default border-solid border-border-default', className)}>
        <table
          data-size={size}
          className={cn('w-full border-collapse font-sans text-content leading-ui text-fg-default', divided && '[&_tbody_tr]:border-b [&_tbody_tr]:border-border-subtle', tableClassName)}
          {...props}
        />
      </div>
    </SizeCtx.Provider>
  );
}

export function TableHead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <HeadCtx.Provider value>
      <thead className={cn('bg-surface-subtle', className)} {...props} />
    </HeadCtx.Provider>
  );
}

export function TableBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
  /** 클릭 가능한 행. 커서와 호버 배경이 붙는다. */
  interactive?: boolean;
}

export function TableRow({ selected, interactive, className, ...props }: TableRowProps) {
  const size = React.useContext(SizeCtx);
  const inHead = React.useContext(HeadCtx);
  return (
    <tr
      data-selected={selected || undefined}
      aria-selected={selected}
      className={cn(
        (inHead ? HEAD_ROW_H : ROW_H)[size],
        'transition-colors duration-fast ease-standard',
        interactive && 'cursor-pointer hover:bg-surface-hover',
        selected && 'bg-surface-selected',
        className,
      )}
      {...props}
    />
  );
}

export interface TableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** 숫자 컬럼은 오른쪽 정렬. */
  numeric?: boolean;
}

export function TableHeaderCell({ numeric, className, ...props }: TableHeaderCellProps) {
  const size = React.useContext(SizeCtx);
  return (
    <th
      scope="col"
      className={cn(
        CELL_PAD[size],
        HEAD_PAD_Y[size],
        'text-caption font-medium text-fg-muted text-left',
        CELL_TEXT,
        'border-b border-solid border-border-default',
        numeric && 'text-right tabular-nums',
        className,
      )}
      {...props}
    />
  );
}

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean;
}

export function TableCell({ numeric, className, ...props }: TableCellProps) {
  const size = React.useContext(SizeCtx);
  return <td className={cn(CELL_PAD[size], CELL_TEXT, numeric && 'text-right tabular-nums', className)} {...props} />;
}

export interface TableHeaderMenuProps {
  /** 열 이름. */
  label: React.ReactNode;
  /** 열었을 때 보일 항목 — MenuGroup · MenuRadioItem · MenuCheckboxItem 으로 정렬과 필터를 짠다. */
  children: React.ReactNode;
}

/**
 * 머리 칸의 정렬·필터 메뉴. TableHeaderCell 안에 넣는다.
 *
 * 무엇을 고를 수 있는지(정렬 방향, 필터 값)는 표마다 달라서 메뉴 내용은 받는다. 여기서
 * 정하는 건 머리 칸에서 '누를 수 있다'는 표시(열 이름 + ▾)와 팝업 위치뿐이다.
 * 정렬 중인 열에는 TableHeaderCell 에 aria-sort 를 직접 준다 — 화면 읽기 프로그램이 읽는 건 그쪽이다.
 */
export function TableHeaderMenu({ label, children }: TableHeaderMenuProps) {
  return (
    <Menu>
      <MenuTrigger
        className={cn(
          'inline-flex max-w-full items-center gap-inline-xs border-none bg-transparent p-0',
          // <button> 은 글꼴을 물려받지 않아 머리 칸 글자(TableHeaderCell)를 그대로 다시 적는다.
          'font-sans text-caption font-medium leading-ui text-fg-muted cursor-pointer rounded-control ax-focus-ring',
          'hover:text-fg-default data-popup-open:text-fg-default',
        )}
      >
        <span className="min-w-0 overflow-hidden text-ellipsis">{label}</span>
        <ChevronDown aria-hidden className="size-icon-sm shrink-0 text-fg-subtle" />
      </MenuTrigger>
      <MenuContent align="start">{children}</MenuContent>
    </Menu>
  );
}

/**
 * 빈 상태. 에이전트 산출물이 가장 자주 빠뜨리는 것 중 하나라 테이블에 딸려 있게 했다.
 */
export function TableEmpty({ colSpan, children = '표시할 항목이 없습니다', action }: { colSpan: number; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-section-sm text-center">
        <div className="flex flex-col items-center gap-stack-lg">
          <span className="text-body text-fg-muted">{children}</span>
          {action}
        </div>
      </td>
    </tr>
  );
}
