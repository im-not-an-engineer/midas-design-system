import * as React from 'react';
import { Slider as Base } from '@base-ui/react/slider';
import { cn } from '../lib/cn';

/**
 * 폼 컨트롤 가족 — Slider. 범위 안의 값을 드래그로 고른다. 정확한 숫자가 중요하면 NumberField.
 *
 * 토큰 매핑 (새 토큰 없음):
 *   트랙 두께 = 아이콘 sm의 1/3 (workbench 4 / base ~4.7 / consumer ~5.3px)
 *   썸 크기   = --spacing-icon-lg,  채움·썸 테두리 = action.primary,  빈 트랙 = border.strong
 *   컨트롤 높이 = --spacing-control-sm — 다른 컨트롤과 한 줄에 놓아도 맞는다
 */

export interface SliderProps extends React.ComponentProps<typeof Base.Root> {
  /** 현재 값을 오른쪽에 표시. */
  showValue?: boolean;
}

export function Slider({ showValue, className, ...props }: SliderProps) {
  return (
    <Base.Root className={cn('flex w-full items-center gap-inline-md', className)} {...props}>
      <Base.Control className="relative flex h-control-sm w-full touch-none select-none items-center">
        <Base.Track className="relative h-[calc(var(--spacing-icon-sm)/3)] w-full rounded-pill bg-border-strong data-disabled:bg-field-border-disabled">
          <Base.Indicator className="rounded-pill bg-action-primary-bg-default data-disabled:bg-action-primary-bg-disabled" />
          <Base.Thumb
            className={cn(
              'size-icon-lg rounded-pill bg-fg-on-accent shadow-raised',
              'border-2 border-solid border-action-primary-bg-default',
              'transition-[box-shadow] duration-fast ease-standard',
              'data-dragging:shadow-overlay',
              'data-focused:outline-2 data-focused:outline-solid data-focused:outline-focus-ring data-focused:outline-offset-2',
              'data-disabled:border-action-primary-bg-disabled data-disabled:cursor-not-allowed',
            )}
          />
        </Base.Track>
      </Base.Control>
      {showValue && <Base.Value className="shrink-0 min-w-[3ch] text-right font-sans text-caption tabular-nums text-fg-muted" />}
    </Base.Root>
  );
}
