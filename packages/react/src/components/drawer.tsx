import * as React from 'react';
import { Drawer as Base } from '@base-ui/react/drawer';
import { cn } from '../lib/cn';
import { X } from '../lib/icons';
import { Button } from './button';
import { usePortalContainer } from '../lib/theme';
import { MODAL_BACKDROP, MODAL_SURFACE, DIALOG_TITLE, DIALOG_DESCRIPTION } from '../lib/styles';

/**
 * 오버레이 가족 — Drawer. 화면 가장자리에서 밀려 나오는 패널. 스와이프로 닫힌다(Base UI).
 * 상세 보기·긴 폼처럼 컨텍스트를 유지하며 작업할 때. 짧은 확인은 Dialog.
 *
 * side는 Root(스와이프 방향)와 Content(위치·전환)가 함께 알아야 해서 컨텍스트로 내린다.
 */

type Side = 'right' | 'left' | 'bottom';
const SideCtx = React.createContext<Side>('right');
const SWIPE: Record<Side, React.ComponentProps<typeof Base.Root>['swipeDirection']> = { right: 'right', left: 'left', bottom: 'down' };

export interface DrawerProps extends Omit<React.ComponentProps<typeof Base.Root>, 'swipeDirection'> {
  side?: Side;
}

export function Drawer({ side = 'right', ...props }: DrawerProps) {
  return (
    <SideCtx.Provider value={side}>
      <Base.Root swipeDirection={SWIPE[side]} {...props} />
    </SideCtx.Provider>
  );
}
export const DrawerTrigger = Base.Trigger;
export const DrawerClose = Base.Close;

const VIEWPORT: Record<Side, string> = {
  right: 'justify-end items-stretch',
  left: 'justify-start items-stretch',
  bottom: 'items-end justify-stretch',
};
const POPUP: Record<Side, string> = {
  right: 'h-full w-[min(100vw,420px)] rounded-l-overlay border-r-0 data-starting-style:translate-x-full data-ending-style:translate-x-full',
  left: 'h-full w-[min(100vw,420px)] rounded-r-overlay border-l-0 data-starting-style:-translate-x-full data-ending-style:-translate-x-full',
  bottom: 'w-full max-h-[85dvh] rounded-t-overlay border-b-0 data-starting-style:translate-y-full data-ending-style:translate-y-full',
};

export function DrawerContent({ className, children, ...props }: React.ComponentProps<typeof Base.Popup>) {
  const side = React.useContext(SideCtx);
  const container = usePortalContainer();
  return (
    <Base.Portal container={container ?? undefined}>
      <Base.Backdrop className={MODAL_BACKDROP} />
      <Base.Viewport className={cn('fixed inset-0 z-modal flex pointer-events-none', VIEWPORT[side])}>
        <Base.Popup
          className={cn(MODAL_SURFACE, 'pointer-events-auto flex flex-col transition-transform duration-normal ease-standard', POPUP[side], className)}
          {...props}
        >
          <Base.Content className="flex min-h-0 flex-1 flex-col gap-stack-md overflow-y-auto p-inset-lg">{children}</Base.Content>
        </Base.Popup>
      </Base.Viewport>
    </Base.Portal>
  );
}

/**
 * 제목 + 설명 묶음. 아래 내용과는 구분선으로 나눈다 — Drawer 는 Dialog 와 달리
 * 본문이 길어서 머리말이 어디까지인지 선이 없으면 읽히지 않는다.
 *
 * 구분선은 패널 끝까지 긋는다(-mx-inset-lg). 안쪽 여백만큼 물러나 있으면
 * 영역이 나뉜 게 아니라 장식처럼 보인다.
 */
export function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-stack-xs',
        '-mx-inset-lg px-inset-lg pb-inset-sm border-b border-solid border-border-subtle',
        className,
      )}
      {...props}
    />
  );
}

/** Dialog 보다 한 단계 큰 제목 — 패널이 넓고 오래 머무는 화면이라 머리말이 더 서야 한다. */
export function DrawerTitle({ className, ...props }: React.ComponentProps<typeof Base.Title>) {
  return <Base.Title className={cn(DIALOG_TITLE, 'text-heading-md', className)} {...props} />;
}
export function DrawerDescription({ className, ...props }: React.ComponentProps<typeof Base.Description>) {
  return <Base.Description className={cn(DIALOG_DESCRIPTION, className)} {...props} />;
}
/** 하단 버튼 줄. 내용이 스크롤돼도 항상 보이도록 Content 바깥에 두는 게 아니라 안에서 mt-auto로 붙인다. */
export function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'mt-auto flex items-center justify-end gap-inline-md',
        '-mx-inset-lg px-inset-lg pt-inset-sm border-t border-solid border-border-subtle',
        className,
      )}
      {...props}
    />
  );
}
export function DrawerCloseButton() {
  return <Base.Close render={<Button intent="ghost" iconOnly aria-label="닫기" />}><X aria-hidden /></Base.Close>;
}
