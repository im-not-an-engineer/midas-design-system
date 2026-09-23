import * as React from 'react';
import { Checkbox as Base } from '@base-ui/react/checkbox';
import { CheckboxGroup as BaseGroup } from '@base-ui/react/checkbox-group';
import { cn } from '../lib/cn';
import { Check, Minus } from '../lib/icons';
import type { Size } from '../lib/types';
import { SELECTION_BOX, SELECTION_BOX_SIZE, SELECTION_LABEL, SELECTION_LABEL_SIZE, SELECTION_GROUP, GROUP_LABEL, GROUP_DESCRIPTION } from '../lib/styles';

/**
 * 폼 컨트롤 가족 — Checkbox.
 *
 * 토큰 매핑:
 *   박스 크기         → --spacing-icon-{size}
 *   미체크 테두리/배경 → --color-field-border-default / --color-field-bg-default (Input과 동일)
 *   체크 배경         → --color-action-primary-bg-default,  표시 → --color-fg-on-accent
 *   invalid/disabled  → --color-field-border-invalid / --color-field-*-disabled
 *   모서리            → control 모서리의 절반 (16px 박스에 6px는 과하다)
 */

export interface CheckboxProps extends React.ComponentProps<typeof Base.Root> {
  size?: Size;
  /** 옆에 붙는 글자. 주면 <label>로 감싸 클릭 영역이 글자까지 넓어진다. */
  label?: React.ReactNode;
  /** 레이블 아래 보조 설명. */
  description?: React.ReactNode;
}

export function Checkbox({ size = 'md', label, description, className, ...props }: CheckboxProps) {
  const box = (
    <Base.Root
      data-size={size}
      className={cn(SELECTION_BOX, SELECTION_BOX_SIZE[size], 'rounded-[calc(var(--radius-control)/2)]', className)}
      {...props}
    >
      <Base.Indicator
        className="flex items-center justify-center text-fg-on-accent"
        render={(indicatorProps, state) => (
          <span {...indicatorProps}>{state.indeterminate ? <Minus className="size-full" aria-hidden /> : <Check className="size-full" aria-hidden />}</span>
        )}
      />
    </Base.Root>
  );
  if (label == null) return box;
  return (
    <label className={cn(SELECTION_LABEL, SELECTION_LABEL_SIZE[size], description != null && 'items-start')}>
      {box}
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

export interface CheckboxGroupProps extends React.ComponentProps<typeof BaseGroup> {
  /** 묶음 제목. 스크린리더에 그룹 이름으로 읽힌다. */
  label?: React.ReactNode;
  description?: React.ReactNode;
  orientation?: keyof typeof SELECTION_GROUP;
}

/**
 * 여러 Checkbox의 값을 배열 하나로 다룬다: value={['a','b']} onValueChange.
 * 항목 Checkbox에는 value를 준다. 전체 선택은 parent Checkbox + allValues로 (Base UI 문서 참고).
 */
export function CheckboxGroup({ label, description, orientation = 'vertical', className, children, ...props }: CheckboxGroupProps) {
  const id = React.useId();
  return (
    <div className="flex flex-col gap-stack-sm">
      {label != null && <span id={`${id}-label`} className={GROUP_LABEL}>{label}</span>}
      {description != null && <span id={`${id}-desc`} className={GROUP_DESCRIPTION}>{description}</span>}
      <BaseGroup
        aria-labelledby={label != null ? `${id}-label` : undefined}
        aria-describedby={description != null ? `${id}-desc` : undefined}
        className={cn(SELECTION_GROUP[orientation], className)}
        {...props}
      >
        {children}
      </BaseGroup>
    </div>
  );
}
