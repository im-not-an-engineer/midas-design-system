import * as React from 'react';
import { PageHeader, SURFACE } from '../_page-header';
import { cn } from '@/lib/ax/cn';
import { pickRegion, type Slot, type StateSlot, type ShellState, Extended } from '../_slot';

/**
 * 가져오기 셸. 파일을 올리고 → 검증 결과를 확인하고 → 확정하는 고정된 세 단계.
 *   제목 줄 → 단계 표시(올리기 · 확인 · 완료) → 지금 단계 자리 → 바닥 버튼 줄
 * 단계는 셸이 정해 둔다 — 단계를 자유롭게 늘려야 하면 wizard 다.
 */
export type ImportPhase = 'upload' | 'review' | 'done';
const PHASES: { id: ImportPhase; label: string }[] = [
  { id: 'upload', label: '파일 올리기' },
  { id: 'review', label: '검증 결과 확인' },
  { id: 'done', label: '완료' },
];

export interface ImportShellProps {
  state: ShellState;
  title: Slot;
  /** 화면 위 알림 자리 — 동작 실패(화면 안 알림) 등 */
  notice?: Slot;
  /** 확장 자리: 본문 위 한 줄 (요약 카드 줄 등) */
  lead?: Slot;
  /** 확장 자리: 본문 오른쪽 칸 */
  side?: Slot;
  description?: Slot;
  phase: ImportPhase;
  upload: Slot;
  review: Slot;
  done: Slot;
  /** 지금 단계의 버튼들 (완료 단계에서는 보통 없음) */
  footer?: Slot;
  empty: StateSlot;
  error: StateSlot;
  loading: StateSlot;
}

export function ImportShell(p: ImportShellProps) {
  const at = PHASES.findIndex((x) => x.id === p.phase);
  const body = p.phase === 'upload' ? p.upload : p.phase === 'review' ? p.review : p.done;
  const ready = (
    <div className={`${SURFACE} flex flex-col`}>
      <div data-slot={p.phase} className="p-inset-xl">{body}</div>
      {p.footer && (
        <div data-slot="footer" className="flex items-center justify-end gap-inline-md border-t border-solid border-border-subtle bg-surface-subtle px-inset-xl py-inset-md">{p.footer}</div>
      )}
    </div>
  );
  return (
    <section data-shell="import" data-shell-state={p.state} className="flex max-w-[960px] flex-col gap-section-sm">
      <PageHeader title={p.title} description={p.description} />
      {p.notice && <div data-slot="notice">{p.notice}</div>}
      <Extended lead={p.lead} side={p.side}>
        <ol aria-label="단계" data-slot="steps" className="flex items-center gap-inline-lg">
          {PHASES.map((x, i) => (
            <li key={x.id} aria-current={i === at ? 'step' : undefined} className={cn('text-body', i === at ? 'font-semibold text-fg-default' : 'text-fg-muted')}>
              {i + 1}. {x.label}
            </li>
          ))}
        </ol>
        <div data-slot="region">{pickRegion(p.state, ready, p)}</div>
      </Extended>
    </section>
  );
}
