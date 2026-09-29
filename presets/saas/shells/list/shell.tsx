import * as React from 'react';
import { PageHeader } from '../_page-header';
import { renderState, type Slot, type StateSlot, type ShellState, Extended } from '../_slot';

/**
 * 목록 관리 셸.
 *   제목 줄 → 필터 줄 → (골랐을 때만) 일괄 작업 줄 → 본문(표) → 바닥 줄
 * 본문 자리는 상태에 따라 body / empty / error / loading 중 하나가 선다.
 */
export interface ListShellProps {
  state: ShellState;
  title: Slot;
  /** 화면 위 알림 자리 — 동작 실패(화면 안 알림) 등 */
  notice?: Slot;
  /** 확장 자리: 본문 위 한 줄 (요약 카드 줄 등) */
  lead?: Slot;
  /** 확장 자리: 본문 오른쪽 칸 */
  side?: Slot;
  description?: Slot;
  actions?: Slot;
  filters: Slot;
  /** 일괄 작업 줄. 넘기면 필터 줄 아래에 선다 — 언제 넘길지는 정책이 정한다. */
  bulkBar?: Slot;
  body: Slot;
  footer?: Slot;
  empty: StateSlot;
  error: StateSlot;
  loading: StateSlot;
}

export function ListShell(p: ListShellProps) {
  const region =
    p.state === 'empty' ? renderState(p.empty)
    : p.state === 'error' ? renderState(p.error)
    : p.state === 'loading' ? renderState(p.loading)
    : p.body;
  return (
    <section data-shell="list" data-shell-state={p.state} className="flex flex-col gap-section-sm">
      <PageHeader title={p.title} description={p.description} actions={p.actions} />
      {p.notice && <div data-slot="notice">{p.notice}</div>}
      <Extended lead={p.lead} side={p.side}>
        <div className="flex flex-col gap-stack-lg rounded-surface border-width-default border-solid border-border-default bg-surface-base p-inset-lg">
          <div data-slot="filters" className="flex flex-wrap items-end gap-inline-md">{p.filters}</div>
          {p.bulkBar && <div data-slot="bulk-bar">{p.bulkBar}</div>}
          <div data-slot="region">{region}</div>
          {p.footer && p.state === 'ready' && <div data-slot="footer" className="flex items-center justify-between gap-inline-md">{p.footer}</div>}
        </div>
      </Extended>
    </section>
  );
}
