import * as React from 'react';
import { Toolbar as Base } from '@base-ui/react/toolbar';
import { cn } from '../lib/cn';
import { FIELD_CONTROL } from '../lib/styles';

/**
 * 내비 가족 — Toolbar. 한 줄에 놓인 컨트롤 묶음(서식 도구, 목록 상단 액션). 방향키로 항목 사이를 이동한다.
 * 안에는 ToolbarButton / ToolbarGroup / ToolbarSeparator를, 셀렉트 같은 건 ToolbarButton render로 감싼다.
 */

export function Toolbar({ className, ...props }: React.ComponentProps<typeof Base.Root>) {
  return (
    <Base.Root
      className={cn(
        'inline-flex w-fit items-center gap-inline-xs rounded-surface border border-solid border-border-default bg-surface-raised p-inset-xs',
        'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
        className,
      )}
      {...props}
    />
  );
}

export const ToolbarGroup = ({ className, ...props }: React.ComponentProps<typeof Base.Group>) => (
  <Base.Group className={cn('flex items-center gap-inline-xs', className)} {...props} />
);

/** 도구 버튼. 눌린 상태(Toggle과 조합)면 selected 면이 깔린다. */
export function ToolbarButton({ className, ...props }: React.ComponentProps<typeof Base.Button>) {
  return (
    <Base.Button
      className={cn(
        'inline-flex h-control-sm min-w-control-sm items-center justify-center gap-inline-xs px-inset-sm rounded-control',
        'font-sans text-body leading-ui text-fg-default select-none cursor-pointer',
        'transition-colors duration-fast ease-standard ax-focus-ring',
        'hover:not-disabled:bg-surface-hover data-pressed:bg-surface-selected',
        // 비활성이면 눌림 글자색을 죽인다 — 안 그러면 Tailwind 순서상 data-pressed 가 이겨
        // 못 누르는 버튼이 눌린 것처럼 진하게 보인다.
        'data-pressed:not-disabled:not-data-disabled:text-fg-default',
        'disabled:text-fg-disabled disabled:cursor-not-allowed data-disabled:text-fg-disabled',
        '[&_svg]:size-icon-sm',
        className,
      )}
      {...props}
    />
  );
}

export const ToolbarLink = ({ className, ...props }: React.ComponentProps<typeof Base.Link>) => (
  <Base.Link className={cn('inline-flex h-control-sm items-center px-inset-sm rounded-control font-sans text-body text-fg-link no-underline ax-focus-ring hover:underline', className)} {...props} />
);

export const ToolbarInput = ({ className, ...props }: React.ComponentProps<typeof Base.Input>) => (
  <Base.Input className={cn(FIELD_CONTROL, 'h-control-sm w-auto px-inset-sm', className)} {...props} />
);

export const ToolbarSeparator = ({ className, ...props }: React.ComponentProps<typeof Base.Separator>) => (
  <Base.Separator className={cn('mx-inset-xs h-icon-lg w-px bg-border-default data-[orientation=horizontal]:mx-0 data-[orientation=horizontal]:my-inset-xs data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full', className)} {...props} />
);
