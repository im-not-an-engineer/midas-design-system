import * as React from 'react';
import { cn } from '../lib/cn';
import type { Size } from '../lib/types';

/**
 * 표시 가족 — Spinner. 얼마나 걸릴지 모를 때 도는 고리.
 *
 * 진행률을 아는 작업에는 쓰지 않는다 — 그건 Progress 다. 여기는 "받는 중"처럼
 * 끝을 모르는 자리다.
 *
 * 생김새는 빈 상자의 모서리를 굴려 원으로 만들고, 네 변 중 위쪽 한 변에만
 * 글자 색을 준 것이다. 나머지 세 변은 surface.track(게이지의 빈 칸)이라
 * 뒤에 남는 궤도처럼 보인다.
 *
 * 토큰 매핑:
 *   지름   → --spacing-icon-{sm|md|lg}
 *   궤도   → --color-surface-track
 *   도는 쪽 → currentColor (놓인 자리의 글자 색을 그대로 따른다)
 */

/**
 * 굵기를 px 로 박지 않고 지름에서 나눈다.
 *
 * 2px 로 고정하면 workbench 의 14px 에서는 지름의 14%, consumer 의 24px 에서는
 * 8% 가 되어 밀도를 바꿀 때마다 인상이 달라진다. 7 로 나누면 어느 아키타입에서도
 * 같은 비율이다(14→2 · 16→2.29 · 20→2.86 · 24→3.43).
 * 7 은 눈으로 고른 수다. 6 이면 더 두껍고 8 이면 더 가늘다.
 */
const SIZE: Record<Size, string> = {
  sm: 'size-icon-sm border-[length:calc(var(--spacing-icon-sm)/7)]',
  md: 'size-icon-md border-[length:calc(var(--spacing-icon-md)/7)]',
  lg: 'size-icon-lg border-[length:calc(var(--spacing-icon-lg)/7)]',
};

export interface SpinnerProps extends React.ComponentProps<'span'> {
  size?: Size;
  /**
   * 화면 읽기 프로그램이 읽을 말. 주면 role="status" 가 붙는다.
   * 빼면 장식으로 취급해 숨긴다 — 버튼 안처럼 옆 글자가 이미 상태를 말하는 자리다.
   */
  label?: string;
}

export function Spinner({ size = 'md', label, className, ...props }: SpinnerProps) {
  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        'inline-block shrink-0 rounded-pill border-solid',
        'border-surface-track border-t-current',
        // 움직임을 줄이도록 설정한 사용자에게는 돌리지 않는다. 고리는 그대로 보인다.
        'animate-spin motion-reduce:animate-none',
        SIZE[size],
        className,
      )}
      {...props}
    />
  );
}
