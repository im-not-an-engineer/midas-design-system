import * as React from 'react';
import { ScrollArea as Base } from '@base-ui/react/scroll-area';
import { cn } from '../lib/cn';

/**
 * 레이아웃 — ScrollArea. 네이티브 스크롤바를 우리 스타일의 얇은 막대로 바꾼다. 스크롤 중·호버 때만 보인다.
 * 스크롤바 두께(6px)는 밀도가 아니라 조작 가능한 최소 폭의 문제라 아키타입과 무관한 px다.
 */

export interface ScrollAreaProps extends React.ComponentProps<typeof Base.Root> {
  /** 가로 스크롤바도 표시. */
  horizontal?: boolean;
}

export function ScrollArea({ horizontal, className, children, ...props }: ScrollAreaProps) {
  return (
    <Base.Root className={cn('relative overflow-hidden', className)} {...props}>
      <Base.Viewport className="size-full overscroll-contain ax-focus-ring">
        <Base.Content>{children}</Base.Content>
      </Base.Viewport>
      <Base.Scrollbar className={cn(SCROLLBAR, 'top-[2px] bottom-[2px] right-[2px] w-[6px]')}><Base.Thumb className={THUMB} /></Base.Scrollbar>
      {horizontal && (
        <Base.Scrollbar orientation="horizontal" className={cn(SCROLLBAR, 'left-[2px] right-[2px] bottom-[2px] h-[6px]')}><Base.Thumb className={THUMB} /></Base.Scrollbar>
      )}
      {horizontal && <Base.Corner />}
    </Base.Root>
  );
}

const SCROLLBAR = [
  'absolute flex touch-none select-none rounded-pill',
  'opacity-0 transition-opacity duration-normal ease-standard',
  'data-hovering:opacity-100 data-scrolling:opacity-100',
  'data-[orientation=vertical]:justify-center data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:justify-center',
].join(' ');
// 손잡이는 선도 면도 아니고 '잡는 표시'라 fg 계열을 쓴다. 선 색(border-*)을 배경으로
// 빌려 쓰면 테마가 선만 진하게 조정했을 때 손잡이가 엉뚱하게 따라간다.
// 호버에서 대비가 커지는 방향은 라이트(400→600)·다크(500→400) 둘 다 성립한다.
const THUMB = 'flex-1 rounded-pill bg-fg-subtle hover:bg-fg-muted';
