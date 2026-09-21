import * as React from 'react';
import { Avatar as Base } from '@base-ui/react/avatar';
import { cn } from '../lib/cn';

/**
 * 표시 가족 — Avatar. 사람·조직의 얼굴. 이미지가 없거나 실패하면 이름 첫 글자.
 * 크기는 컨트롤 급(sm/md/lg = control 높이)이라 버튼·입력과 한 줄에 놓아도 맞고, xs는 아이콘 급(인라인 멘션).
 */

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';
const SIZE: Record<AvatarSize, string> = {
  xs: 'size-icon-lg text-caption',
  sm: 'size-control-sm text-caption',
  md: 'size-control-md text-body',
  lg: 'size-control-lg text-body-lg',
};

export interface AvatarProps extends React.ComponentProps<typeof Base.Root> {
  src?: string;
  alt?: string;
  /** 이미지가 없을 때 첫 글자를 뽑는 이름. */
  name?: string;
  size?: AvatarSize;
}

const initial = (name?: string) => (name ?? '').trim().charAt(0).toUpperCase() || '?';

export function Avatar({ src, alt, name, size = 'md', className, children, ...props }: AvatarProps) {
  return (
    <Base.Root
      data-size={size}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-pill select-none',
        'bg-surface-sunken font-sans font-medium leading-ui text-fg-muted',
        SIZE[size],
        className,
      )}
      {...props}
    >
      {src && <Base.Image src={src} alt={alt ?? name ?? ''} className="size-full object-cover" />}
      <Base.Fallback className="flex size-full items-center justify-center" aria-hidden={!!alt}>
        {children ?? initial(name)}
      </Base.Fallback>
    </Base.Root>
  );
}

/** 여러 아바타 겹치기. 앞사람이 위. */
export function AvatarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex items-center -space-x-inset-xs [&>*]:ring-2 [&>*]:ring-surface-base', className)} {...props} />;
}
