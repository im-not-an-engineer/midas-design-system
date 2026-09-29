import * as React from 'react';
import { pickRegion, renderState, type Slot, type StateSlot, type ShellState, Extended } from '../_slot';

/**
 * 전역 검색 결과 셸. 여러 종류(문서 · 사람 · 프로젝트 …)를 한 번에 찾고, 종류별로 묶어 보인다.
 *   큰 검색 줄 → 종류 거르개 → 결과 요약 → 종류별 묶음 (묶음마다 "더 보기")
 * 검색어가 없으면 idle(최근 검색 · 추천)이 선다. empty 는 "결과 없음".
 */
export interface SearchShellProps {
  state: ShellState;
  query: Slot;
  /** 화면 위 알림 자리 — 동작 실패(화면 안 알림) 등 */
  notice?: Slot;
  /** 확장 자리: 본문 위 한 줄 (요약 카드 줄 등) */
  lead?: Slot;
  /** 확장 자리: 본문 오른쪽 칸 */
  side?: Slot;
  /** 검색어가 있는가 */
  hasQuery: boolean;
  filters?: Slot;
  summary?: Slot;
  groups: Slot;
  idle: StateSlot;
  empty: StateSlot;
  error: StateSlot;
  loading: StateSlot;
}

export function SearchShell(p: SearchShellProps) {
  const ready = (
    <div className="flex flex-col gap-section-sm">
      {p.summary && <div data-slot="summary" className="text-body text-fg-muted">{p.summary}</div>}
      <div data-slot="groups" className="flex flex-col gap-section-sm">{p.groups}</div>
    </div>
  );
  return (
    <section data-shell="search" data-shell-state={p.state} className="flex max-w-[960px] flex-col gap-section-sm">
      <div data-slot="query">{p.query}</div>
      {p.notice && <div data-slot="notice">{p.notice}</div>}
      <Extended lead={p.lead} side={p.side}>
        {p.filters && p.hasQuery && <div data-slot="filters" className="flex flex-wrap items-center gap-inline-sm">{p.filters}</div>}
        <div data-slot="region">{p.hasQuery || p.state !== 'ready' ? pickRegion(p.state, ready, p) : renderState(p.idle)}</div>
      </Extended>
    </section>
  );
}

/** 결과 묶음 하나 — 종류 이름 · 건수 · 결과들 · 더 보기 */
export function SearchGroup({ title, count, children, more }: { title: string; count: number; children: React.ReactNode; more?: React.ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-stack-md">
      <header className="flex items-baseline gap-inline-sm border-b border-solid border-border-subtle pb-inset-xs">
        <h2 className="text-body-lg font-semibold text-fg-default">{title}</h2>
        <span className="text-caption text-fg-muted">{count}건</span>
      </header>
      <div className="flex flex-col gap-stack-sm">{children}</div>
      {more && <div>{more}</div>}
    </section>
  );
}
