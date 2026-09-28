import * as React from 'react';
import { cn } from '../lib/cn';
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from '../lib/icons';
import { TITLE_DESC_GAP } from '../lib/styles';
import type { Status } from '../lib/types';

/**
 * 표시 가족 — Alert. 화면 안에 자리를 차지하고 머무는 알림 띠다.
 *
 * 떠올랐다 사라지는 건 Toast, 멈춰 세우고 답을 받는 건 AlertDialog 다. 이건 셋 중
 * 가장 조용한 쪽 — 페이지를 열면 이미 거기 있고, 읽든 말든 흐름을 막지 않는다.
 *
 * 토큰 매핑:
 *   면·테두리 → --color-status-{status}-{subtle|border}
 *   아이콘     → --color-status-{status}-fg
 *   글자       → --color-fg-{default|muted}  (상태색을 글자에 칠하지 않는다 — 아래 참고)
 *   모서리     → --radius-surface
 *   안여백     → --spacing-inset-lg
 *
 * 그림은 icon-md(16px)다. lucide 의 선이 화면에서 1.33px 이라 얇아 보인다는 이야기가
 * 나와 20px 로 키워봤는데, 사람이 보고 **원래 크기가 낫다**고 정했다. 굵기는 지금이
 * 맞다 — 굵기 자체는 lib/icons 의 약속대로 lucide 기본값 2를 그대로 둔다.
 *
 * 글자를 상태색으로 칠하지 않는 이유: 띠 전체가 이미 그 색으로 물들어 있어서,
 * 글자까지 같은 계열이면 대비가 떨어지고 긴 문장이 읽기 힘들어진다. 색은 아이콘과
 * 면이 맡고 글자는 평소 색을 쓴다.
 */

const TONE: Record<Status, string> = {
  info: 'bg-status-info-subtle border-status-info-border',
  success: 'bg-status-success-subtle border-status-success-border',
  warning: 'bg-status-warning-subtle border-status-warning-border',
  danger: 'bg-status-danger-subtle border-status-danger-border',
};

const ICON_TONE: Record<Status, string> = {
  info: 'text-status-info-fg',
  success: 'text-status-success-fg',
  warning: 'text-status-warning-fg',
  danger: 'text-status-danger-fg',
};

/** 상태마다 정해진 그림. 보간으로 만들지 않는다(규칙 1-1) — 룩업 맵이다. */
const ICON: Record<Status, React.ReactNode> = {
  info: <Info aria-hidden />,
  success: <CircleCheck aria-hidden />,
  warning: <TriangleAlert aria-hidden />,
  danger: <CircleAlert aria-hidden />,
};

/**
 * 화면 읽기 프로그램에 어떻게 알릴지. 경고·위험은 하던 일을 끊고 읽어주고,
 * 정보·성공은 하던 말이 끝난 뒤에 읽어준다.
 */
const ROLE: Record<Status, 'status' | 'alert'> = {
  info: 'status', success: 'status', warning: 'alert', danger: 'alert',
};

// <div> 의 기본 title(마우스를 올리면 뜨는 말풍선)은 문자열만 받는다. 우리 title 은
// 마크업도 받으므로 그 하나만 빼고 물려받는다.
export interface AlertProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  status?: Status;
  /** 첫 줄 굵은 글자. 없으면 설명만 한 줄로 선다. */
  title?: React.ReactNode;
  /**
   * 왼쪽 그림. 빼려면 `icon={null}`.
   * 기본은 상태마다 정해진 것이고, 다른 걸 주면 그걸 쓴다.
   */
  icon?: React.ReactNode;
  /** 글 아래 버튼 줄. 여기 넣어야 그림 너비만큼 들여쓰기가 맞는다. */
  action?: React.ReactNode;
  /** 주면 오른쪽 위에 닫기 단추가 생긴다. */
  onClose?: () => void;
  /** 닫기 단추의 이름. 화면 읽기 프로그램이 읽는다. */
  closeLabel?: string;
}

export function Alert({
  status = 'info',
  title,
  icon,
  action,
  onClose,
  closeLabel = '닫기',
  className,
  children,
  ...props
}: AlertProps) {
  const mark = icon === undefined ? ICON[status] : icon;
  return (
    <div
      role={ROLE[status]}
      className={cn(
        'flex w-full items-start gap-inline-lg',
        'rounded-surface border-width-default border-solid p-inset-lg',
        'font-sans text-body leading-normal text-fg-default',
        TONE[status],
        className,
      )}
      {...props}
    >
      {mark != null && (
        // 그림을 '글자 한 줄 높이' 상자에 넣어 첫 줄과 중심을 맞춘다. 그냥 두면 글이
        // 여러 줄일 때 그림만 위로 붙어 보인다.
        <span className={cn('flex h-[1lh] shrink-0 items-center [&_svg]:size-icon-md', ICON_TONE[status])}>{mark}</span>
      )}
      <div className={cn('flex min-w-0 flex-1 flex-col', TITLE_DESC_GAP)}>
        {/* 본문(13px)보다 한 칸 위. 제목 사다리의 맨 아래로, 줄 안에 서는 제목 자리다. */}
        {title != null && <p className="text-heading-xs font-semibold text-fg-default">{title}</p>}
        {children != null && <div className={cn('min-w-0', title != null && 'text-fg-muted')}>{children}</div>}
        {action != null && <div className="flex items-center gap-inline-lg pt-inset-xs">{action}</div>}
      </div>
      {onClose != null && (
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className={cn(
            'flex h-[1lh] shrink-0 items-center rounded-control text-fg-muted',
            'cursor-pointer transition-colors duration-fast ease-standard ax-focus-ring',
            'hover:text-fg-default [&_svg]:size-icon-sm',
          )}
        >
          <X aria-hidden />
        </button>
      )}
    </div>
  );
}
