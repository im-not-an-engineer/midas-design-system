import * as React from 'react';
import { Switch as Base } from '@base-ui/react/switch';
import { cn } from '../lib/cn';
import type { Size } from '../lib/types';
import { SELECTION_LABEL, GROUP_DESCRIPTION } from '../lib/styles';

/**
 * 폼 컨트롤 가족 — Switch. 즉시 적용되는 켬/끔. 저장 버튼이 따로 있으면 Checkbox를 쓴다.
 *
 * 크기는 새 토큰 없이 아이콘 급에서 나온다:
 *   트랙 높이 = --spacing-icon-{size+1},  썸 = --spacing-icon-{size}  → 위아래 여백이 아키타입마다 자연히 맞는다
 *   트랙 너비 = 높이 × 1.75
 */

const TRACK: Record<Size, string> = {
  sm: 'h-icon-md w-[calc(var(--spacing-icon-md)*1.75)]',
  md: 'h-icon-lg w-[calc(var(--spacing-icon-lg)*1.75)]',
  lg: 'h-[calc(var(--spacing-icon-lg)*1.25)] w-[calc(var(--spacing-icon-lg)*1.25*1.75)]',
};
const THUMB: Record<Size, string> = {
  sm: 'size-icon-sm translate-x-[calc((var(--spacing-icon-md)-var(--spacing-icon-sm))/2)] data-checked:translate-x-[calc(var(--spacing-icon-md)*1.75-var(--spacing-icon-sm)-(var(--spacing-icon-md)-var(--spacing-icon-sm))/2)]',
  md: 'size-icon-md translate-x-[calc((var(--spacing-icon-lg)-var(--spacing-icon-md))/2)] data-checked:translate-x-[calc(var(--spacing-icon-lg)*1.75-var(--spacing-icon-md)-(var(--spacing-icon-lg)-var(--spacing-icon-md))/2)]',
  lg: 'size-icon-lg translate-x-[calc(var(--spacing-icon-lg)*0.125)] data-checked:translate-x-[calc(var(--spacing-icon-lg)*1.25*1.75-var(--spacing-icon-lg)*1.125)]',
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
    <label className={cn(SELECTION_LABEL, description != null && 'items-start')}>
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
