import * as React from 'react';
import { PageHeader } from '../_page-header';
import { pickRegion, type Slot, type StateSlot, type ShellState, Extended } from '../_slot';

/**
 * 상태별 열 보드 셸. 항목을 진행 상태(할 일 · 진행 중 · 완료 …)마다 열로 나눠 본다. 끌어 옮기기는 없다 —
 * 상태를 바꾸는 동작은 카드 안에 둔다.
 *   제목 줄 → 필터 줄 → [열][열][열] (가로로 넘치면 가로 스크롤)
 * columns 에는 BoardColumn 들을 넘긴다.
 */
export interface BoardShellProps {
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
  columns: Slot;
  empty: StateSlot;
  error: StateSlot;
  loading: StateSlot;
}

export function BoardShell(p: BoardShellProps) {
  const ready = <div className="flex items-start gap-inline-lg overflow-x-auto pb-inset-sm">{p.columns}</div>;
  return (
    <section data-shell="board" data-shell-state={p.state} className="flex flex-col gap-section-sm">
      <PageHeader title={p.title} description={p.description} actions={p.actions} />
      {p.notice && <div data-slot="notice">{p.notice}</div>}
      <Extended lead={p.lead} side={p.side}>
        {p.filters && <div data-slot="filters" className="flex flex-wrap items-end gap-inline-md">{p.filters}</div>}
        <div data-slot="region">{pickRegion(p.state, ready, p)}</div>
      </Extended>
    </section>
  );
}

/** 보드의 열 하나. 열 이름 · 건수 · 카드들 · (선택) 열 바닥 동작 */
export function BoardColumn({ title, count, children, footer, emptyText = '항목 없음' }: {
  title: React.ReactNode;
  count: number;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  emptyText?: React.ReactNode;
}) {
  const empty = React.Children.count(children) === 0;
  return (
    <section aria-label={typeof title === 'string' ? title : undefined} className="flex w-[300px] shrink-0 flex-col gap-stack-md rounded-surface bg-surface-sunken p-inset-sm">
      <header className="flex items-center justify-between px-inset-xs">
        <h2 className="text-body font-semibold text-fg-default">{title}</h2>
        <span className="text-caption text-fg-muted">{count}</span>
      </header>
      <div className="flex flex-col gap-stack-sm">
        {empty ? <p className="px-inset-xs py-inset-md text-caption text-fg-muted">{emptyText}</p> : children}
      </div>
      {footer}
    </section>
  );
}
