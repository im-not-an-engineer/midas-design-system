import * as React from 'react';
import { PageHeader, SURFACE } from '../_page-header';
import { cn } from '@/lib/ax/cn';
import { pickRegion, type Slot, type StateSlot, type ShellState } from '../_slot';

/**
 * 단계형 입력 셸. 순서가 있는 입력을 한 단계씩 채운다 — 앞 단계의 답이 다음 단계를 바꿀 때.
 *   제목 줄 → 단계 표시 → 지금 단계 본문 → 바닥 버튼 줄 [이전] … [다음/완료]
 * current 가 steps.length 와 같으면 done(완료 화면)이 선다.
 */
export interface WizardShellProps {
  state: ShellState;
  title: Slot;
  description?: Slot;
  steps: string[];
  /** 지금 단계 (0 부터) */
  current: number;
  notice?: Slot;
  /** 확장 자리: 본문 위 한 줄 (요약 카드 줄 등) */
  lead?: Slot;
  body: Slot;
  footer: Slot;
  done: Slot;
  empty: StateSlot;
  error: StateSlot;
  loading: StateSlot;
}

export function WizardShell(p: WizardShellProps) {
  const finished = p.current >= p.steps.length;
  const ready = finished ? (
    <div data-slot="done" className={`${SURFACE} p-inset-xl`}>{p.done}</div>
  ) : (
    <div className={`${SURFACE} flex flex-col`}>
      <div className="flex flex-col gap-stack-lg p-inset-xl">
        {p.notice && <div data-slot="notice">{p.notice}</div>}
        {p.lead && <div data-slot="lead">{p.lead}</div>}
        <div data-slot="body">{p.body}</div>
      </div>
      <div data-slot="footer" className="flex items-center justify-between gap-inline-md border-t border-solid border-border-subtle bg-surface-subtle px-inset-xl py-inset-md">
        {p.footer}
      </div>
    </div>
  );
  return (
    <section data-shell="wizard" data-shell-state={p.state} className="flex max-w-[880px] flex-col gap-section-sm">
      <PageHeader title={p.title} description={p.description} />
      <ol aria-label="단계" data-slot="steps" className="flex flex-wrap items-center gap-inline-lg">
        {p.steps.map((label, i) => (
          <li key={label} aria-current={i === p.current ? 'step' : undefined} className="flex items-center gap-inline-sm">
            <span
              className={cn(
                'flex size-icon-lg items-center justify-center rounded-pill text-caption font-semibold',
                i < p.current ? 'bg-action-primary-bg-default text-fg-on-accent'
                  : i === p.current ? 'border-width-strong border-solid border-action-primary-bg-default text-fg-link'
                  : 'bg-surface-sunken text-fg-muted',
              )}
            >
              {i + 1}
            </span>
            <span className={cn('text-body', i === p.current ? 'font-semibold text-fg-default' : 'text-fg-muted')}>{label}</span>
          </li>
        ))}
      </ol>
      <div data-slot="region">{pickRegion(p.state, ready, p)}</div>
    </section>
  );
}
