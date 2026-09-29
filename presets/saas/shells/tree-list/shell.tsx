import * as React from 'react';
import { PageHeader, SURFACE } from '../_page-header';
import { pickRegion, renderState, type Slot, type StateSlot, type ShellState } from '../_slot';

/**
 * 왼쪽 트리 + 목록 셸. 폴더·조직처럼 **계층이 있는** 것을 왼쪽에서 고르고, 오른쪽에 그 안의 항목을 본다.
 *   제목 줄 → [왼쪽: 트리 + 트리 동작 | 오른쪽: 위치 · 필터 · 목록]
 * 트리에서 아무것도 고르지 않았으면 오른쪽에 noFolder 가 선다.
 */
export interface TreeListShellProps {
  state: ShellState;
  title: Slot;
  /** 화면 위 알림 자리 — 동작 실패(화면 안 알림) 등 */
  notice?: Slot;
  /** 확장 자리: 본문 위 한 줄 (요약 카드 줄 등) */
  lead?: Slot;
  actions?: Slot;
  tree: Slot;
  treeActions?: Slot;
  /** 지금 위치 (상위 > 하위) */
  path?: Slot;
  filters?: Slot;
  body: Slot;
  /** 트리에서 고른 것이 있는가 */
  hasFolder: boolean;
  noFolder: StateSlot;
  empty: StateSlot;
  error: StateSlot;
  loading: StateSlot;
}

export function TreeListShell(p: TreeListShellProps) {
  const ready = p.hasFolder ? p.body : renderState(p.noFolder);
  return (
    <section data-shell="tree-list" data-shell-state={p.state} className="flex flex-col gap-section-sm">
      <PageHeader title={p.title} actions={p.actions} />
      {p.notice && <div data-slot="notice">{p.notice}</div>}
      {p.lead && <div data-slot="lead">{p.lead}</div>}
      <div className={`${SURFACE} flex min-h-[60vh] overflow-hidden`}>
        <aside data-slot="tree" className="flex w-[280px] shrink-0 flex-col border-r border-solid border-border-subtle bg-surface-subtle">
          <div className="min-h-0 flex-1 overflow-y-auto p-inset-sm">{p.tree}</div>
          {p.treeActions && <div className="border-t border-solid border-border-subtle p-inset-sm">{p.treeActions}</div>}
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-stack-lg p-inset-lg">
          {p.path && p.hasFolder && <div data-slot="path" className="text-body text-fg-muted">{p.path}</div>}
          {p.filters && p.hasFolder && <div data-slot="filters" className="flex flex-wrap items-end gap-inline-md">{p.filters}</div>}
          <div data-slot="region">{pickRegion(p.state, ready, p)}</div>
        </div>
      </div>
    </section>
  );
}
