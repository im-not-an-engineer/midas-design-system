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
      // 세로 선은 부모 높이를 다 채우지 않는다(self-stretch ✗). 글줄 사이에 서는 선이라
      // 32px 은 너무 길었다 — Toolbar 구분선과 같은 icon-lg(20px)로 맞춘다. className 으로 덮을 수 있다.
      className={cn('shrink-0 bg-border-default', orientation === 'horizontal' ? 'h-px w-full' : 'h-icon-lg w-px', className)}
      {...props}
    />
  );
}
