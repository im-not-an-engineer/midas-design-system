import * as React from 'react';
import { PageHeader } from '../_page-header';
import { renderState, type Slot, type StateSlot, type ShellState } from '../_slot';

/**
 * 목록 + 옆 상세 셸.
 *   제목 줄 → [왼쪽: 목록 칸 | 오른쪽: 상세 칸]
 * 목록 칸은 상태에 따라 list / empty / error / loading 중 하나가 서고,
 * 상세 칸은 고른 것이 없으면 noSelection 이 선다.
 */
export interface ListDetailShellProps {
  state: ShellState;
  title: Slot;
  /** 화면 위 알림 자리 — 동작 실패(화면 안 알림) 등 */
  notice?: Slot;
  /** 확장 자리: 본문 위 한 줄 (요약 카드 줄 등) */
  lead?: Slot;
  description?: Slot;
  actions?: Slot;
  listFilters?: Slot;
  list: Slot;
  /** 고른 항목의 상세. 고른 것이 없으면 null */
  detail: Slot | null;
  noSelection: StateSlot;
  empty: StateSlot;
  error: StateSlot;
  loading: StateSlot;
}

export function ListDetailShell(p: ListDetailShellProps) {
  const listRegion =
    p.state === 'empty' ? renderState(p.empty)
    : p.state === 'error' ? renderState(p.error)
    : p.state === 'loading' ? renderState(p.loading)
    : p.list;
  return (
    <section data-shell="list-detail" data-shell-state={p.state} className="flex flex-col gap-section-sm">
      <PageHeader title={p.title} description={p.description} actions={p.actions} />
      {p.notice && <div data-slot="notice">{p.notice}</div>}
      {p.lead && <div data-slot="lead">{p.lead}</div>}
      <div className="flex min-h-[60vh] overflow-hidden rounded-surface border-width-default border-solid border-border-default bg-surface-base">
        <div data-slot="list-pane" className="flex w-[360px] shrink-0 flex-col gap-stack-md border-r border-solid border-border-subtle p-inset-md">
          {p.listFilters && <div data-slot="list-filters" className="flex flex-col gap-stack-sm">{p.listFilters}</div>}
          <div data-slot="region" className="min-h-0 flex-1">{listRegion}</div>
        </div>
        <div data-slot="detail-pane" className="min-w-0 flex-1 p-inset-lg">
          {p.state === 'ready' && p.detail != null ? p.detail : renderState(p.noSelection)}
        </div>
      </div>
    </section>
  );
}
