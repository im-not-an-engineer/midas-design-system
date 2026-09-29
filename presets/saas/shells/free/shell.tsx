import * as React from 'react';
import { PageHeader, SURFACE } from '../_page-header';
import { pickRegion, Extended, type Slot, type StateSlot, type ShellState } from '../_slot';

/**
 * 자유 화면 셸 — **맞는 셸이 없을 때의 기본 틀.** (캘린더 · 차트 분석 · 지도처럼 키트에 아직 없는 화면)
 *   제목 줄 → 알림 → (확장: 본문 위) → [본문 | (확장: 오른쪽 칸)] → 바닥 줄
 * 본문 안은 자유지만 **바깥 틀 · 면 · 간격 · 상태 칸은 다른 셸과 같다.** 그래서 어떤 요청이든 화면이 나오고,
 * 나온 화면이 앱 안에서 튀지 않는다. 명세에는 가장 가까운 셸과 부족한 점을 적는다 — 새 셸을 만들 재료가 된다.
 */
export interface FreeShellProps {
  state: ShellState;
  title: Slot;
  description?: Slot;
  actions?: Slot;
  notice?: Slot;
  lead?: Slot;
  /** 본문. surface=false 면 흰 면 없이 놓는다 (카드 여러 장을 직접 늘어놓을 때) */
  body: Slot;
  surface?: boolean;
  side?: Slot;
  footer?: Slot;
  empty: StateSlot;
  error: StateSlot;
  loading: StateSlot;
}

export function FreeShell(p: FreeShellProps) {
  const ready = p.surface === false ? p.body : <div className={`${SURFACE} p-inset-lg`}>{p.body}</div>;
  return (
    <section data-shell="free" data-shell-state={p.state} className="flex flex-col gap-section-sm">
      <PageHeader title={p.title} description={p.description} actions={p.actions} />
      {p.notice && <div data-slot="notice">{p.notice}</div>}
      <Extended lead={p.lead} side={p.side}>
        <div data-slot="region">{pickRegion(p.state, ready, p)}</div>
        {p.footer && p.state === 'ready' && <div data-slot="footer" className="flex items-center justify-between gap-inline-md">{p.footer}</div>}
      </Extended>
    </section>
  );
}
