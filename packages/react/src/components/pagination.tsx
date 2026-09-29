import * as React from 'react';
import { cn } from '../lib/cn';
import type { Size } from '../lib/types';
import { ChevronLeft, ChevronRight, Ellipsis } from '../lib/icons';

/**
 * 내비 가족 — Pagination. 긴 목록·표를 쪽으로 나눠 옮겨 다닌다.
 *
 * 헤드리스 라이브러리를 쓰지 않는다 — 버튼 줄이라 브라우저가 키보드·읽기를 다 해준다.
 * 쪽 번호는 1 부터 센다. 무엇을 불러올지는 쓰는 쪽이 onPageChange 에서 정한다.
 *
 *   <Pagination page={page} pageCount={24} onPageChange={setPage} />
 *
 * 토큰 매핑:
 *   칸 크기   → --spacing-control-{size} (정사각이 바닥 — 두 자리 이상은 옆으로 늘어난다)
 *   현재 쪽   → --color-surface-accent-subtle + --color-fg-link (Toggle 눌림과 같은 조합)
 *   칸 사이   → --spacing-inline-xs
 */

const ITEM = [
  'inline-flex items-center justify-center rounded-control border-none bg-transparent',
  'font-sans font-medium leading-ui tabular-nums text-fg-default cursor-pointer select-none',
  'transition-colors duration-fast ease-standard ax-focus-ring',
  // 현재 쪽은 호버해도 그대로 — 회색이 선택 색을 덮으면 지금 어디인지 잠깐 사라진다.
  'hover:not-disabled:not-aria-[current=page]:bg-surface-hover',
  'aria-[current=page]:bg-surface-accent-subtle aria-[current=page]:font-semibold aria-[current=page]:text-fg-link',
  'disabled:cursor-not-allowed disabled:text-fg-disabled',
  '[&_svg]:shrink-0',
].join(' ');

const SIZE: Record<Size, string> = {
  sm: 'h-control-sm min-w-control-sm px-inset-xs text-caption [&_svg]:size-icon-sm',
  md: 'h-control-md min-w-control-md px-inset-xs text-body [&_svg]:size-icon-md',
  lg: 'h-control-lg min-w-control-lg px-inset-sm text-body [&_svg]:size-icon-md',
};

// 접힌 자리는 음수로 표시한다(-1 앞쪽, -2 뒤쪽). 문자열로 두면 클래스 이름처럼 보여 계약 린트가 잡는다.
const SKIP_START = -1;
const SKIP_END = -2;
type Slot = number;

/**
 * 보일 칸을 고른다. 처음·끝 쪽은 늘 보이고, 현재 쪽 좌우로 siblingCount 만큼.
 * 칸 수가 항상 같게(siblingCount*2 + 5) 맞춰 쪽을 옮겨도 줄 폭이 흔들리지 않는다.
 */
function slots(page: number, pageCount: number, siblingCount: number): Slot[] {
  const total = siblingCount * 2 + 5;
  if (pageCount <= total) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const left = Math.max(page - siblingCount, 1);
  const right = Math.min(page + siblingCount, pageCount);
  const showStartGap = left > 3;
  const showEndGap = right < pageCount - 2;
  const edge = siblingCount * 2 + 3;
  if (!showStartGap) return [...Array.from({ length: edge }, (_, i) => i + 1), SKIP_END, pageCount];
  if (!showEndGap) return [1, SKIP_START, ...Array.from({ length: edge }, (_, i) => pageCount - edge + 1 + i)];
  return [1, SKIP_START, ...Array.from({ length: right - left + 1 }, (_, i) => left + i), SKIP_END, pageCount];
}

export interface PaginationProps extends Omit<React.ComponentProps<'nav'>, 'onChange'> {
  /** 지금 쪽(1 부터). */
  page: number;
  /** 전체 쪽 수. 1 이하면 아무것도 그리지 않는다 — 옮겨 갈 데가 없다. */
  pageCount: number;
  onPageChange: (page: number) => void;
  /** 현재 쪽 좌우로 보일 쪽 수. 기본 1. */
  siblingCount?: number;
  size?: Size;
}

export function Pagination({ page, pageCount, onPageChange, siblingCount = 1, size = 'md', className, ...props }: PaginationProps) {
  if (pageCount <= 1) return null;
  const go = (p: number) => onPageChange(Math.min(Math.max(p, 1), pageCount));
  const item = cn(ITEM, SIZE[size]);
  // 이전·다음 화살표는 글자보다 한 단계 옅게. 생략(…)은 따로 fg-subtle 을 준다 — 버튼에만 붙인다.
  const button = cn(item, 'not-disabled:[&_svg]:text-fg-muted');
  return (
    <nav aria-label="쪽 이동" className={cn('flex', className)} {...props}>
      <ul className="m-0 flex list-none items-center gap-inline-xs p-0">
        <li>
          <button type="button" className={button} aria-label="이전 쪽" disabled={page <= 1} onClick={() => go(page - 1)}>
            <ChevronLeft aria-hidden />
          </button>
        </li>
        {slots(page, pageCount, siblingCount).map((s) =>
          s > 0 ? (
            <li key={s}>
              <button type="button" className={item} aria-current={s === page ? 'page' : undefined} aria-label={`${s}쪽`} onClick={() => go(s)}>
                {s}
              </button>
            </li>
          ) : (
            <li key={s} aria-hidden className={cn(item, 'cursor-default text-fg-subtle hover:bg-transparent')}>
              <Ellipsis />
            </li>
          ),
        )}
        <li>
          <button type="button" className={button} aria-label="다음 쪽" disabled={page >= pageCount} onClick={() => go(page + 1)}>
            <ChevronRight aria-hidden />
          </button>
        </li>
      </ul>
    </nav>
  );
}
