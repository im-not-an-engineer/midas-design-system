import * as React from 'react';
import { NavigationMenu as Base } from '@base-ui/react/navigation-menu';
import { cn } from '../lib/cn';
import { usePortalContainer } from '../lib/theme';
import { POPUP_SURFACE } from '../lib/styles';

/**
 * 내비 가족 — NavigationMenu. 상단 글로벌 내비. 항목에 호버·포커스하면 하나의 팝업이 항목 사이를 미끄러진다.
 * 팝업이 List 밖 Portal에 하나만 있는 구조라, NavigationMenu가 Portal까지 통째로 감싼다 — 쓰는 쪽은 Item만 나열한다.
 */

const Chevron = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 6l4 4 4-4" /></svg>
);

export function NavigationMenu({ className, children, ...props }: React.ComponentProps<typeof Base.Root>) {
  const container = usePortalContainer();
  return (
    <Base.Root className={cn('relative', className)} {...props}>
      <Base.List className="relative flex items-center gap-inline-xs">{children}</Base.List>
      <Base.Portal container={container ?? undefined}>
        <Base.Positioner sideOffset={8} collisionPadding={16} className="z-popover transition-[top,left,right,bottom] duration-normal ease-standard data-instant:transition-none">
          <Base.Popup
            className={cn(
              POPUP_SURFACE, 'p-0 min-w-0',
              'w-(--popup-width) h-(--popup-height)',
              'transition-[width,height,opacity,scale] duration-normal ease-standard',
            )}
          >
            <Base.Viewport className="relative size-full overflow-hidden" />
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}

export const NavigationMenuItem = Base.Item;

const TRIGGER = [
  'inline-flex h-control-md items-center gap-inline-xs px-inset-md rounded-control',
  'font-sans text-body font-medium leading-ui text-fg-muted select-none cursor-pointer no-underline',
  'transition-colors duration-fast ease-standard ax-focus-ring',
  'hover:text-fg-default hover:bg-surface-hover data-popup-open:text-fg-default data-popup-open:bg-surface-hover data-active:text-fg-default',
  '[&_svg]:size-icon-sm',
].join(' ');

export function NavigationMenuTrigger({ className, children, ...props }: React.ComponentProps<typeof Base.Trigger>) {
  return (
    <Base.Trigger className={cn(TRIGGER, className)} {...props}>
      {children}
      <Base.Icon className="flex text-fg-subtle transition-transform duration-normal ease-standard data-popup-open:rotate-180"><Chevron /></Base.Icon>
    </Base.Trigger>
  );
}

/** 팝업 안에 들어가는 내용. 항목 사이 이동 시 좌우로 미끄러진다. */
export function NavigationMenuContent({ className, ...props }: React.ComponentProps<typeof Base.Content>) {
  return (
    <Base.Content
      className={cn(
        'w-[max-content] max-w-[560px] p-inset-md',
        'transition-[opacity,transform] duration-normal ease-standard',
        'data-starting-style:opacity-0 data-ending-style:opacity-0',
        'data-[activation-direction=left]:data-starting-style:-translate-x-[40px] data-[activation-direction=right]:data-starting-style:translate-x-[40px]',
        'data-[activation-direction=left]:data-ending-style:translate-x-[40px] data-[activation-direction=right]:data-ending-style:-translate-x-[40px]',
        className,
      )}
      {...props}
    />
  );
}

/** 팝업 없는 단순 링크 항목, 또는 팝업 안의 링크. */
export function NavigationMenuLink({ className, ...props }: React.ComponentProps<typeof Base.Link>) {
  return <Base.Link className={cn(TRIGGER, className)} {...props} />;
}

/** 팝업 안에서 쓰는 링크 카드 — 제목 + 한 줄 설명. */
export function NavigationMenuLinkCard({ title, description, className, ...props }: React.ComponentProps<typeof Base.Link> & { title: React.ReactNode; description?: React.ReactNode }) {
  return (
    <Base.Link
      className={cn('flex flex-col gap-stack-xs rounded-control p-inset-sm no-underline ax-focus-ring hover:bg-surface-hover', className)}
      {...props}
    >
      <span className="font-sans text-body font-medium leading-ui text-fg-default">{title}</span>
      {description != null && <span className="font-sans text-caption leading-normal text-fg-muted">{description}</span>}
    </Base.Link>
  );
}
