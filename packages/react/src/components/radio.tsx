import * as React from 'react';
import { Radio as Base } from '@base-ui/react/radio';
import { RadioGroup as BaseGroup } from '@base-ui/react/radio-group';
import { cn } from '../lib/cn';
import type { Size } from '../lib/types';
import { SELECTION_BOX, SELECTION_BOX_SIZE, SELECTION_LABEL, SELECTION_GROUP, GROUP_LABEL, GROUP_DESCRIPTION } from '../lib/styles';

/**
 * 폼 컨트롤 가족 — Radio. Checkbox와 같은 박스 스타일에 모서리만 원형.
 * 항상 RadioGroup 안에서 쓴다 — 단독 라디오는 의미가 없다.
 */

export interface RadioProps extends React.ComponentProps<typeof Base.Root> {
  size?: Size;
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export function Radio({ size = 'md', label, description, className, ...props }: RadioProps) {
  const dot = (
    <Base.Root data-size={size} className={cn(SELECTION_BOX, SELECTION_BOX_SIZE[size], 'rounded-pill', className)} {...props}>
      <Base.Indicator className="block size-[40%] rounded-pill bg-fg-on-accent" />
    </Base.Root>
  );
  if (label == null) return dot;
  return (
    <label className={cn(SELECTION_LABEL, description != null && 'items-start')}>
      {dot}
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

export interface RadioGroupProps extends React.ComponentProps<typeof BaseGroup> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  orientation?: keyof typeof SELECTION_GROUP;
}

export function RadioGroup({ label, description, orientation = 'vertical', className, children, ...props }: RadioGroupProps) {
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
