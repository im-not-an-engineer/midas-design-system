import * as React from 'react';
import { PageHeader, BackLink, SURFACE } from '../_page-header';
import { pickRegion, type Slot, type StateSlot, type ShellState } from '../_slot';

/**
 * 활동 이력 중심 상세 셸. 한 건에 **무슨 일이 있었는지**(변경 · 댓글 · 승인 이력)를 시간순으로 따라간다.
 *   뒤로 → 제목 줄 → [가운데: 쓰기 칸 + 시간순 기록 | 옆: 속성 칸]
 */
export interface DetailActivityShellProps {
  state: ShellState;
  back?: Slot;
  title: Slot;
  /** 화면 위 알림 자리 — 동작 실패(화면 안 알림) 등 */
  notice?: Slot;
  /** 확장 자리: 본문 위 한 줄 (요약 카드 줄 등) */
  lead?: Slot;
  meta?: Slot;
  actions?: Slot;
  /** 댓글·메모 쓰기 칸 */
  composer?: Slot;
  /** 시간순 기록. <ol> 로 넘기면 좋다 */
  timeline: Slot;
  aside: Slot;
  empty: StateSlot;
  error: StateSlot;
  loading: StateSlot;
}

export function DetailActivityShell(p: DetailActivityShellProps) {
  const ready = (
    <div className="flex flex-col gap-section-sm">
      <PageHeader title={p.title} description={p.meta} actions={p.actions} />
      {p.notice && <div data-slot="notice">{p.notice}</div>}
      {p.lead && <div data-slot="lead">{p.lead}</div>}
      <div className="flex items-start gap-inline-lg">
        <div className="flex min-w-0 flex-1 flex-col gap-stack-lg">
          {p.composer && <div data-slot="composer" className={`${SURFACE} p-inset-md`}>{p.composer}</div>}
          <div data-slot="timeline" className={`${SURFACE} p-inset-lg`}>{p.timeline}</div>
        </div>
        <aside data-slot="aside" className="w-[320px] shrink-0">{p.aside}</aside>
      </div>
    </div>
  );
  return (
    <section data-shell="detail-activity" data-shell-state={p.state} className="flex flex-col gap-stack-lg">
      {p.back && <BackLink>{p.back}</BackLink>}
      <div data-slot="region">{pickRegion(p.state, ready, p)}</div>
    </section>
  );
}
