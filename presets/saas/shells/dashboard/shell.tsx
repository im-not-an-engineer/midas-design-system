import * as React from 'react';
import { PageHeader } from '../_page-header';
import { pickRegion, type Slot, type StateSlot, type ShellState } from '../_slot';

/**
 * 대시보드 셸. 들어오자마자 지금 상황을 한눈에 본다 — 요약 수치 · 할 일 · 최근 것.
 *   제목 줄(+기간 고르기) → 요약 카드 줄 → [큰 자리 | 옆 자리]
 * empty 는 "아직 데이터가 없음"(막 가입했을 때 등) 자리다.
 */
export interface DashboardShellProps {
  state: ShellState;
  title: Slot;
  /** 화면 위 알림 자리 — 동작 실패(화면 안 알림) 등 */
  notice?: Slot;
  description?: Slot;
  actions?: Slot;
  /** 요약 카드들. 격자는 셸이 만든다 */
  kpis: Slot;
  main: Slot;
  side?: Slot;
  empty: StateSlot;
  error: StateSlot;
  loading: StateSlot;
}

export function DashboardShell(p: DashboardShellProps) {
  const ready = (
    <div className="flex flex-col gap-section-sm">
      <div data-slot="kpis" className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-inline-lg">{p.kpis}</div>
      <div className="flex items-start gap-inline-lg">
        <div data-slot="main" className="flex min-w-0 flex-1 flex-col gap-stack-lg">{p.main}</div>
        {p.side && <aside data-slot="side" className="flex w-[360px] shrink-0 flex-col gap-stack-lg">{p.side}</aside>}
      </div>
    </div>
  );
  return (
    <section data-shell="dashboard" data-shell-state={p.state} className="flex flex-col gap-section-sm">
      <PageHeader title={p.title} description={p.description} actions={p.actions} />
      {p.notice && <div data-slot="notice">{p.notice}</div>}
      <div data-slot="region">{pickRegion(p.state, ready, p)}</div>
    </section>
  );
}
