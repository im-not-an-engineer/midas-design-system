import * as React from 'react';

/**
 * 셸 슬롯 공용 타입.
 *
 * 상태 슬롯(빈·에러·로딩)은 **반드시 채운다.** 해당이 없으면 `{ 없음: '이유' }` 를 준다.
 * 빼먹으면 타입 검사가 막는다 — 에이전트가 가장 자주 빠뜨리는 것이 이 셋이라서다.
 */
export type Slot = React.ReactNode;
export type StateSlot = React.ReactNode | { 없음: string };

/** 화면의 지금 상태. 검사기가 주소의 `?state=` 로 각 상태를 띄워 본다. */
export type ShellState = 'ready' | 'empty' | 'error' | 'loading';

export function isNone(slot: StateSlot): slot is { 없음: string } {
  return typeof slot === 'object' && slot !== null && !React.isValidElement(slot) && '없음' in slot;
}

/** 상태 슬롯을 그린다. `없음` 이면 아무것도 그리지 않는다. */
export function renderState(slot: StateSlot): React.ReactNode {
  return isNone(slot) ? null : slot;
}

/**
 * 검사용 상태 스위치. 주소에 `?state=empty` 가 있으면 그 상태를 강제로 보인다.
 * 화면은 자기 상태를 계산하되, 마지막에 이걸 거친다: `const state = useShellState(계산한 상태)`.
 */
export function useShellState(actual: ShellState): ShellState {
  const forced = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('state');
  return forced === 'empty' || forced === 'error' || forced === 'loading' || forced === 'ready' ? forced : actual;
}

/**
 * 검사용 실패 스위치. 주소에 `?fail=approve,save` 가 있으면 그 이름의 동작이 실패한 것처럼 군다.
 * 화면은 실패할 수 있는 동작마다 이렇게 쓴다: `if (fails('approve')) { setError(…); return; }`
 * 그리고 명세의 `실패 흉내` 에 그 이름과 무엇이 실패하는지를 적는다.
 */
export function useShellFail(): (action: string) => boolean {
  const list = typeof window === 'undefined' ? [] : (new URLSearchParams(window.location.search).get('fail') ?? '').split(',').filter(Boolean);
  return (action: string) => list.includes(action);
}

/** 본문 자리: 상태에 따라 ready / empty / error / loading 중 하나를 고른다. */
export function pickRegion(state: ShellState, ready: React.ReactNode, s: { empty: StateSlot; error: StateSlot; loading: StateSlot }) {
  return state === 'empty' ? renderState(s.empty) : state === 'error' ? renderState(s.error) : state === 'loading' ? renderState(s.loading) : ready;
}

/**
 * 확장 자리 — 셸의 구조는 두고 요소를 더할 때 쓰는 공통 자리.
 *   lead: 본문 위 한 줄 (요약 카드 줄 · 안내 · 기간 요약 …)
 *   side: 본문 오른쪽 칸 (최근 활동 · 도움말 · 관련 항목 …) — 셸에 오른쪽 칸이 없을 때만
 * 칸 안에 억지로 끼워 넣지 말고 여기에 둔다. 그래야 화면마다 같은 자리 · 같은 간격이 된다.
 */
export function Extended({ lead, side, children }: { lead?: React.ReactNode; side?: React.ReactNode; children: React.ReactNode }) {
  const main = side ? (
    <div className="flex items-start gap-inline-lg">
      <div className="flex min-w-0 flex-1 flex-col gap-section-sm">{children}</div>
      <aside data-slot="side" className="flex w-[320px] shrink-0 flex-col gap-stack-lg">{side}</aside>
    </div>
  ) : children;
  return (
    <>
      {lead && <div data-slot="lead">{lead}</div>}
      {main}
    </>
  );
}
