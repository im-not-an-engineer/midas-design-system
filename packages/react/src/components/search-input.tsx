import * as React from 'react';
import { cn } from '../lib/cn';
import { Search, X } from '../lib/icons';
import { Input, type InputProps } from './field';

/**
 * 입력 가족 — SearchInput. 목록·표를 좁히는 검색 칸. 앞에 돋보기, 글자가 있으면 지우기 버튼.
 *
 * Input 을 감싼다 — 테두리·높이·포커스·비활성은 전부 Input 그대로다.
 * 값이 바뀔 때마다 부를지, Enter 에서만 부를지는 쓰는 쪽이 정한다(onChange / onKeyDown).
 *
 * 토큰 매핑:
 *   아이콘     → --spacing-icon-md · --color-fg-subtle
 *   아이콘 자리 → 왼쪽 여백을 inset-sm + icon-md + inline-md 만큼 비운다(글자가 아이콘 밑으로 안 들어가게)
 */

export interface SearchInputProps extends Omit<InputProps, 'type'> {
  /** 지우기 버튼을 눌렀을 때. 값을 비우는 건 쓰는 쪽 몫이다(제어 컴포넌트일 때). */
  onClear?: () => void;
}

export function SearchInput({ className, value, defaultValue, onChange, onClear, disabled, placeholder = '검색', ...props }: SearchInputProps) {
  const ref = React.useRef<HTMLInputElement>(null);
  const controlled = value !== undefined;
  const [inner, setInner] = React.useState(String(defaultValue ?? ''));
  const current = controlled ? String(value ?? '') : inner;

  const clear = () => {
    if (!controlled) setInner('');
    onClear?.();
    ref.current?.focus();
  };

  return (
    <div className={cn('relative flex w-full items-center', className)}>
      <Search aria-hidden className="pointer-events-none absolute left-inset-sm size-icon-md text-fg-subtle" />
      <Input
        ref={ref}
        type="search"
        placeholder={placeholder}
        disabled={disabled}
        value={controlled ? value : inner}
        onChange={(e) => {
          if (!controlled) setInner(e.currentTarget.value);
          onChange?.(e);
        }}
        className={cn(
          'pl-[calc(var(--spacing-inset-sm)+var(--spacing-icon-md)+var(--spacing-inline-md))]',
          // 브라우저가 그리는 검색 지우기(×)를 끈다 — 아래 버튼과 두 개가 된다.
          '[&::-webkit-search-cancel-button]:appearance-none',
          current && 'pr-[calc(var(--spacing-inset-sm)+var(--spacing-icon-md)+var(--spacing-inline-md))]',
        )}
        {...props}
      />
      {current && !disabled && (
        <button
          type="button"
          aria-label="검색어 지우기"
          onClick={clear}
          className="absolute right-inset-xs inline-flex size-icon-lg items-center justify-center rounded-control border-none bg-transparent text-fg-subtle cursor-pointer hover:text-fg-default ax-focus-ring [&_svg]:size-icon-sm"
        >
          <X aria-hidden />
        </button>
      )}
    </div>
  );
}
