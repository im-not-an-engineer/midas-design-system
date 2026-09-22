import * as React from 'react';
import { Switch as Base } from '@base-ui/react/switch';
import { cn } from '../lib/cn';
import type { Size } from '../lib/types';
import { SELECTION_LABEL, SELECTION_LABEL_SIZE, GROUP_DESCRIPTION } from '../lib/styles';

/**
 * 폼 컨트롤 가족 — Switch. 즉시 적용되는 켬/끔. 저장 버튼이 따로 있으면 Checkbox를 쓴다.
 *
 * 크기는 새 토큰 없이 아이콘 급에서 나온다:
 *   트랙 높이 = --spacing-icon-{size},  너비 = 높이 × 1.75
 *   썸        = 트랙 높이 - inset-xs   → 위아래 틈이 inset-xs 의 절반씩
 *
 * 예전에는 트랙이 한 단계 위(icon-{size+1})였는데, 아이콘 사다리 간격이 고르지 않아
 * (14/16/20) 크기마다 틈이 1px~2px 로 들쭉날쭉했고 md 트랙이 레이블 글자보다 커졌다.
 * 틈을 여백 토큰에서 가져오면 세 크기가 같은 비율로 맞고 sm 도 표현된다.
 */

const TRACK: Record<Size, string> = {
  sm: 'h-icon-sm w-[calc(var(--spacing-icon-sm)*1.75)]',
  md: 'h-icon-md w-[calc(var(--spacing-icon-md)*1.75)]',
  lg: 'h-icon-lg w-[calc(var(--spacing-icon-lg)*1.75)]',
};
// 켠 위치 = 높이×0.75 + 틈/2 (= 너비 - 썸 - 틈/2 를 푼 것).
const THUMB: Record<Size, string> = {
  sm: 'size-[calc(var(--spacing-icon-sm)-var(--spacing-inset-xs))] translate-x-[calc(var(--spacing-inset-xs)/2)] data-checked:translate-x-[calc(var(--spacing-icon-sm)*0.75+var(--spacing-inset-xs)/2)]',
  md: 'size-[calc(var(--spacing-icon-md)-var(--spacing-inset-xs))] translate-x-[calc(var(--spacing-inset-xs)/2)] data-checked:translate-x-[calc(var(--spacing-icon-md)*0.75+var(--spacing-inset-xs)/2)]',
  lg: 'size-[calc(var(--spacing-icon-lg)-var(--spacing-inset-xs))] translate-x-[calc(var(--spacing-inset-xs)/2)] data-checked:translate-x-[calc(var(--spacing-icon-lg)*0.75+var(--spacing-inset-xs)/2)]',
};

export interface SwitchProps extends React.ComponentProps<typeof Base.Root> {
  size?: Size;
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export function Switch({ size = 'md', label, description, className, ...props }: SwitchProps) {
  const track = (
    <Base.Root
      data-size={size}
      className={cn(
        'relative inline-flex shrink-0 items-center rounded-pill',
        'border border-solid border-border-strong bg-border-strong',
        'transition-colors duration-fast ease-standard cursor-pointer ax-focus-ring',
        'data-checked:bg-action-primary-bg-default data-checked:border-action-primary-bg-default',
        'data-invalid:border-field-border-invalid',
        'data-disabled:cursor-not-allowed data-disabled:bg-field-border-disabled data-disabled:border-field-border-disabled',
        'data-disabled:data-checked:bg-action-primary-bg-disabled data-disabled:data-checked:border-action-primary-bg-disabled',
        TRACK[size],
        className,
      )}
      {...props}
    >
      <Base.Thumb className={cn('block rounded-pill bg-fg-on-accent shadow-raised transition-transform duration-fast ease-standard', THUMB[size])} />
    </Base.Root>
  );
  if (label == null) return track;
  return (
    <label className={cn(SELECTION_LABEL, SELECTION_LABEL_SIZE[size], description != null && 'items-start')}>
      {track}
      {description == null ? (
        label
      ) : (
        <span className="flex flex-col gap-stack-xs">
          <span>{label}</span>
          <span className={GROUP_DESCRIPTION}>{description}</span>
        </span>
      )}
    </label>
  );
}
