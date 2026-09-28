import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { cn } from '../lib/cn';
import type { Intent, Size } from '../lib/types';

/**
 * 레퍼런스 구현 #1.
 *
 * 토큰 매핑 (사람이 결정한 것 — 이 표가 곧 에이전트가 읽는 메타데이터가 된다):
 *   높이       → --spacing-control-{size}
 *   가로 여백  → --spacing-inset-{sm|md|lg}
 *   배경       → --color-action-{intent}-bg-{default|hover|active|disabled}
 *   글자       → --color-action-{intent}-fg-{default|disabled}
 *   테두리     → --color-action-{intent}-border-default
 *   모서리     → --radius-control
 *   글자 크기  → --text-body
 */

const BASE = [
  'inline-flex shrink-0 items-center justify-center',
  // 아이콘과 글자 사이. sm 은 상자가 작아 한 단계 더 좁힌다(SIZE 에서 덮는다).
  'gap-inline-sm',
  'font-sans text-body font-semibold leading-ui whitespace-nowrap',
  // 두께도 계약에서 온다 — 'border'(1px 고정)를 쓰면 테마가 두께를 바꿀 수 없다.
  'rounded-control border-width-default border-solid',
  // 컨트롤 그림자. 기본 테마는 '없음'이고, 켜는 테마(consumer)에서만 보인다.
  'shadow-control',
  'transition-colors duration-fast ease-standard',
  'select-none cursor-pointer',
  'ax-focus-ring',
  'disabled:cursor-not-allowed data-disabled:cursor-not-allowed',
  '[&_svg]:pointer-events-none [&_svg]:shrink-0',
].join(' ');

/**
 * `disabled:not-data-loading:` 인 이유(규칙 6-4). 기다리는 버튼도 못 누르므로 disabled 인데,
 * 비활성 색까지 덮으면 저장·취소·삭제가 전부 같은 회색이 되어 **어느 버튼을 눌렀는지 알 수
 * 없고, 스피너도 흐린 회색이라 도는 게 안 보인다.** 그래서 기다리는 동안만 비활성 색을 뺀다 —
 * 누를 수 없다는 건 스피너가 말한다.
 */
const INTENT: Record<Intent, string> = {
  primary:
    'bg-action-primary-bg-default text-action-primary-fg-default border-action-primary-border-default ' +
    'hover:not-disabled:bg-action-primary-bg-hover active:not-disabled:bg-action-primary-bg-active ' +
    'disabled:not-data-loading:bg-action-primary-bg-disabled disabled:not-data-loading:text-action-primary-fg-disabled',
  secondary:
    'bg-action-secondary-bg-default text-action-secondary-fg-default border-action-secondary-border-default ' +
    'hover:not-disabled:bg-action-secondary-bg-hover active:not-disabled:bg-action-secondary-bg-active ' +
    'disabled:not-data-loading:bg-action-secondary-bg-disabled disabled:not-data-loading:text-action-secondary-fg-disabled',
  ghost:
    'bg-action-ghost-bg-default text-action-ghost-fg-default border-action-ghost-border-default ' +
    'hover:not-disabled:bg-action-ghost-bg-hover active:not-disabled:bg-action-ghost-bg-active ' +
    'disabled:not-data-loading:bg-action-ghost-bg-disabled disabled:not-data-loading:text-action-ghost-fg-disabled',
  destructive:
    'bg-action-destructive-bg-default text-action-destructive-fg-default border-action-destructive-border-default ' +
    'hover:not-disabled:bg-action-destructive-bg-hover active:not-disabled:bg-action-destructive-bg-active ' +
    'disabled:not-data-loading:bg-action-destructive-bg-disabled disabled:not-data-loading:text-action-destructive-fg-disabled',
};

const SIZE: Record<Size, string> = {
  // sm 만 굵기를 한 단계 낮춘다 — 28px 상자에서 semibold 는 글자가 뭉쳐 보인다.
  // 모서리는 세 크기가 같다(rounded-control).
  sm: 'h-control-sm px-inset-sm [&_svg]:size-icon-sm font-medium gap-inline-xs',
  md: 'h-control-md px-inset-md [&_svg]:size-icon-md',
  lg: 'h-control-lg px-inset-lg [&_svg]:size-icon-lg',
};

/**
 * 아이콘이 붙은 쪽만 한 단계 좁힌다. 아이콘은 자기 상자 안에 이미 여백을 품고 있어서,
 * 글자와 같은 값을 주면 그쪽만 더 벌어 보인다. md 기준 아이콘 쪽 8px / 글자 쪽 12px.
 *
 * `:only-child` 를 빼는 이유: 아이콘 전용 버튼은 정사각(px-0)이라 여기 걸리면 안 된다.
 * 글자를 span 으로 감싸는 것(wrapText)이 전제다 — 맨 글자는 요소가 아니라서
 * CSS 가 못 보고, 그러면 아이콘이 첫 자식이자 마지막 자식이 되어 앞뒤를 가릴 수 없다.
 */
const ICON_EDGE: Record<Size, string> = {
  sm: 'has-[>svg:first-child:not(:only-child)]:pl-inset-xs has-[>svg:last-child:not(:only-child)]:pr-inset-xs',
  md: 'has-[>svg:first-child:not(:only-child)]:pl-inset-sm has-[>svg:last-child:not(:only-child)]:pr-inset-sm',
  lg: 'has-[>svg:first-child:not(:only-child)]:pl-inset-md has-[>svg:last-child:not(:only-child)]:pr-inset-md',
};

