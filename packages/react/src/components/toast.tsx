import * as React from 'react';
import { Toast as Base } from '@base-ui/react/toast';
import { cn } from '../lib/cn';
import { TITLE_DESC_GAP } from '../lib/styles';
import { X } from '../lib/icons';
import { usePortalContainer } from '../lib/theme';

/**
 * 오버레이 가족 — Toast. 화면 구석에 잠깐 뜨는 알림. 큐·타이머·스와이프·접근성 알림은 Base UI가 한다.
 *
 *   <ToastProvider>…앱…</ToastProvider>
 *   const toast = useToastManager(); toast.add({ title: '저장됨', type: 'success' })
 *
 * type은 status 토큰 네 가지와 같다: info | success | warning | danger. 왼쪽 띠 색으로만 구분한다 —
 * workbench 정책은 "토스트 최소화, 행 단위 상태로 표현"이므로 토스트 자체를 시끄럽게 만들지 않는다.
 */

export const useToastManager = Base.useToastManager;
export type ToastType = 'info' | 'success' | 'warning' | 'danger';

const TYPE: Record<ToastType, string> = {
  info: 'border-l-status-info-solid',
  success: 'border-l-status-success-solid',
  warning: 'border-l-status-warning-solid',
  danger: 'border-l-status-danger-solid',
};

function ToastList() {
  const { toasts } = Base.useToastManager();
  return toasts.map((toast) => (
    <Base.Root
      key={toast.id}
      toast={toast}
      className={cn(
        'relative w-full rounded-surface border border-solid border-border-default border-l-[3px] bg-surface-overlay shadow-modal',
        'font-sans text-body text-fg-default',
        'transition-[opacity,transform] duration-normal ease-standard',
        'data-starting-style:opacity-0 data-starting-style:translate-y-[8px] data-ending-style:opacity-0 data-ending-style:translate-y-[8px]',
        TYPE[(toast.type as ToastType) ?? 'info'] ?? TYPE.info,
      )}
    >
      <Base.Content className="flex items-start gap-inline-md p-inset-md">
        <div className={cn("flex min-w-0 flex-1 flex-col", TITLE_DESC_GAP)}>
          <Base.Title className="text-body font-semibold leading-ui" />
          <Base.Description className="text-caption leading-normal text-fg-muted" />
          {toast.actionProps && (
            <Base.Action className="mt-stack-xs self-start text-caption font-medium text-fg-link ax-focus-ring rounded-control hover:underline" />
          )}
        </div>
        <Base.Close
          aria-label="닫기"
          className="flex size-icon-lg shrink-0 items-center justify-center rounded-control text-fg-muted ax-focus-ring hover:bg-surface-hover hover:text-fg-default [&_svg]:size-icon-sm"
        >
          <X aria-hidden />
        </Base.Close>
      </Base.Content>
    </Base.Root>
  ));
}

export interface ToastProviderProps extends React.ComponentProps<typeof Base.Provider> {
  position?: 'bottom-right' | 'bottom-center' | 'top-right';
}

const POSITION: Record<NonNullable<ToastProviderProps['position']>, string> = {
  'bottom-right': 'bottom-inset-lg right-inset-lg',
  'bottom-center': 'bottom-inset-lg left-1/2 -translate-x-1/2',
  'top-right': 'top-inset-lg right-inset-lg',
};

export function ToastProvider({ position = 'bottom-right', children, ...props }: ToastProviderProps) {
  const container = usePortalContainer();
  return (
    <Base.Provider {...props}>
      {children}
      <Base.Portal container={container ?? undefined}>
        <Base.Viewport className={cn('fixed z-toast flex w-[min(calc(100vw-2rem),360px)] flex-col gap-stack-sm', POSITION[position])}>
          <ToastList />
        </Base.Viewport>
      </Base.Portal>
    </Base.Provider>
  );
}
