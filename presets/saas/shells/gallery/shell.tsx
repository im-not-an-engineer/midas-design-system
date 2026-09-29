import * as React from 'react';
import { PageHeader, SURFACE } from '../_page-header';
import { pickRegion, type Slot, type StateSlot, type ShellState, Extended } from '../_slot';

/**
 * 카드 격자 셸. 항목마다 그림·요약이 있는 카드를 격자로 늘어놓는다.
 *   제목 줄 → 필터 줄 → 카드 격자 → 바닥 줄
 * items 에는 카드들을 그대로 넘긴다 — 격자는 셸이 만든다.
 */
export interface GalleryShellProps {
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
  items: Slot;
  footer?: Slot;
  empty: StateSlot;
  error: StateSlot;
  loading: StateSlot;
}

export function GalleryShell(p: GalleryShellProps) {
  const ready = <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-inline-lg">{p.items}</div>;
  return (
    <section data-shell="gallery" data-shell-state={p.state} className="flex flex-col gap-section-sm">
      <PageHeader title={p.title} description={p.description} actions={p.actions} />
      {p.notice && <div data-slot="notice">{p.notice}</div>}
      <Extended lead={p.lead} side={p.side}>
        {p.filters && <div data-slot="filters" className={`${SURFACE} flex flex-wrap items-end gap-inline-md p-inset-md`}>{p.filters}</div>}
        <div data-slot="region">{pickRegion(p.state, ready, p)}</div>
        {p.footer && p.state === 'ready' && <div data-slot="footer" className="flex items-center justify-between gap-inline-md">{p.footer}</div>}
      </Extended>
    </section>
  );
}
