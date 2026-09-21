import * as React from 'react';
import { NumberField as Base } from '@base-ui/react/number-field';
import { cn } from '../lib/cn';
import type { Size } from '../lib/types';
import { FIELD_CONTROL } from '../lib/styles';

/**
 * 폼 컨트롤 가족 — NumberField. 숫자 입력 + 증감 버튼. 키보드 ↑↓, 휠, min/max/step은 Base UI가 한다.
 *
 * 테두리는 Group(컨테이너)에 두고 Input은 투명하게 — 버튼과 입력이 한 컨트롤로 보이게.
 * 버튼 너비 = 컨트롤 높이(정사각), 그래서 아키타입을 바꿔도 비율이 유지된다.
 */

const MinusIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M3.5 8h9" /></svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M8 3.5v9M3.5 8h9" /></svg>
);

const GROUP_SIZE: Record<Size, string> = { sm: 'h-control-sm', md: 'h-control-md', lg: 'h-control-lg' };
const STEP_SIZE: Record<Size, string> = { sm: 'w-control-sm', md: 'w-control-md', lg: 'w-control-lg' };

const STEP_BUTTON = [
  'flex shrink-0 items-center justify-center self-stretch',
  'text-fg-muted cursor-pointer select-none transition-colors duration-fast ease-standard',
  'hover:not-disabled:bg-surface-hover hover:not-disabled:text-fg-default',
  'disabled:text-fg-disabled disabled:cursor-not-allowed',
  'ax-focus-ring [&_svg]:size-icon-sm',
].join(' ');

export interface NumberFieldProps extends React.ComponentProps<typeof Base.Root> {
  size?: Size;
  placeholder?: string;
}

export function NumberField({ size = 'md', placeholder, className, ...props }: NumberFieldProps) {
  return (
    <Base.Root {...props}>
      <Base.Group
        data-size={size}
        className={cn(FIELD_CONTROL, 'inline-flex items-stretch overflow-hidden p-0', GROUP_SIZE[size], className)}
      >
        <Base.Decrement aria-label="감소" className={cn(STEP_BUTTON, STEP_SIZE[size], 'border-r border-solid border-border-subtle')}>
          <MinusIcon />
        </Base.Decrement>
        <Base.Input
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-center font-sans text-body leading-ui text-field-fg-default outline-none placeholder:text-field-fg-placeholder tabular-nums disabled:text-field-fg-disabled"
        />
        <Base.Increment aria-label="증가" className={cn(STEP_BUTTON, STEP_SIZE[size], 'border-l border-solid border-border-subtle')}>
          <PlusIcon />
        </Base.Increment>
      </Base.Group>
    </Base.Root>
  );
}
