import * as React from 'react';
import { AlertDialog as Base } from '@base-ui/react/alert-dialog';
import { cn } from '../lib/cn';
import { Button } from './button';
import { usePortalContainer } from '../lib/theme';
import { MODAL_BACKDROP, MODAL_SURFACE, DIALOG_WIDTH, DIALOG_TITLE, DIALOG_DESCRIPTION } from '../lib/styles';

/**
 * 오버레이 가족 — AlertDialog. 되돌릴 수 없는 결정을 확인받는다.
 * Dialog와의 차이: 바깥을 눌러도 닫히지 않고, role="alertdialog"로 읽힌다. 스타일은 Dialog와 같다.
 * 파괴적 동작(삭제, 취소 불가 제출)에만 쓴다 — 일반 확인은 Dialog.
 */

export const AlertDialog = Base.Root;
export const AlertDialogTrigger = Base.Trigger;
export const AlertDialogClose = Base.Close;

export interface AlertDialogContentProps extends React.ComponentProps<typeof Base.Popup> {
  width?: keyof typeof DIALOG_WIDTH;
}

export function AlertDialogContent({ width = 'sm', className, children, ...props }: AlertDialogContentProps) {
  const container = usePortalContainer();
  return (
    <Base.Portal container={container ?? undefined}>
      <Base.Backdrop className={MODAL_BACKDROP} />
      <Base.Popup
        className={cn(
          MODAL_SURFACE,
          'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)]',
          DIALOG_WIDTH[width],
          'flex flex-col gap-stack-md rounded-overlay p-inset-lg',
          'transition-[opacity,scale] duration-fast ease-standard',
          'data-starting-style:opacity-0 data-starting-style:scale-[0.97] data-ending-style:opacity-0 data-ending-style:scale-[0.97]',
          className,
        )}
        {...props}
      >
        {children}
      </Base.Popup>
    </Base.Portal>
  );
}

export function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof Base.Title>) {
  return <Base.Title className={cn(DIALOG_TITLE, className)} {...props} />;
}
export function AlertDialogDescription({ className, ...props }: React.ComponentProps<typeof Base.Description>) {
  return <Base.Description className={cn(DIALOG_DESCRIPTION, className)} {...props} />;
}

/** [취소] [확인] 고정 순서. 기본 intent가 destructive인 이유: AlertDialog는 거의 항상 파괴적 동작이다. */
export function AlertDialogConfirmFooter({
  cancelLabel = '취소', confirmLabel = '삭제', intent = 'destructive', onConfirm, confirmDisabled,
}: { cancelLabel?: string; confirmLabel?: string; intent?: 'primary' | 'destructive'; onConfirm?: () => void; confirmDisabled?: boolean }) {
  return (
    <div className="flex items-center justify-end gap-inline-md pt-inset-sm">
      <Base.Close render={<Button intent="secondary" />}>{cancelLabel}</Base.Close>
      <Button intent={intent} onClick={onConfirm} disabled={confirmDisabled}>{confirmLabel}</Button>
    </div>
  );
}
