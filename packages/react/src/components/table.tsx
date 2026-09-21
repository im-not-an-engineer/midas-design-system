import * as React from 'react';
import { cn } from '../lib/cn';
import type { Size } from '../lib/types';

/**
 * 레퍼런스 구현 #5 — 데이터 테이블.
 *
 * 헤드리스 라이브러리를 쓰지 않는다. 정렬·가상화·컬럼 리사이즈가 필요해지면
 * TanStack Table을 이 스타일 층 위에 얹는다(래핑 층). 지금 필요한 건 '행 높이와
 * 셀 여백이 아키타입을 따라 움직이는가'이고, 그건 아래 토큰만으로 결정된다.
 *
 * 토큰 매핑:
 *   행 높이   → --spacing-row-{size}
 *   셀 여백   → --spacing-inset-{sm|md}
 *   헤더 배경 → --color-surface-subtle
 *   구분선    → --color-border-subtle
 *   행 호버   → --color-surface-hover
 *   선택 행   → --color-surface-selected
 */

const SizeCtx = React.createContext<Size>('md');

const CELL_PAD: Record<Size, string> = {
  sm: 'px-inset-sm',
  md: 'px-inset-md',
  lg: 'px-inset-md',
};
const ROW_H: Record<Size, string> = {
  sm: 'h-row-sm',
  md: 'h-row-md',
  lg: 'h-row-lg',
};

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  size?: Size;
  /** 행마다 얇은 구분선. 고밀도 화면에서는 끄는 편이 덜 시끄럽다. */
  divided?: boolean;
}

export function Table({ size = 'md', divided = true, className, ...props }: TableProps) {
  return (
    <SizeCtx.Provider value={size}>
      <div className="w-full overflow-x-auto rounded-surface border border-solid border-border-default">
        <table
          data-size={size}
          className={cn('w-full border-collapse font-sans text-body leading-ui text-fg-default', divided && '[&_tbody_tr]:border-b [&_tbody_tr]:border-border-subtle', className)}
          {...props}
        />
      </div>
    </SizeCtx.Provider>
  );
}

export function TableHead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-surface-subtle', className)} {...props} />;
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
  return (
    <tr
      data-selected={selected || undefined}
      aria-selected={selected}
      className={cn(
        ROW_H[size],
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
        'text-caption font-medium text-fg-muted text-left whitespace-nowrap',
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
  return <td className={cn(CELL_PAD[size], numeric && 'text-right tabular-nums', className)} {...props} />;
}

/**
 * 빈 상태. 에이전트 산출물이 가장 자주 빠뜨리는 것 중 하나라 테이블에 딸려 있게 했다.
 */
export function TableEmpty({ colSpan, children = '표시할 항목이 없습니다', action }: { colSpan: number; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-section-sm text-center">
        <div className="flex flex-col items-center gap-stack-sm">
          <span className="text-body text-fg-muted">{children}</span>
          {action}
        </div>
      </td>
    </tr>
  );
}
