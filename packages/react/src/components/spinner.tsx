import * as React from 'react';
import { cn } from '../lib/cn';
import type { Size } from '../lib/types';

/**
 * 표시 가족 — Spinner. 얼마나 걸릴지 모를 때 도는 스피너.
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
 *   궤도   → currentColor 의 25% — 놓인 자리의 글자 색을 옅게 깐 것
 *   도는 쪽 → --color-action-primary-bg-default (키컬러). 진한 면 위에 얹을 때만
 *             `className="border-t-current"` 로 그 자리 글자 색을 따르게 바꾼다.
 *
 * **궤도는 지우지 않는다.** 한때 진한 면 위에서 `border-transparent` 로 궤도를 없앴는데,
 * 그러면 14px 상자 안에 4분의 1 호만 남아 글자에서 7px 쯤 떨어져 보이고(실제 간격은
 * 4px 이다) 호가 돌면서 그 거리가 계속 바뀐다. 궤도가 있어야 동그라미 전체가 보이고
 * 간격이 눈에 맞는다.
 *
 * 글자 옆에 세울 때는 **간격을 8px(`gap-inline-lg`)로** 벌린다. 아이콘은 잉크가 상자를
 * 꽉 채우지만 동그라미는 네 점에서만 상자에 닿아서, 같은 값이면 더 붙어 보인다.
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
        // 궤도는 '그 자리 글자 색의 옅은 판'이다. 회색 토큰(surface.track)으로 고정했더니
        // 파란 버튼 위에서 궤도(#e2e8f0)와 흰 호가 거의 같은 색이 되어 도는 게 안 보였다.
        // currentColor 를 옅게 깔면 어느 바탕에서도 호와 궤도가 갈린다.
        'border-current/25',
        // 도는 쪽은 키컬러다. 예전에는 currentColor 였는데, 그러면 놓는 자리마다 색이
        // 달라져(빨강·회색…) 같은 '기다림'이 화면마다 다른 뜻처럼 보였다.
        'border-t-action-primary-bg-default',
        // 움직임을 줄이도록 설정한 사용자에게는 돌리지 않는다. 스피너는 그대로 보인다.
        'animate-spin motion-reduce:animate-none',
        SIZE[size],
        className,
      )}
      {...props}
    />
  );
}
