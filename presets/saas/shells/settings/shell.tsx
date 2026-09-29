import * as React from 'react';
import { PageHeader } from '../_page-header';
import { pickRegion, type Slot, type StateSlot, type ShellState, Extended } from '../_slot';

/**
 * 설정 셸. 이미 있는 값을 구역별로 켜고 끄고 바꾼다.
 *   제목 줄 → [왼쪽: 구역 메뉴 | 오른쪽: 구역들 (구역마다 제목 · 설명 · 항목)]
 * 구역은 SettingsSection 으로 넘긴다. 저장 방식(즉시 · 버튼)은 정책이 정한다.
 */
export interface SettingsShellProps {
  state: ShellState;
  title: Slot;
  /** 화면 위 알림 자리 — 동작 실패(화면 안 알림) 등 */
  notice?: Slot;
  /** 확장 자리: 본문 위 한 줄 (요약 카드 줄 등) */
  lead?: Slot;
  /** 확장 자리: 본문 오른쪽 칸 */
  side?: Slot;
  description?: Slot;
  nav: Slot;
  sections: Slot;
  empty: StateSlot;
  error: StateSlot;
  loading: StateSlot;
}

export function SettingsShell(p: SettingsShellProps) {
  return (
    <section data-shell="settings" data-shell-state={p.state} className="flex flex-col gap-section-sm">
      <PageHeader title={p.title} description={p.description} />
      {p.notice && <div data-slot="notice">{p.notice}</div>}
      <Extended lead={p.lead} side={p.side}>
        <div className="flex items-start gap-inline-lg">
          <nav data-slot="nav" aria-label="설정 구역" className="sticky top-0 w-[220px] shrink-0">{p.nav}</nav>
          <div data-slot="region" className="flex min-w-0 max-w-[880px] flex-1 flex-col gap-stack-lg">{pickRegion(p.state, p.sections, p)}</div>
        </div>
      </Extended>
    </section>
  );
}

/** 설정 구역 하나. id 를 주면 구역 메뉴에서 #id 로 건너올 수 있다 */
export function SettingsSection({ id, title, description, children, footer }: {
  id?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section id={id} aria-label={typeof title === 'string' ? title : undefined} className="flex flex-col gap-stack-lg rounded-surface border-width-default border-solid border-border-default bg-surface-base p-inset-lg">
      <header className="flex flex-col gap-stack-sm">
        <h2 className="text-heading-sm font-semibold leading-tight text-fg-default">{title}</h2>
        {description && <p className="text-body leading-normal text-fg-muted">{description}</p>}
      </header>
      <div className="flex flex-col gap-stack-lg">{children}</div>
      {footer && <div className="flex justify-end gap-inline-md border-t border-solid border-border-subtle pt-inset-md">{footer}</div>}
    </section>
  );
}
