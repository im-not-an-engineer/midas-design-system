import * as React from 'react';
import { PageHeader, SURFACE } from '../_page-header';
import { pickRegion, type Slot, type StateSlot, type ShellState, Extended } from '../_slot';

/**
 * 역할 × 권한 표 셸. 줄 = 권한, 열 = 역할(또는 반대)인 체크 표로 누가 무엇을 할 수 있는지 정한다.
 *   제목 줄 → 필터 줄 → 권한 표(머리 줄 고정) → 범례 → 바닥 저장 줄
 */
export interface PermissionMatrixShellProps {
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
  filters?: Slot;
  matrix: Slot;
  legend?: Slot;
  footer: Slot;
  empty: StateSlot;
  error: StateSlot;
  loading: StateSlot;
}

export function PermissionMatrixShell(p: PermissionMatrixShellProps) {
  const ready = (
    <div className="flex flex-col gap-stack-md">
      <div data-slot="matrix" className="overflow-x-auto">{p.matrix}</div>
      {p.legend && <div data-slot="legend" className="text-caption text-fg-muted">{p.legend}</div>}
    </div>
  );
  return (
    <section data-shell="permission-matrix" data-shell-state={p.state} className="flex flex-col gap-section-sm">
      <PageHeader title={p.title} description={p.description} actions={p.actions} />
      {p.notice && <div data-slot="notice">{p.notice}</div>}
      <Extended lead={p.lead} side={p.side}>
        <div className={`${SURFACE} flex flex-col`}>
          {p.filters && <div data-slot="filters" className="flex flex-wrap items-end gap-inline-md border-b border-solid border-border-subtle p-inset-lg">{p.filters}</div>}
          <div data-slot="region" className="p-inset-lg">{pickRegion(p.state, ready, p)}</div>
          {p.state === 'ready' && (
            <div data-slot="footer" className="sticky bottom-0 flex items-center justify-between gap-inline-md border-t border-solid border-border-subtle bg-surface-subtle px-inset-lg py-inset-md">
              {p.footer}
            </div>
          )}
        </div>
      </Extended>
    </section>
  );
}
