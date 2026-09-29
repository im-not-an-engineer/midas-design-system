import * as React from 'react';
import { PageHeader } from '../_page-header';
import { renderState, type Slot, type StateSlot, type ShellState } from '../_slot';

/**
 * 검토 대기열 셸 — 한 건씩 판정한다.
 *   제목 줄(+진행) → [가운데: 지금 건 | 옆: 대기 목록] → 바닥에 고정된 판정 줄
 * 판정 줄은 지금 건에 대한 결정(승인·반려 …)만 둔다. 다 처리하면 empty 가 선다.
 */
export interface ReviewQueueShellProps {
  state: ShellState;
  title: Slot;
  /** 화면 위 알림 자리 — 동작 실패(화면 안 알림) 등 */
  notice?: Slot;
  /** 확장 자리: 본문 위 한 줄 (요약 카드 줄 등) */
  lead?: Slot;
  /** "12건 중 3번째" 같은 진행 */
  progress: Slot;
  actions?: Slot;
  item: Slot;
  decision: Slot;
  /** 대기 목록·처리 이력 */
  side?: Slot;
  empty: StateSlot;
  error: StateSlot;
  loading: StateSlot;
}

export function ReviewQueueShell(p: ReviewQueueShellProps) {
  const ready = p.state === 'ready';
  const region =
    p.state === 'empty' ? renderState(p.empty)
    : p.state === 'error' ? renderState(p.error)
    : p.state === 'loading' ? renderState(p.loading)
    : p.item;
  return (
    <section data-shell="review-queue" data-shell-state={p.state} className="flex flex-col gap-section-sm">
      <PageHeader title={p.title} aside={ready ? p.progress : null} actions={p.actions} />
      {p.notice && <div data-slot="notice">{p.notice}</div>}
      {p.lead && <div data-slot="lead">{p.lead}</div>}
      <div className="flex items-start gap-inline-lg">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-surface border-width-default border-solid border-border-default bg-surface-base">
          <div data-slot="region" className="p-inset-lg">{region}</div>
          {ready && (
            <div data-slot="decision" className="sticky bottom-0 flex items-center justify-end gap-inline-md border-t border-solid border-border-subtle bg-surface-subtle px-inset-lg py-inset-md">
              {p.decision}
            </div>
          )}
        </div>
        {p.side && <aside data-slot="side" className="w-[300px] shrink-0">{p.side}</aside>}
      </div>
    </section>
  );
}
