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
 *   뜻 없는 색 → --color-surface-{subtle|inverse} · --color-fg-{default|muted|on-inverse}
 *   모서리     → --radius-pill · --radius-inline (shape)
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
  // 아이콘과 글자 사이 4px. 2px(inline-xs)은 붙어 보였다.
  'inline-flex shrink-0 items-center justify-center gap-inline-sm',
  'font-sans font-medium leading-ui whitespace-nowrap',
  'border-width-default border-solid',
  '[&_svg]:pointer-events-none [&_svg]:shrink-0',
].join(' ');

/**
 * 모서리. 생김새가 아니라 윤곽이라 variant(채움)와 따로 둔다 — 채움 넷 × 윤곽 둘이 다 성립한다.
 * rounded 는 radius.inline — control(6)을 그대로 쓰면 20px 높이에서 거의 알약처럼 보여 한 단계 작게 열었다.
 */
export type BadgeShape = 'pill' | 'rounded';

const SHAPE: Record<BadgeShape, string> = {
  pill: 'rounded-pill',
  rounded: 'rounded-inline',
};

/**
 * 바닥만 받친다. 너비를 통째로 묶지는 않는다 — 글자가 길면 그만큼 늘어난다.
 * 짧은 라벨이 표 안에서 칩이 아니라 점처럼 보이는 것만 막는 장치다.
 * control-md 와 같아 아키타입이 밀도를 바꾸면 같이 움직인다(workbench 32 · base 36 · consumer 44).
 * control-sm × 2(56) → control-md × 1.5(48) → × 1.25(40) → 지금 값으로 사람이 줄였다(2026-09-29).
 * 숫자 배지(sm)에는 주지 않는다 — '12' 가 32px 이 되면 안 된다.
 */
const LABEL_MIN = 'min-w-control-md';

/**
 * 높이 바닥. md 는 위아래 여백 없이 이 값이 곧 높이다 — 글자 줄높이에 여백을 쌓으면 24 가 되어
 * 표 한 줄 안에서 글자보다 배지가 먼저 눈에 띄었다. sm(16) 보다 한 단계 크다.
 */
const LABEL_MIN_H = 'min-h-icon-lg';

/**
 * sm 은 작은 라벨과 숫자 배지다(탭 이름 옆, 메뉴 항목 옆, 좁은 칸). md·lg 는 상태 라벨이고,
 * lg 는 밀도가 낮은 아키타입(consumer)에서 쓴다.
 * 가로 여백 6px 은 척도에 없어 inset-xs 의 1.5 배로 만든다 — 4px 은 글자가 붙고 8px 은 뜬다.
 */
const SIZE: Record<Size, string> = {
  // 세로·가로를 모두 icon-md 로 묶어 한 자리 숫자가 동그라미가 되게 한다. md(20)보다 한 단계 작다.
  // 높이를 안 정하면 글자 줄높이 + 위아래 여백이 쌓여 세로 타원이 된다.
  // 두 자리 이상이나 글자 라벨은 min-w 를 넘겨 알약 모양으로 늘어난다.
  sm: 'h-icon-md min-w-icon-md px-inset-xs text-footnote [&_svg]:size-icon-sm',
  md: `px-inset-sm text-caption [&_svg]:size-icon-sm ${LABEL_MIN} ${LABEL_MIN_H}`,
  lg: `px-inset-md py-inset-xs text-body [&_svg]:size-icon-md ${LABEL_MIN} ${LABEL_MIN_H}`,
};

/** 뜻 없는 회색까지 포함한 색 축. status 를 빼면 neutral 이 된다. */
type Tone = Status | 'neutral';

const TONE: Record<Tone, Record<BadgeVariant, string>> = {
  // 회색에는 status 램프가 없다. 진한 면은 툴팁과 같은 surface.inverse 를 쓴다.
  // subtle 은 다른 색과 같은 짜임(50 단계 면 + 200 단계 선)에 맞춘다. surface.chip 은 선
  // (border.default)과 같은 색이라 선이 안 보이고 한 단계 진해서 혼자 무거워 보였다.
  // surface.sunken 이 아니라 subtle 인 건 다크에서 sunken 이 검정(#000)으로 꺼지기 때문이다.
  neutral: {
    subtle: 'bg-surface-subtle text-fg-default border-border-default',
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
  /** 모서리. 기본은 pill(알약), rounded 는 모서리가 작은 상자. */
  shape?: BadgeShape;
}

export function Badge({ status, variant = 'subtle', size = 'md', shape = 'pill', className, ...props }: BadgeProps) {
  return <span className={cn(BASE, SHAPE[shape], SIZE[size], TONE[status ?? 'neutral'][variant], className)} {...props} />;
}

/**
 * 점 배지 — 글자 없이 점 하나. "새로 바뀐 게 있다", "봐야 할 문제가 있다"를 알린다(필터 적용, 새 알림, 동기화 실패).
 * 숫자가 의미 있으면 점이 아니라 Badge size="sm"(숫자 배지)이다.
 *
 * children 을 주면 그 오른쪽 위 모서리에 얹힌다 — 아이콘을 감싸는 게 보통이다.
 *   <Button><BadgeDot status="danger" label="적용된 필터 있음"><Icons.ListFilter /></BadgeDot>필터</Button>
 * children 이 없으면 글자 줄 안에 그냥 놓인다(메뉴 항목 옆 등).
 *
 * 점 4px + 바깥 고리 2px(원본 시안 그대로, 2026-09-29 사람의 결정). 고리는 뒤 면 색으로 칠해
 * 아이콘 선과 점을 떼어 놓는다 — 고리가 없으면 점이 아이콘 모서리에 묻혀 한 덩어리로 보인다.
 * 면이 surface.base 가 아닌 자리(강조색 버튼 등)에서는 className 으로 고리 색을 바꾼다.
 *
 * 점만으로는 뜻이 안 읽히므로 label 을 주면 화면 읽기 프로그램이 읽는다. 옆에 같은 말이 글자로
 * 있으면 빼도 된다(그러면 aria-hidden).
 */
const DOT_TONE: Record<Tone, string> = {
  neutral: 'bg-fg-muted',
  info: 'bg-status-info-solid',
  success: 'bg-status-success-solid',
  warning: 'bg-status-warning-solid',
  danger: 'bg-status-danger-solid',
};

const DOT = 'block size-inset-xs shrink-0 rounded-pill ring-2 ring-surface-base';

export interface BadgeDotProps extends React.ComponentProps<'span'> {
  /** 뜻이 있는 색. 기본은 danger — 점은 눈길을 끄는 게 일이라 회색(neutral)은 드물다. */
  status?: Status | 'neutral';
  /** 화면 읽기 프로그램이 읽을 말. */
  label?: string;
}

export function BadgeDot({ status = 'danger', label, className, children, ...props }: BadgeDotProps) {
  const a11y = label ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': true as const };
  if (children == null) return <span className={cn(DOT, DOT_TONE[status], className)} {...a11y} {...props} />;
  return (
    <span className="relative inline-flex shrink-0" {...props}>
      {children}
      <span className={cn(DOT, DOT_TONE[status], 'absolute top-0 right-0', className)} {...a11y} />
    </span>
  );
}
