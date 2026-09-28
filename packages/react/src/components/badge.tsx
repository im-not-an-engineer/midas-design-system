import * as React from 'react';
import { cn } from '../lib/cn';
import type { Size, Status } from '../lib/types';

/**
 * 표시 가족 — Badge. 누를 수 없는 라벨이다.
 *
 * 누르면 Badge 가 아니다. 고르는 태그는 Chip(Toggle 계열), 동작은 Button 이다.
 * 여기에 onClick 을 붙이면 키보드로 닿지 않고 화면 읽기 프로그램도 버튼으로 읽지 않는다.
 *
 * 토큰 매핑:
 *   뜻 있는 색 → --color-status-{info|success|warning|danger}-{subtle|fg|border|solid|on-solid}
 *   뜻 없는 색 → --color-surface-{chip|inverse} · --color-fg-{default|muted|on-inverse}
 *   모서리     → --radius-pill
 *   글자 크기  → --text-{footnote|caption|body}
 *
 * 계약의 status-* 20개 중 16개를 이 파일이 처음 쓴다. 그 전에는 갤러리에 인라인
 * <span> 으로만 있어서 제품이 가져다 쓸 수 없었다.
 */

/**
 * 채움. 네 가지는 같은 상자 크기를 유지한다 — ghost 도 투명 테두리를 둘러 높이가 같다.
 *
 * outline 의 테두리는 status-*-border(200 단계)가 아니라 -solid(500~600 단계)를 쓴다.
 * -border 는 같은 계열의 연한 면 위에 놓이라고 만든 색이라, 흰 바탕에 선만 그으면
 * success 가 #bbf7d0 이 되어 거의 안 보이고 subtle 과 구분이 안 된다.
 * 회색만 border.strong 에 머무는데, 중립 테두리는 이보다 진한 단계가 계약에 없다.
 */
export type BadgeVariant = 'subtle' | 'solid' | 'outline' | 'ghost';

const BASE = [
  'inline-flex shrink-0 items-center justify-center gap-inline-xs',
  'font-sans font-medium leading-ui whitespace-nowrap',
  'rounded-pill border-width-default border-solid',
  '[&_svg]:pointer-events-none [&_svg]:shrink-0',
].join(' ');

/**
 * 바닥만 받친다. 너비를 통째로 묶지는 않는다 — 글자가 길면 그만큼 늘어난다.
 * 짧은 라벨이 표 안에서 알약이 아니라 점처럼 보이는 것만 막는 장치다.
 * 56px 은 control-sm(28px)의 두 배라 아키타입이 밀도를 바꾸면 같이 움직인다.
 * 숫자 배지(sm)에는 주지 않는다 — '12' 가 56px 이 되면 안 된다.
 */
const LABEL_MIN = 'min-w-[calc(var(--spacing-control-sm)*2)]';

/**
 * sm 은 숫자 배지다(탭 이름 옆, 메뉴 항목 옆). 나머지 둘은 상태 라벨이고,
 * lg 는 밀도가 낮은 아키타입(consumer)에서 쓴다.
 * 가로 여백 6px 은 척도에 없어 inset-xs 의 1.5 배로 만든다 — 4px 은 글자가 붙고 8px 은 뜬다.
 */
const SIZE: Record<Size, string> = {
  // 세로·가로를 모두 icon-lg 로 묶어 한 자리 숫자가 동그라미가 되게 한다.
  // 높이를 안 정하면 글자 줄높이 + 위아래 여백이 쌓여 21×27 짜리 세로 타원이 된다.
  // 두 자리 이상은 min-w 를 넘겨 알약으로 늘어난다.
  sm: 'h-icon-lg min-w-icon-lg px-[calc(var(--spacing-inset-xs)*1.5)] text-footnote [&_svg]:size-icon-sm',
  md: `px-inset-sm py-inset-xs text-caption [&_svg]:size-icon-sm ${LABEL_MIN}`,
  lg: `px-inset-md py-inset-xs text-body [&_svg]:size-icon-md ${LABEL_MIN}`,
};

/** 뜻 없는 회색까지 포함한 색 축. status 를 빼면 neutral 이 된다. */
type Tone = Status | 'neutral';

const TONE: Record<Tone, Record<BadgeVariant, string>> = {
  // 회색에는 status 램프가 없다. 면은 surface.chip(글자를 얹는 작은 채워진 면),
  // 진한 면은 툴팁과 같은 surface.inverse 를 쓴다.
  neutral: {
    subtle: 'bg-surface-chip text-fg-default border-border-default',
    solid: 'bg-surface-inverse text-fg-on-inverse border-surface-inverse',
    outline: 'bg-transparent text-fg-default border-border-strong',
    ghost: 'bg-transparent text-fg-muted border-transparent',
  },
  info: {
    subtle: 'bg-status-info-subtle text-status-info-fg border-status-info-border',
    solid: 'bg-status-info-solid text-status-info-on-solid border-status-info-solid',
    outline: 'bg-transparent text-status-info-fg border-status-info-solid',
    ghost: 'bg-transparent text-status-info-fg border-transparent',
  },
  success: {
    subtle: 'bg-status-success-subtle text-status-success-fg border-status-success-border',
    solid: 'bg-status-success-solid text-status-success-on-solid border-status-success-solid',
    outline: 'bg-transparent text-status-success-fg border-status-success-solid',
    ghost: 'bg-transparent text-status-success-fg border-transparent',
  },
  warning: {
    subtle: 'bg-status-warning-subtle text-status-warning-fg border-status-warning-border',
    solid: 'bg-status-warning-solid text-status-warning-on-solid border-status-warning-solid',
    outline: 'bg-transparent text-status-warning-fg border-status-warning-solid',
    ghost: 'bg-transparent text-status-warning-fg border-transparent',
  },
  danger: {
    subtle: 'bg-status-danger-subtle text-status-danger-fg border-status-danger-border',
    solid: 'bg-status-danger-solid text-status-danger-on-solid border-status-danger-solid',
    outline: 'bg-transparent text-status-danger-fg border-status-danger-solid',
    ghost: 'bg-transparent text-status-danger-fg border-transparent',
  },
};

export interface BadgeProps extends React.ComponentProps<'span'> {
  /** 뜻이 있는 색. 빼면 뜻 없는 회색 — '초안', '3.2' 처럼 상태가 아닌 라벨이다. */
  status?: Status;
  /** 채움. 기본은 subtle(연한 면). */
  variant?: BadgeVariant;
  /** sm 은 숫자 배지, md·lg 는 상태 라벨. 기본은 md. */
  size?: Size;
}

export function Badge({ status, variant = 'subtle', size = 'md', className, ...props }: BadgeProps) {
  return <span className={cn(BASE, SIZE[size], TONE[status ?? 'neutral'][variant], className)} {...props} />;
}
