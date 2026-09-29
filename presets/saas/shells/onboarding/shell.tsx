import * as React from 'react';
import { PageHeader } from '../_page-header';
import { pickRegion, type Slot, type StateSlot, type ShellState } from '../_slot';

/**
 * 첫 사용 셸. 아직 아무것도 없는 사람이 무엇부터 할지 안내한다.
 *   환영 제목 → [가운데: 첫 행동 카드들 | 옆: 할 일 목록(진행)] → 도움말
 * 이 화면 자체가 "빈 상태"를 크게 편 것이다 — empty 는 보통 { 없음 }.
 */
export interface OnboardingShellProps {
  state: ShellState;
  title: Slot;
  /** 화면 위 알림 자리 — 동작 실패(화면 안 알림) 등 */
  notice?: Slot;
  /** 확장 자리: 본문 위 한 줄 (요약 카드 줄 등) */
  lead?: Slot;
  description?: Slot;
  start: Slot;
  checklist: Slot;
  help?: Slot;
  empty: StateSlot;
  error: StateSlot;
  loading: StateSlot;
}

export function OnboardingShell(p: OnboardingShellProps) {
  const ready = (
    <div className="flex flex-col gap-section-sm">
      <div className="flex items-start gap-inline-lg">
        <div data-slot="start" className="grid min-w-0 flex-1 grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-inline-lg">{p.start}</div>
        <aside data-slot="checklist" className="w-[360px] shrink-0">{p.checklist}</aside>
      </div>
      {p.help && <div data-slot="help">{p.help}</div>}
    </div>
  );
  return (
    <section data-shell="onboarding" data-shell-state={p.state} className="flex flex-col gap-section-md">
      <PageHeader title={p.title} description={p.description} />
      {p.notice && <div data-slot="notice">{p.notice}</div>}
      {p.lead && <div data-slot="lead">{p.lead}</div>}
      <div data-slot="region">{pickRegion(p.state, ready, p)}</div>
    </section>
  );
}
