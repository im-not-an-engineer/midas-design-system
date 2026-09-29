import * as React from 'react';
import { PageHeader, SURFACE } from '../_page-header';
import { pickRegion, type Slot, type StateSlot, type ShellState } from '../_slot';

/**
 * 표에서 바로 고치기 셸. 같은 모양의 여러 행을 칸 안에서 곧장 고치고 한꺼번에 저장한다.
 *   제목 줄 → 도구 줄(행 추가 · 붙여넣기) → (알림) → 편집 표 → 바닥 줄(변경 N건 · 되돌리기 · 저장)
 */
export interface GridEditShellProps {
  state: ShellState;
  title: Slot;
  description?: Slot;
  toolbar: Slot;
  notice?: Slot;
  /** 확장 자리: 본문 위 한 줄 (요약 카드 줄 등) */
  lead?: Slot;
  grid: Slot;
  footer: Slot;
  empty: StateSlot;
  error: StateSlot;
  loading: StateSlot;
}

export function GridEditShell(p: GridEditShellProps) {
  const ready = (
    <div className="flex flex-col gap-stack-md">
      {p.notice && <div data-slot="notice">{p.notice}</div>}
      {p.lead && <div data-slot="lead">{p.lead}</div>}
      <div data-slot="grid" className="overflow-x-auto">{p.grid}</div>
    </div>
  );
  return (
    <section data-shell="grid-edit" data-shell-state={p.state} className="flex flex-col gap-section-sm">
      <PageHeader title={p.title} description={p.description} />
      <div className={`${SURFACE} flex flex-col`}>
        <div data-slot="toolbar" className="flex flex-wrap items-center gap-inline-md border-b border-solid border-border-subtle px-inset-lg py-inset-sm">{p.toolbar}</div>
        <div data-slot="region" className="p-inset-lg">{pickRegion(p.state, ready, p)}</div>
        {p.state === 'ready' && (
          <div data-slot="footer" className="sticky bottom-0 flex items-center justify-between gap-inline-md border-t border-solid border-border-subtle bg-surface-subtle px-inset-lg py-inset-md">
            {p.footer}
          </div>
        )}
      </div>
    </section>
  );
}
