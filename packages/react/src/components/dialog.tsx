import * as React from 'react';
import { Dialog as Base } from '@base-ui/react/dialog';
import { cn } from '../lib/cn';
import { Button } from './button';
import { usePortalContainer } from '../lib/theme';
import { MODAL_BACKDROP, MODAL_SURFACE, DIALOG_WIDTH, DIALOG_TITLE, DIALOG_DESCRIPTION, TITLE_DESC_GAP } from '../lib/styles';

/**
 * 레퍼런스 구현 #3 — 오버레이.
 *
 * 포커스 트랩, ESC 닫기, 스크롤 잠금, aria-modal, 열고 닫힐 때의 전환 상태는
 * 전부 Base UI가 한다(①층). 우리가 하는 건 거기에 토큰을 붙이는 것뿐이다(③층).
 *
 * 토큰 매핑:
 *   뒷배경 → --color-surface-scrim
 *   면     → --color-surface-overlay
 *   모서리 → --radius-overlay
 *   그림자 → --shadow-modal
 *   안여백 → --spacing-inset-lg
 *   z      → --z-overlay / --z-modal
 */

export const Dialog = Base.Root;
export const DialogClose = Base.Close;

/** `render`로 우리 Button과 합성한다: <DialogTrigger render={<Button />}>열기</DialogTrigger> */
export const DialogTrigger = Base.Trigger;

export interface DialogContentProps extends React.ComponentProps<typeof Base.Popup> {
  width?: keyof typeof DIALOG_WIDTH;
}

export function DialogContent({ width = 'md', className, children, ...props }: DialogContentProps) {
  const container = usePortalContainer();
  return (
    <Base.Portal container={container ?? undefined}>
      <Base.Backdrop className={MODAL_BACKDROP} />
      <Base.Popup
        className={cn(
          MODAL_SURFACE,
          'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-[calc(100vw-2rem)]',
          DIALOG_WIDTH[width],
          'flex flex-col gap-stack-md rounded-overlay p-inset-lg',
          'transition-[opacity,scale] duration-fast ease-standard',
          'data-starting-style:opacity-0 data-starting-style:scale-[0.97]',
          'data-ending-style:opacity-0 data-ending-style:scale-[0.97]',
          // 다이얼로그도 열릴 때 포커스를 받는다. 컨테이너 링 대신 테두리와 그림자가
          // 경계를 알려주고, 안쪽 컨트롤이 각자 ax-focus-ring을 갖는다.
          'outline-none',
          className,
        )}
        {...props}
      >
        {children}
      </Base.Popup>
    </Base.Portal>
  );
}

export function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col', TITLE_DESC_GAP, className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.ComponentProps<typeof Base.Title>) {
  return (
    <Base.Title
      className={cn(DIALOG_TITLE, className)}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }: React.ComponentProps<typeof Base.Description>) {
  return <Base.Description className={cn(DIALOG_DESCRIPTION, className)} {...props} />;
}

/** 버튼 줄. 순서는 [보조 … 주] 고정 — 화면마다 순서가 바뀌면 사용자가 매번 다시 읽어야 한다. */
export function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex items-center justify-end gap-inline-md pt-inset-sm', className)} {...props} />;
}

/** 자주 쓰는 조립: 취소 + 확인. 파괴적 동작이면 intent="destructive". */
export function DialogConfirmFooter({
  cancelLabel = '취소',
  confirmLabel = '확인',
  intent = 'primary',
  onConfirm,
  confirmDisabled,
}: {
  cancelLabel?: string;
  confirmLabel?: string;
  intent?: 'primary' | 'destructive';
  onConfirm?: () => void;
  confirmDisabled?: boolean;
}) {
  return (
    <DialogFooter>
      <DialogClose render={<Button intent="secondary" />}>{cancelLabel}</DialogClose>
      <Button intent={intent} onClick={onConfirm} disabled={confirmDisabled}>
        {confirmLabel}
      </Button>
    </DialogFooter>
  );
}
