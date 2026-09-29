import * as React from 'react';
import { cn } from '../lib/cn';
import { Spinner } from './spinner';

/**
 * 표시 가족 — ChatThread / ChatMessage. AI 대화의 말 목록.
 *
 * 사용자 말은 오른쪽 말풍선, AI 답변은 말풍선 없이 넓게 — 답변에는 목록·표·코드가 들어가서
 * 좁은 말풍선에 가두면 읽기 어렵다.
 *
 *   <ChatThread>
 *     <ChatMessage from="user">정산 규정 알려줘</ChatMessage>
 *     <ChatMessage from="assistant" actions={<Button …/>}>…</ChatMessage>
 *   </ChatThread>
 *
 * 토큰 매핑:
 *   글자       → --text-content · --leading-normal (읽는 글자 14)
 *   사용자 말풍선 → --color-surface-sunken · --radius-overlay · 안쪽 좌우 inset-xl / 위아래 inset-md (2026-09-29, 사람의 결정)
 *   말 사이     → --spacing-section-sm · 답변 ↔ 버튼 줄 --spacing-stack-sm
 *
 * 폭(레이아웃 폭이라 토큰이 아니다, 2026-09-29 사람의 결정):
 *   대화 전체   → 720px 이하로 가운데. 넓은 화면에서 한 줄이 너무 길어지면 읽기 어렵다.
 *   사용자 말   → 대화 폭의 75%. 줄 끝까지 가면 누가 한 말인지 좌우 위치로 안 갈린다.
 *   AI 답변    → 대화 폭의 90%. 목록·표·카드가 들어가 사용자 말보다 넓되, 오른쪽을 남겨 말풍선과 갈린다.
 */

/**
 * 말 목록. role="log" 라 새 말이 붙으면 화면 읽기 프로그램이 읽어 준다 —
 * 답변이 흘러나오는 동안 한 글자씩 읽지 않도록 aria-busy 는 쓰는 쪽이 준다.
 */
export function ChatThread({ className, ...props }: React.ComponentProps<'div'>) {
  return <div role="log" aria-live="polite" className={cn('mx-auto flex w-full max-w-[720px] flex-col gap-section-sm', className)} {...props} />;
}

export interface ChatMessageProps extends React.ComponentProps<'div'> {
  /** 누가 한 말인가. user 는 오른쪽 말풍선, assistant 는 넓은 본문. */
  from: 'user' | 'assistant';
  /** 답변 아래 버튼 줄(복사·다시 쓰기…). assistant 에만 보인다. */
  actions?: React.ReactNode;
  /** 답변을 쓰는 중이고 아직 글자가 없다. */
  pending?: boolean;
}

const TEXT = 'font-sans text-content leading-normal text-fg-default break-words';

export function ChatMessage({ from, actions, pending, className, children, ...props }: ChatMessageProps) {
  if (from === 'user') {
    return (
      <div data-from="user" className={cn('flex justify-end', className)} {...props}>
        <div className={cn(TEXT, 'max-w-[75%] whitespace-pre-wrap rounded-overlay bg-surface-sunken px-inset-xl py-inset-md')}>{children}</div>
      </div>
    );
  }
  return (
    <div data-from="assistant" className={cn('flex max-w-[90%] flex-col gap-stack-sm', className)} {...props}>
      {pending ? (
        <div className="flex items-center gap-inline-md text-fg-muted">
          {/* 옆에 같은 말이 글자로 있어 스피너는 읽지 않는다(label 을 주지 않으면 aria-hidden). */}
          <Spinner size="sm" />
          <span className="font-sans text-caption leading-ui">답변을 쓰는 중</span>
        </div>
      ) : (
        <div className={TEXT}>{children}</div>
      )}
      {actions != null && !pending && <div className="flex items-center gap-inline-xs">{actions}</div>}
    </div>
  );
}
