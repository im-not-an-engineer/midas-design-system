import * as React from 'react';
import { PageHeader, SURFACE } from '../_page-header';
import { pickRegion, type Slot, type StateSlot, type ShellState, Extended } from '../_slot';

/**
 * 나란히 비교 셸. 둘 이상(보통 둘 · 셋)을 같은 줄 맞춤으로 나란히 놓고 차이를 본다.
 *   제목 줄 → 비교 대상 고르기 줄 → [열][열]… (+ 차이 표시 설명)
 * empty 는 "비교할 것을 두 개 이상 고르세요" 자리다.
 */
export interface CompareShellProps {
  state: ShellState;
  title: Slot;
  /** 화면 위 알림 자리 — 동작 실패(화면 안 알림) 등 */
  notice?: Slot;
  /** 확장 자리: 본문 위 한 줄 (요약 카드 줄 등) */
  lead?: Slot;
  /** 확장 자리: 본문 오른쪽 칸 */
  side?: Slot;
  actions?: Slot;
  pickers: Slot;
  /** 비교 열들. 같은 순서의 줄을 가진 열을 넘긴다 */
  columns: Slot[];
  legend?: Slot;
  empty: StateSlot;
  error: StateSlot;
  loading: StateSlot;
}

export function CompareShell(p: CompareShellProps) {
  const ready = (
    <div className="flex flex-col gap-stack-md">
      <div className="grid gap-inline-lg" style={{ gridTemplateColumns: `repeat(${Math.max(p.columns.length, 1)}, minmax(0, 1fr))` }}>
        {p.columns.map((c, i) => <div key={i} data-slot="column" className={`${SURFACE} p-inset-lg`}>{c}</div>)}
      </div>
      {p.legend && <div data-slot="legend" className="text-caption text-fg-muted">{p.legend}</div>}
    </div>
  );
  return (
    <section data-shell="compare" data-shell-state={p.state} className="flex flex-col gap-section-sm">
      <PageHeader title={p.title} actions={p.actions} />
      {p.notice && <div data-slot="notice">{p.notice}</div>}
      <Extended lead={p.lead} side={p.side}>
        <div data-slot="pickers" className="flex flex-wrap items-end gap-inline-md">{p.pickers}</div>
        <div data-slot="region">{pickRegion(p.state, ready, p)}</div>
      </Extended>
    </section>
  );
}
