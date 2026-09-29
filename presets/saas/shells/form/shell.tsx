import * as React from 'react';
import { PageHeader, BackLink } from '../_page-header';
import { pickRegion, type Slot, type StateSlot, type ShellState } from '../_slot';

/**
 * 전체 페이지 폼 셸. 칸이 많거나 구역이 나뉘는 입력을 한 화면에서 채우고 한 번에 저장한다.
 *   뒤로 → 제목 줄 → (알림 자리) → [구역들 | 옆 도움말] → 바닥에 고정된 버튼 줄
 * 구역은 Fieldset 으로 나눠 sections 에 넘긴다. empty 는 보통 { 없음 } (새로 만들기).
 */
export interface FormShellProps {
  state: ShellState;
  back?: Slot;
  title: Slot;
  description?: Slot;
  /** 폼 위 알림 자리 (저장 실패 · 안내) */
  notice?: Slot;
  /** 확장 자리: 본문 위 한 줄 (요약 카드 줄 등) */
  lead?: Slot;
  sections: Slot;
  aside?: Slot;
  footer: Slot;
  empty: StateSlot;
  error: StateSlot;
  loading: StateSlot;
}

export function FormShell(p: FormShellProps) {
  const ready = (
    <div className="flex flex-col gap-stack-lg">
      {p.notice && <div data-slot="notice">{p.notice}</div>}
      {p.lead && <div data-slot="lead">{p.lead}</div>}
      <div className="flex items-start gap-inline-lg">
        <div data-slot="sections" className="flex min-w-0 max-w-[880px] flex-1 flex-col gap-section-sm rounded-surface border-width-default border-solid border-border-default bg-surface-base p-inset-xl">
          {p.sections}
        </div>
        {p.aside && <aside data-slot="aside" className="w-[280px] shrink-0">{p.aside}</aside>}
      </div>
      <div data-slot="footer" className="sticky bottom-0 flex items-center justify-end gap-inline-md border-t border-solid border-border-default bg-surface-subtle py-inset-md">
        {p.footer}
      </div>
    </div>
  );
  return (
    <section data-shell="form" data-shell-state={p.state} className="flex flex-col gap-stack-lg">
      {p.back && <BackLink>{p.back}</BackLink>}
      <PageHeader title={p.title} description={p.description} />
      <div data-slot="region">{pickRegion(p.state, ready, p)}</div>
    </section>
  );
}