/**
 * 맨 글자를 span 으로 감싼다. 글자는 DOM 에서 요소가 아니라 CSS 선택자에 안 잡힌다 —
 * 감싸지 않으면 `<svg/>추가` 에서 svg 가 첫 자식이면서 마지막 자식이 되어,
 * 아이콘이 앞인지 뒤인지 구분할 수 없다.
 */
function wrapText(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, (c) =>
    typeof c === 'string' || typeof c === 'number' ? <span>{c}</span> : c,
  );
}

/**
 * 기다리는 동안. **버튼 너비가 1px 도 변하면 안 된다** — 표 안의 버튼들이 들썩인다.
 * 그래서 글자를 지우지 않고 투명하게만 만들고(자리는 그대로), 그 위에 스피너를 얹는다.
 * `invisible` 이 아니라 `opacity-0` 인 이유: visibility:hidden 은 접근성 트리에서도
 * 빠져서 버튼 이름이 사라진다.
 *
 * 스피너를 DOM 자식으로 넣지 않고 before 로 그린다. 자식을 하나 더 넣으면 위
 * ICON_EDGE 의 `:first-child` / `:last-child` 가 어긋나 **아이콘 쪽 여백이 바뀌고,
 * 그게 곧 너비 변화다.** 가상 요소는 자식으로 세지 않는다.
 *
 * 생김새는 Spinner 와 같은 처방이다(굵기 = 지름 ÷ 7, 궤도 없이 호만). 클래스 이름을
 * 문자열로 적어야 Tailwind 가 만들어주므로 before: 판을 따로 적을 수밖에 없다 —
 * spinner.tsx 를 고치면 여기도 같이 본다.
 */
const LOADING: Record<Size, string> = {
  sm: 'relative [&>*]:opacity-0 before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:size-icon-sm before:rounded-pill before:border-[length:calc(var(--spacing-icon-sm)/7)] before:border-solid before:border-current/25 before:border-t-current before:animate-spin motion-reduce:before:animate-none',
  md: 'relative [&>*]:opacity-0 before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:size-icon-md before:rounded-pill before:border-[length:calc(var(--spacing-icon-md)/7)] before:border-solid before:border-current/25 before:border-t-current before:animate-spin motion-reduce:before:animate-none',
  lg: 'relative [&>*]:opacity-0 before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:size-icon-lg before:rounded-pill before:border-[length:calc(var(--spacing-icon-lg)/7)] before:border-solid before:border-current/25 before:border-t-current before:animate-spin motion-reduce:before:animate-none',
};

/** 아이콘만 있는 버튼은 가로 여백을 빼고 정사각으로 만든다. */
const ICON_ONLY: Record<Size, string> = {
  sm: 'w-control-sm px-0',
  md: 'w-control-md px-0',
  lg: 'w-control-lg px-0',
};

export interface ButtonProps extends useRender.ComponentProps<'button'> {
  /** 강조도. 기본 secondary — 한 화면에 primary는 보통 하나다. */
  intent?: Intent;
  size?: Size;
  /** 아이콘 하나만 들어갈 때. 반드시 aria-label을 함께 준다. */
  iconOnly?: boolean;
  /**
   * 기다리는 중. 글자 자리에 스피너가 돌고 버튼이 안 눌린다 — **너비는 그대로**다.
   * 글자는 바꾸지 않는다. 바꾸고 싶으면 children 을 쓰는 쪽에서 바꾼다.
   */
  loading?: boolean;
  /** 전체 너비. */
  fullWidth?: boolean;
}

/**
 * `render`로 다른 엘리먼트에 이 스타일을 입힐 수 있다 (<a>를 버튼처럼 보이게 하거나,
 * Dialog.Trigger / Menu.Trigger와 합성할 때).
 *
 *   <Button render={<a href="/docs" />}>문서</Button>
 *   <Dialog.Trigger render={<Button intent="primary" />}>열기</Dialog.Trigger>
 */
export function Button({
  intent = 'secondary',
  size = 'md',
  iconOnly,
  loading,
  fullWidth,
  disabled,
  className,
  render,
  type,
  ref,
  children,
  ...props
}: ButtonProps) {
  return useRender({
    defaultTagName: 'button',
    render,
    // ref는 반드시 여기로 넘긴다. props 안에 두면 유실되고, 그러면 Base UI가
    // 이 엘리먼트를 자기 트리거로 알아보지 못해 메뉴가 열렸다가 바로 닫힌다.
    ref,
    // state는 자동으로 data-* 어트리뷰트가 된다 (data-intent, data-size).
    // 스타일용이 아니라 디버깅·테스트·에이전트가 DOM에서 의도를 읽기 위한 것이다.
    state: { intent, size },
    // 받은 props를 그대로 펼친다. mergeProps로 한 번 더 감싸면 Base UI가 자기
    // 이벤트 핸들러를 알아보지 못해, Menu.Trigger로 합성했을 때 pointerdown으로
    // 열린 메뉴가 이어지는 click에서 바로 닫힌다.
    props: {
      type: type ?? 'button',
      // 기다리는 동안은 누를 수 없다. 두 번 눌려 두 번 제출되는 걸 막는 게 절반이다.
      disabled: disabled || loading,
      'aria-busy': loading || undefined,
      // INTENT 의 비활성 색을 빼내는 스위치. **반드시 참일 때만 붙인다** —
      // data-loading="false" 로 나가면 not-data-loading 이 깨져서 평범한 비활성
      // 버튼까지 비활성 색을 잃는다.
      'data-loading': loading || undefined,
      ...props,
      children: wrapText(children),
      className: cn(
        BASE, INTENT[intent], SIZE[size], ICON_EDGE[size],
        iconOnly && ICON_ONLY[size],
        loading && LOADING[size],
        fullWidth && 'w-full',
        className,
      ),
    },
  });
}
