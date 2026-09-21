import * as React from 'react';
import { Separator as Base } from '@base-ui/react/separator';
import { cn } from '../lib/cn';

/** 레이아웃 — Separator. 내용 사이 구분선. 의미상 구분이면 이걸, 장식이면 border 유틸리티를 쓴다. */
export interface SeparatorProps extends React.ComponentProps<typeof Base> {
  /** 선 중간에 들어가는 글자 ("또는"). 가로 방향에서만. */
  label?: React.ReactNode;
}

export function Separator({ orientation = 'horizontal', label, className, ...props }: SeparatorProps) {
  if (label != null && orientation === 'horizontal') {
    return (
      <div className={cn('flex w-full items-center gap-inline-md', className)} role="presentation">
        <Base orientation="horizontal" className="h-px flex-1 bg-border-default" {...props} />
        <span className="shrink-0 font-sans text-caption text-fg-subtle">{label}</span>
        <span aria-hidden className="h-px flex-1 bg-border-default" />
      </div>
    );
  }
  return (
    <Base
      orientation={orientation}
      className={cn('shrink-0 bg-border-default', orientation === 'horizontal' ? 'h-px w-full' : 'w-px self-stretch', className)}
      {...props}
    />
  );
}
