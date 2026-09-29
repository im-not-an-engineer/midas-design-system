import * as React from 'react';
import { PageHeader, SURFACE } from '../_page-header';
import { pickRegion, type Slot, type StateSlot, type ShellState, Extended } from '../_slot';

/**
 * 알림함 셸. 나에게 온 알림·요청을 읽고 치운다(읽음 · 보관). 판정하거나 옆에 열어 두지 않는다.
 *   제목 줄(+모두 읽음) → 탭 줄(전체 · 안 읽음 · 나를 언급) → 알림 목록 → 바닥 줄
 */
export interface InboxShellProps {
  state: ShellState;
  title: Slot;
  /** 화면 위 알림 자리 — 동작 실패(화면 안 알림) 등 */
  notice?: Slot;
  /** 확장 자리: 본문 위 한 줄 (요약 카드 줄 등) */
  lead?: Slot;
  /** 확장 자리: 본문 오른쪽 칸 */
  side?: Slot;
  actions?: Slot;
  tabs: Slot;
  list: Slot;
  footer?: Slot;
  empty: StateSlot;
  error: StateSlot;
  loading: StateSlot;
}

export function InboxShell(p: InboxShellProps) {
  return (
    <section data-shell="inbox" data-shell-state={p.state} className="flex max-w-[960px] flex-col gap-section-sm">
      <PageHeader title={p.title} actions={p.actions} />
      {p.notice && <div data-slot="notice">{p.notice}</div>}
      <Extended lead={p.lead} side={p.side}>
        <div className={`${SURFACE} flex flex-col`}>
          <div data-slot="tabs" className="border-b border-solid border-border-subtle px-inset-lg pt-inset-sm">{p.tabs}</div>
          <div data-slot="region">{pickRegion(p.state, p.list, p)}</div>
          {p.footer && p.state === 'ready' && <div data-slot="footer" className="border-t border-solid border-border-subtle px-inset-lg py-inset-sm">{p.footer}</div>}
        </div>
      </Extended>
    </section>
  );
}
