import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { cn } from '../lib/cn';
import { SURFACE_TITLE, TITLE_DESC_GAP } from '../lib/styles';

/**
 * 표시 가족 — Card. 내용을 담는 상자. 바닥에서 한 겹 올라온 면이다.
 *
 * 떠 있는 것이 아니다 — 링크에 올리면 뜨는 미리보기는 PreviewCard 이고, 이건 화면에
 * 그냥 놓여 있다. 대시보드 타일, 설정 화면의 구획, 목록의 한 칸 같은 자리다.
 *
 * 만들기 전에 같은 상자를 다섯 군데가 각자 그리고 있었고, 그중 넷이 계약 두께가 아니라
 * Tailwind 기본 `border`(1px 고정)를 썼다 — 두께 토큰을 바꿔도 그 상자들만 안 따라온다.
 *
 * 토큰 매핑:
 *   면      → --color-surface-raised
 *   테두리  → --color-border-default · --border-width-default
 *   모서리  → --radius-surface
 *   그림자  → --elevation-raised (기본 테마는 '없음', 켜는 테마에서만 보인다)
 *   안여백  → --spacing-inset-lg
 */

const BASE = [
  // 제목↔설명이 8px(TITLE_DESC_GAP)이라 덩어리 사이도 8px 이면 전부 같은 간격이 되어
  // 머리·본문·버튼줄이 한 덩어리로 보인다. 한 단계 벌려 12px.
  'flex flex-col gap-stack-lg',
  'rounded-surface border-width-default border-solid border-border-default',
  'bg-surface-raised shadow-raised p-inset-lg',
].join(' ');

/**
 * 통째로 누르는 카드.
 *
 * `w-full text-left no-underline` 은 <button>·<a> 로 바꿔 끼웠을 때를 위한 것이다 —
 * 버튼은 글자를 가운데로 몰고, 링크는 파란 밑줄을 긋는다. 카드는 둘 다 아니다.
 */
const INTERACTIVE = [
  'w-full text-left no-underline text-fg-default',
  'cursor-pointer select-none ax-focus-ring',
  'transition-colors duration-fast ease-standard',
  'hover:not-disabled:bg-surface-hover',
  'disabled:cursor-not-allowed data-disabled:cursor-not-allowed',
].join(' ');

export interface CardProps extends useRender.ComponentProps<'div'> {
  /**
   * 카드 전체가 하나의 동작이 된다.
   *
   * **반드시 `render` 로 `<a>` 나 `<button>` 을 함께 준다.** div 에 onClick 만 붙이면
   * 탭 키로 닿지 않고 화면 읽기 프로그램도 누를 수 있는 것으로 읽지 않는다.
   *
   *   <Card interactive render={<a href="/issues/241" />}>…</Card>
   */
  interactive?: boolean;
}

export function Card({ interactive, className, render, ref, ...props }: CardProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: { ...props, className: cn(BASE, interactive && INTERACTIVE, className) },
  });
}

export interface CardHeaderProps extends React.ComponentProps<'div'> {
  /**
   * 제목 줄 오른쪽에 붙는 것(메뉴 버튼, 배지).
   * 밖에서 감싸지 말고 반드시 여기로 준다 — 감싸면 제목과 설명의 세로 간격이 끊긴다.
   */
  action?: React.ReactNode;
}

export function CardHeader({ className, children, action, ...props }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-inline-md">
      <div className={cn('flex min-w-0 flex-col', TITLE_DESC_GAP, className)} {...props}>{children}</div>
      {action != null && (
        // 제목 '줄' 과 같은 높이의 상자를 만들어 그 안에서 가운데를 맞춘다. 그냥 items-start
        // 로 두면 배지가 제목보다 키가 커서 중심이 3~5px 아래로 내려간다.
        // 1lh 는 이 span 의 글자 크기·줄간격에서 나오므로 제목과 같은 값을 준다.
        <span className={cn('flex h-[1lh] shrink-0 items-center', SURFACE_TITLE)}>{action}</span>
      )}
    </div>
  );
}

/** 기본은 h3. 문서의 제목 단계가 다르면 `render={<h2 />}` 로 바꾼다. */
export function CardTitle({ className, render, ref, ...props }: useRender.ComponentProps<'h3'>) {
  return useRender({
    defaultTagName: 'h3',
    render,
    ref,
    props: { ...props, className: cn(SURFACE_TITLE, className) },
  });
}

/**
 * 다이얼로그·드로어의 설명(`SURFACE_DESCRIPTION`, 본문 크기)보다 한 단계 작다.
 * 카드는 여러 장이 나란히 서는 자리라 설명까지 본문 크기면 제목이 안 도드라진다.
 */
export function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('text-caption leading-normal text-fg-muted', className)} {...props} />;
}

/** 본문. min-w-0 이 없으면 안에 든 긴 글자나 표가 카드를 밀어 넓힌다. */
export function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('min-w-0 text-body leading-normal text-fg-default', className)} {...props} />;
}

/** 버튼 줄. 순서는 [보조 … 주] 고정 — Dialog 와 같다. */
export function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex items-center justify-end gap-inline-md pt-inset-sm', className)} {...props} />;
}
