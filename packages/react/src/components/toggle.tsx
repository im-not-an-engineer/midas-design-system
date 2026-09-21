import * as React from 'react';
import { Toggle as Base } from '@base-ui/react/toggle';
import { ToggleGroup as BaseGroup } from '@base-ui/react/toggle-group';
import { cn } from '../lib/cn';
import type { Size } from '../lib/types';

/**
 * 내비 가족 — Toggle / ToggleGroup. 켬·끔이 있는 버튼(굵게, 즐겨찾기) 과 그 묶음(정렬 좌·중·우, 보기 방식).
 * 설정값의 켬/끔은 Switch, 폼 제출 값은 Checkbox — Toggle은 '즉시 반영되는 뷰 상태'다.
 *
 * ToggleGroup 안에 들어가면 세그먼트 컨트롤 모양(한 덩어리, 눌린 조각이 떠 보임)이 된다.
 */

const InGroup = React.createContext(false);

const SIZE: Record<Size, string> = {
  sm: 'h-control-sm min-w-control-sm px-inset-sm [&_svg]:size-icon-sm',
  md: 'h-control-md min-w-control-md px-inset-md [&_svg]:size-icon-md',
  lg: 'h-control-lg min-w-control-lg px-inset-lg [&_svg]:size-icon-lg',
};

export interface ToggleProps extends React.ComponentProps<typeof Base> {
  size?: Size;
}

export function Toggle({ size = 'md', className, ...props }: ToggleProps) {
  const inGroup = React.useContext(InGroup);
  return (
    <Base
      data-size={size}
      className={cn(
        'inline-flex items-center justify-center gap-inline-sm rounded-control',
        'font-sans text-body font-medium leading-ui select-none cursor-pointer',
        'transition-colors duration-fast ease-standard ax-focus-ring',
        'data-disabled:text-fg-disabled data-disabled:cursor-not-allowed',
        inGroup
          ? // 세그먼트: 안 눌린 건 투명, 눌린 건 떠 있는 면
            'text-fg-muted hover:not-data-disabled:not-data-pressed:text-fg-default data-pressed:bg-surface-raised data-pressed:text-fg-default data-pressed:shadow-raised'
          : // 단독: 테두리 있는 버튼, 눌리면 selected 면
            'border border-solid border-border-default bg-surface-base text-fg-muted hover:not-data-disabled:bg-surface-hover hover:not-data-disabled:text-fg-default data-pressed:bg-surface-selected data-pressed:border-action-primary-bg-default data-pressed:text-fg-default',
        SIZE[size],
        className,
      )}
      {...props}
    />
  );
}

export interface ToggleGroupProps extends React.ComponentProps<typeof BaseGroup> {}

export function ToggleGroup({ className, children, ...props }: ToggleGroupProps) {
  return (
    <InGroup.Provider value>
      <BaseGroup
        className={cn(
          'inline-flex w-fit items-center gap-inline-xs rounded-control border border-solid border-border-default bg-surface-sunken p-inset-xs',
          'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
          className,
        )}
        {...props}
      >
        {children}
      </BaseGroup>
    </InGroup.Provider>
  );
}
