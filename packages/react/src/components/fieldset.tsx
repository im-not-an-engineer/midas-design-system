import * as React from 'react';
import { Fieldset as Base } from '@base-ui/react/fieldset';
import { Form as BaseForm } from '@base-ui/react/form';
import { cn } from '../lib/cn';

/**
 * 폼 골격 — Fieldset과 Form.
 *
 * Fieldset: 관련 필드 묶음에 제목을 붙인다. 스크린리더가 묶음 이름을 읽는다.
 * Form: 필드들의 검증 상태·에러 표시·제출을 조율한다(Base UI). 레이아웃은 세로 스택.
 *
 * 폼 화면의 골격은 이 둘 + Field로 짓는다. 에이전트가 <form>과 <div>로 직접 쌓으면
 * 에러 연결과 간격이 매번 달라진다.
 */

export interface FieldsetProps extends React.ComponentProps<typeof Base.Root> {
  legend?: React.ReactNode;
  description?: React.ReactNode;
}

export function Fieldset({ legend, description, className, children, ...props }: FieldsetProps) {
  return (
    <Base.Root className={cn('m-0 flex min-w-0 flex-col gap-stack-md border-0 p-0', className)} {...props}>
      {legend != null && (
        <Base.Legend className="p-0 font-sans text-heading-sm font-semibold leading-tight tracking-heading text-fg-default">
          {legend}
        </Base.Legend>
      )}
      {description != null && <p className="mt-stack-sm font-sans text-caption leading-normal text-fg-muted">{description}</p>}
      {children}
    </Base.Root>
  );
}

export type FormProps = React.ComponentProps<typeof BaseForm>;

/** 필드 사이 간격은 stack-lg, 섹션(Fieldset) 사이는 section-sm. */
export function Form({ className, ...props }: FormProps) {
  return <BaseForm className={cn('flex flex-col gap-stack-lg', className)} {...props} />;
}
