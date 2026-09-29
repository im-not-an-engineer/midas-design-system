import * as React from 'react';
import { PageHeader, SURFACE } from '../_page-header';
import { pickRegion, type Slot, type StateSlot, type ShellState } from '../_slot';

/**
 * 보고서 셸. 기간·조건을 정해 수치를 요약하고 표로 따진 뒤 내보낸다.
 *   제목 줄(+내보내기) → 조건 줄 → 요약 수치 줄 → 표 → 주석
 * empty 는 "조건에 맞는 자료가 없음" 자리다.
 */
export interface ReportShellProps {
  state: ShellState;
  title: Slot;
  /** 화면 위 알림 자리 — 동작 실패(화면 안 알림) 등 */
  notice?: Slot;
  description?: Slot;
  actions?: Slot;
  criteria: Slot;
  summary: Slot;
  table: Slot;
  note?: Slot;
  empty: StateSlot;
  error: StateSlot;
  loading: StateSlot;
}

export function ReportShell(p: ReportShellProps) {
  const ready = (
    <div className="flex flex-col gap-stack-lg">
      <div data-slot="summary" className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-inline-lg">{p.summary}</div>
      <div data-slot="table" className={`${SURFACE} overflow-x-auto p-inset-lg`}>{p.table}</div>
      {p.note && <div data-slot="note" className="text-caption leading-normal text-fg-muted">{p.note}</div>}
    </div>
  );
  return (
    <section data-shell="report" data-shell-state={p.state} className="flex flex-col gap-section-sm">
      <PageHeader title={p.title} description={p.description} actions={p.actions} />
      {p.notice && <div data-slot="notice">{p.notice}</div>}
      <>
        <div data-slot="criteria" className={`${SURFACE} flex flex-wrap items-end gap-inline-md p-inset-md`}>{p.criteria}</div>
        <div data-slot="region">{pickRegion(p.state, ready, p)}</div>
      </>
    </section>
  );
}
