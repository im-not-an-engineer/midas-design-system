import * as React from 'react';
import { PageHeader, BackLink } from '../_page-header';
import { pickRegion, type Slot, type StateSlot, type ShellState } from '../_slot';

/**
 * 상세 셸. 한 건을 깊이 본다.
 *   뒤로 → 제목 줄(+속성 한 줄) → 핵심 수치 줄 → [본문(탭 등) | 옆 정보 칸]
 * empty 는 "찾을 수 없음"(지워졌거나 권한이 없음) 자리다.
 */
export interface DetailShellProps {
  state: ShellState;
  back?: Slot;
  title: Slot;
  /** 화면 위 알림 자리 — 동작 실패(화면 안 알림) 등 */
  notice?: Slot;
  /** 제목 아래 속성 한 줄 (상태 배지 · 담당 · 날짜) */
  meta?: Slot;
  actions?: Slot;
  /** 핵심 수치·요약 줄 */
  summary?: Slot;
  main: Slot;
  aside: Slot;
  empty: StateSlot;
  error: StateSlot;
  loading: StateSlot;
}

export function DetailShell(p: DetailShellProps) {
  const ready = (
    <div className="flex flex-col gap-section-sm">
      <PageHeader title={p.title} description={p.meta} actions={p.actions} />
      {p.notice && <div data-slot="notice">{p.notice}</div>}
      {p.summary && <div data-slot="summary">{p.summary}</div>}
      <div className="flex items-start gap-inline-lg">
        <div data-slot="main" className="min-w-0 flex-1">{p.main}</div>
        <aside data-slot="aside" className="w-[320px] shrink-0">{p.aside}</aside>
      </div>
    </div>
  );
  return (
    <section data-shell="detail" data-shell-state={p.state} className="flex flex-col gap-stack-lg">
      {p.back && <BackLink>{p.back}</BackLink>}
      <div data-slot="region">{pickRegion(p.state, ready, p)}</div>
    </section>
  );
}
