import * as React from 'react';
import { OTPField as Base } from '@base-ui/react/otp-field';
import { cn } from '../lib/cn';
import type { Size } from '../lib/types';
import { FIELD_CONTROL } from '../lib/styles';

/**
 * 폼 컨트롤 가족 — OTPField. 인증 코드처럼 자릿수가 정해진 입력. 붙여넣기·자동 이동은 Base UI가 한다.
 * 칸 하나 = 정사각 컨트롤(--spacing-control-{size}). 글자는 한 단계 크게.
 */

const CELL: Record<Size, string> = {
  sm: 'size-control-sm text-body',
  md: 'size-control-md text-body-lg',
  lg: 'size-control-lg text-heading-md',
};

export interface OTPFieldProps extends React.ComponentProps<typeof Base.Root> {
  size?: Size;
  /** 이 인덱스 뒤에 구분선을 넣는다. 예: length=6, separatorAfter=3 → 000-000 */
  separatorAfter?: number;
}

export function OTPField({ length, size = 'md', separatorAfter, className, ...props }: OTPFieldProps) {
  return (
    <Base.Root length={length} className={cn('inline-flex items-center gap-inline-sm', className)} {...props}>
      {Array.from({ length }, (_, i) => (
        <React.Fragment key={i}>
          {separatorAfter != null && i === separatorAfter && i !== 0 && (
            <Base.Separator className="px-inset-xs text-fg-subtle select-none">–</Base.Separator>
          )}
          <Base.Input
            data-size={size}
            className={cn(FIELD_CONTROL, 'w-auto p-0 text-center font-medium tabular-nums', CELL[size])}
          />
        </React.Fragment>
      ))}
    </Base.Root>
  );
}
