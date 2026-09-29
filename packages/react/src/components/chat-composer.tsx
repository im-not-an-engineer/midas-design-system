import * as React from 'react';
import { cn } from '../lib/cn';
import { ArrowUp, File, Paperclip, Square, X } from '../lib/icons';
import { Button } from './button';

/**
 * 입력 가족 — ChatComposer. AI 대화의 입력창.
 *
 * Textarea 를 그대로 쓰지 않는다 — 테두리 안에 글자칸과 버튼 줄이 같이 들어가고, 글이 길어지면
 * 높이가 자라야 해서다. 대신 겉모양(테두리·면·그림자·오류·비활성)은 입력칸(field-*)과 같은
 * 토큰을 써서 폼 옆에 놓여도 한 가족으로 보인다.
 *
 *   <ChatComposer onSend={send} generating={busy} onStop={stop} onAttach={add} />
 *
 * 키: Enter 보내기 · Shift+Enter 줄바꿈. 한글을 조합하는 중의 Enter 는 보내지 않는다 —
 * 조합을 끝내는 Enter 까지 보내기로 받으면 마지막 글자가 빠진 채 두 번 나간다.
 *
 * 토큰 매핑:
 *   틀        → --color-field-{bg|border}-* · --radius-surface · --shadow-control
 *   글자      → --text-content (읽는 글자 14) · --leading-normal
 *   줄 사이    → --spacing-stack-sm · 안쪽 여백 좌우 --spacing-inset-sm · 위아래 --spacing-inset-md
 */

export interface ChatAttachment {
  id: string;
  name: string;
}

export interface ChatComposerProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** 보내기(버튼·Enter). 비제어일 때는 보낸 뒤 칸을 비운다. */
  onSend: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** 답변을 쓰는 중. 보내기 버튼이 멈춤 버튼으로 바뀐다. 입력은 계속 할 수 있다. */
  generating?: boolean;
  onStop?: () => void;
  /** 이 줄 수까지 자라고 그 뒤로는 칸 안에서 스크롤한다. 기본 8. */
  maxRows?: number;
  /** 주면 첨부 버튼이 생긴다. */
  onAttach?: (files: File[]) => void;
  /** 파일 고르기 창에서 받을 형식(input accept). */
  accept?: string;
  /** 붙인 파일. 입력칸 위에 칩으로 보인다. */
  attachments?: ChatAttachment[];
  onRemoveAttachment?: (id: string) => void;
  className?: string;
}

const BOX = [
  'flex w-full flex-col gap-stack-sm px-inset-sm py-inset-md',
  'rounded-surface border-width-default border-solid border-field-border-default bg-field-bg-default shadow-control',
  'transition-colors duration-fast ease-standard',
  // 틀 안의 글자칸이 포커스를 받으면 틀이 표시한다 — 글자칸 자체에는 테두리가 없다.
  'focus-within:border-field-border-focus',
  'data-disabled:border-field-border-disabled data-disabled:bg-field-bg-disabled',
].join(' ');

const TEXTAREA = [
  'block w-full resize-none border-none bg-transparent p-0 px-inset-xs outline-none',
  'font-sans text-content leading-normal text-field-fg-default',
  'placeholder:text-field-fg-placeholder disabled:cursor-not-allowed disabled:text-field-fg-disabled',
].join(' ');

const FILE_CHIP = [
  'inline-flex max-w-full items-center gap-inline-xs h-control-sm rounded-control pl-inset-sm pr-inset-xs',
  'border-width-default border-solid border-border-default bg-surface-subtle',
  'font-sans text-caption leading-ui text-fg-default [&_svg]:size-icon-sm [&_svg]:shrink-0',
].join(' ');

export function ChatComposer({
  value, defaultValue, onValueChange, onSend, placeholder = '메시지를 입력하세요', disabled, generating, onStop,
  maxRows = 8, onAttach, accept, attachments, onRemoveAttachment, className,
}: ChatComposerProps) {
  const controlled = value !== undefined;
  const [inner, setInner] = React.useState(defaultValue ?? '');
  const text = controlled ? value : inner;
  const area = React.useRef<HTMLTextAreaElement>(null);
  const file = React.useRef<HTMLInputElement>(null);
  const canSend = !disabled && !generating && text.trim().length > 0;

  const set = (v: string) => {
    if (!controlled) setInner(v);
    onValueChange?.(v);
  };
  const send = () => {
    if (!canSend) return;
    onSend(text);
    if (!controlled) setInner('');
  };

  // 내용만큼 높이를 맞춘다. maxRows 를 넘으면 그 높이에 멈추고 칸 안에서 스크롤한다.
  React.useLayoutEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = 'auto';
    const line = parseFloat(getComputedStyle(el).lineHeight) || 20;
    const max = line * maxRows;
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
    el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden';
  }, [text, maxRows]);

  return (
    <div data-disabled={disabled || undefined} className={cn(BOX, className)}>
      {attachments && attachments.length > 0 && (
        <ul aria-label="붙인 파일" className="m-0 flex list-none flex-wrap gap-inline-sm p-0">
          {attachments.map((a) => (
            <li key={a.id} className={FILE_CHIP}>
              <File aria-hidden className="text-fg-muted" />
              <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{a.name}</span>
              {onRemoveAttachment && (
                <button
                  type="button"
                  aria-label={`${a.name} 빼기`}
                  onClick={() => onRemoveAttachment(a.id)}
                  disabled={disabled}
                  className="inline-flex size-icon-lg items-center justify-center rounded-control border-none bg-transparent text-fg-subtle cursor-pointer hover:text-fg-default ax-focus-ring"
                >
                  <X aria-hidden />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <textarea
        ref={area}
        rows={1}
        value={text}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => set(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            send();
          }
        }}
        className={TEXTAREA}
      />

      <div className="flex items-center justify-between gap-inline-md">
        <div className="flex items-center gap-inline-xs">
          {onAttach && (
            <>
              {/* 칸은 24 — sm 버튼(28)보다 한 단계 작게(2026-09-29, 사람의 결정).
                  24 는 SaaS 에 토큰이 없어 icon-lg + inset-xs 로 만든다(SaaS·base 24, consumer 30). */}
              <Button intent="ghost" size="sm" iconOnly aria-label="파일 붙이기" disabled={disabled} onClick={() => file.current?.click()} className="h-[calc(var(--spacing-icon-lg)+var(--spacing-inset-xs))] w-[calc(var(--spacing-icon-lg)+var(--spacing-inset-xs))]">
                <Paperclip aria-hidden />
              </Button>
              <input
                ref={file}
                type="file"
                multiple
                accept={accept}
                hidden
                onChange={(e) => {
                  const files = Array.from(e.currentTarget.files ?? []);
                  if (files.length) onAttach(files);
                  e.currentTarget.value = '';
                }}
              />
            </>
          )}
        </div>
        <div className="flex items-center gap-inline-md">
          {generating ? (
            // 네모는 같은 칸의 화살표보다 면이 넓어 커 보인다 — 0.75 배로 줄여 눈에 보이는 크기를 맞춘다.
            <Button intent="secondary" size="sm" iconOnly aria-label="답변 멈추기" onClick={onStop} className="[&_svg]:size-[calc(var(--spacing-icon-sm)*0.75)]">
              <Square aria-hidden />
            </Button>
          ) : (
            <Button intent="primary" size="sm" iconOnly aria-label="보내기" disabled={!canSend} onClick={send}>
              <ArrowUp aria-hidden />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
