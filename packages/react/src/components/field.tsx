import * as React from 'react';
import { Field as Base } from '@base-ui/react/field';
import { Input as BaseInput } from '@base-ui/react/input';
import { cn } from '../lib/cn';
import type { Size } from '../lib/types';
import { FIELD_CONTROL, FIELD_CONTROL_SIZE } from '../lib/styles';

/**
 * 레퍼런스 구현 #2 — 입력 컨트롤과 그 주변.
 *
 * 레이블·설명·에러의 연결(id, aria-describedby, aria-invalid)과 검증 상태는
 * Base UI Field가 전부 처리한다(①층). 에이전트가 가장 자주 빠뜨리는 게 이 연결인데,
 * 우리가 손으로 만들지 않아도 된다.
 *
 * 우리가 얹는 것은 토큰 바인딩과 size 하나뿐이다(③층).
 *
 * 토큰 매핑:
 *   배경/글자/테두리 → --color-field-*
 *   invalid 테두리   → --color-field-border-invalid   (data-invalid로 전환)
 *   높이             → --spacing-control-{size}
 *   레이블-입력 간격 → --spacing-stack-xs
 */

/**
 * size와 required는 Base UI Field에 없는 축이라 우리가 따로 내린다.
 * required를 Field에 한 번만 적으면 레이블의 * 표시와 컨트롤의 required 속성이
 * 같이 따라간다 — 두 군데 적다가 어긋나는 걸 막는다.
 */
const FieldCtx = React.createContext<{ size: Size; required: boolean }>({ size: 'md', required: false });
const useFieldCtx = () => React.useContext(FieldCtx);

export interface FieldProps extends React.ComponentProps<typeof Base.Root> {
  size?: Size;
  /** 필수 입력. 레이블에 표시가 붙고 컨트롤에 required가 설정된다. */
  required?: boolean;
}

export function Field({ size = 'md', required = false, className, ...props }: FieldProps) {
  const value = React.useMemo(() => ({ size, required }), [size, required]);
  return (
    <FieldCtx.Provider value={value}>
      <Base.Root data-size={size} className={cn('flex flex-col gap-inline-md', className)} {...props} />
    </FieldCtx.Provider>
  );
}

export function FieldLabel({ className, children, ...props }: React.ComponentProps<typeof Base.Label>) {
  const { required } = useFieldCtx();
  return (
    <Base.Label
      className={cn(
        // 레이블은 아래 글자(설명·에러, caption)보다 한 단계 크다.
        'font-sans text-body font-medium leading-ui text-fg-default',
        // 아래쪽(설명·에러)과는 6px. 레이블만 margin 2px 을 더해 입력칸과 8px 이 된다.
        'mb-stack-xs',
        'data-disabled:text-fg-disabled',
        className,
      )}
      {...props}
    >
      {children}
      {/* 별표 대신 점 — 별표는 글자라 폰트마다 크기·높이가 달라지고 글줄 위로 뜬다. */}
      {required && (
        <span aria-hidden className="ml-inline-xs inline-block size-inset-xs rounded-pill bg-fg-link align-middle" />
      )}
    </Base.Label>
  );
}

/** 보조 설명. 항상 보인다. */
export function FieldDescription({ className, ...props }: React.ComponentProps<typeof Base.Description>) {
  return <Base.Description className={cn('font-sans text-footnote leading-normal text-fg-muted', className)} {...props} />;
}

/**
 * 에러 메시지. 검증 실패일 때만 나타난다.
 * `match`로 특정 실패 사유에만 띄울 수 있다 (`match="valueMissing"` 등).
 */
export function FieldError({ className, ...props }: React.ComponentProps<typeof Base.Error>) {
  return <Base.Error className={cn('font-sans text-footnote leading-normal text-status-danger-fg', className)} {...props} />;
}


export interface InputProps extends Omit<React.ComponentProps<typeof BaseInput>, 'size'> {
  /** 생략하면 감싸는 Field의 size를 따른다. */
  size?: Size;
}

export function Input({ size, required, className, ...props }: InputProps) {
  const ctx = useFieldCtx();
  const s = size ?? ctx.size;
  return (
    <BaseInput
      data-size={s}
      required={required ?? ctx.required}
      className={cn(FIELD_CONTROL, FIELD_CONTROL_SIZE[s], className)}
      {...props}
    />
  );
}

export interface TextareaProps extends Omit<React.ComponentProps<'textarea'>, 'size'> {
  /** 생략하면 감싸는 Field의 size를 따른다. */
  size?: Size;
}

export function Textarea({ size, required, className, rows = 3, ...props }: TextareaProps) {
  const ctx = useFieldCtx();
  const s = size ?? ctx.size;
  // Field.Control이 id·aria 연결과 검증 상태를 담당하고, 실제 엘리먼트는 textarea로 바꾼다.
  return (
    <Base.Control
      render={<textarea rows={rows} required={required ?? ctx.required} {...props} />}
      data-size={s}
      className={cn(FIELD_CONTROL, 'h-auto px-inset-sm py-inset-sm resize-y', className)}
    />
  );
}
