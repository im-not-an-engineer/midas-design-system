import * as React from 'react';
import { Menu as Base } from '@base-ui/react/menu';
import { cn } from '../lib/cn';
import { usePortalContainer } from '../lib/theme';

/**
 * 레퍼런스 구현 #4 — 팝오버 계열의 대표.
 *
 * 항목 높이가 --spacing-control-sm을 쓰는 게 중요하다. 이래야 workbench에서
 * 메뉴가 같이 조여지고, consumer에서 같이 넉넉해진다. 여기에 px를 박으면
 * 아키타입을 바꿔도 메뉴만 안 따라온다.
 *
 * Base UI는 Portal과 Popup 사이에 Positioner가 한 층 더 있다 —
 * 위치 계산(Floating UI)과 시각 표현을 분리하기 위해서다. 간격·정렬은 Positioner,
 * 색·여백은 Popup에 준다.
 */

export const Menu = Base.Root;
export const MenuTrigger = Base.Trigger;
export const MenuSub = Base.SubmenuRoot;
export const MenuRadioGroup = Base.RadioGroup;

const SURFACE = [
  'min-w-[180px] origin-(--transform-origin) overflow-hidden',
  // 팝업 자체에는 포커스 링을 그리지 않는다. 열릴 때 포커스를 받으므로 그냥 두면
  // 브라우저 기본 아웃라인(OS 강조색)이 우리 테마를 뚫고 나온다.
  // 키보드 사용자에게는 항목의 data-highlighted 배경이 위치를 알려준다.
  'outline-none',
  'bg-surface-overlay text-fg-default',
  'border border-solid border-border-default rounded-surface shadow-overlay',
  'p-inset-xs font-sans text-body',
  'transition-[opacity,scale] duration-fast ease-standard',
  'data-starting-style:opacity-0 data-starting-style:scale-[0.97]',
  'data-ending-style:opacity-0 data-ending-style:scale-[0.97]',
].join(' ');

const ITEM = [
  'relative flex items-center gap-inline-sm',
  'h-control-sm px-inset-sm rounded-control',
  'leading-ui outline-none select-none cursor-pointer',
  'data-highlighted:bg-surface-hover',
  'data-disabled:text-fg-disabled data-disabled:pointer-events-none',
  '[&_svg]:size-icon-sm [&_svg]:shrink-0',
].join(' ');

export interface MenuContentProps extends React.ComponentProps<typeof Base.Popup> {
  /** 트리거로부터의 간격. Positioner로 전달된다. */
  sideOffset?: number;
  align?: React.ComponentProps<typeof Base.Positioner>['align'];
  side?: React.ComponentProps<typeof Base.Positioner>['side'];
}

export function MenuContent({ className, sideOffset = 4, align, side, ...props }: MenuContentProps) {
  const container = usePortalContainer();
  return (
    <Base.Portal container={container}>
      <Base.Positioner sideOffset={sideOffset} align={align} side={side} className="z-popover">
        <Base.Popup className={cn(SURFACE, className)} {...props} />
      </Base.Positioner>
    </Base.Portal>
  );
}

export interface MenuItemProps extends React.ComponentProps<typeof Base.Item> {
  /** 삭제처럼 되돌릴 수 없는 항목. */
  destructive?: boolean;
}

export function MenuItem({ className, destructive, ...props }: MenuItemProps) {
  return (
    <Base.Item
      className={cn(ITEM, destructive && 'text-status-danger-fg data-highlighted:bg-status-danger-subtle', className)}
      {...props}
    />
  );
}

export function MenuCheckboxItem({ className, children, ...props }: React.ComponentProps<typeof Base.CheckboxItem>) {
  return (
    <Base.CheckboxItem className={cn(ITEM, 'pl-inset-lg', className)} {...props}>
      <span className="absolute left-inset-xs flex size-icon-sm items-center justify-center">
        <Base.CheckboxItemIndicator aria-hidden>✓</Base.CheckboxItemIndicator>
      </span>
      {children}
    </Base.CheckboxItem>
  );
}

export function MenuRadioItem({ className, children, ...props }: React.ComponentProps<typeof Base.RadioItem>) {
  return (
    <Base.RadioItem className={cn(ITEM, 'pl-inset-lg', className)} {...props}>
      <span className="absolute left-inset-xs flex size-icon-sm items-center justify-center">
        <Base.RadioItemIndicator aria-hidden>•</Base.RadioItemIndicator>
      </span>
      {children}
    </Base.RadioItem>
  );
}

/**
 * 항목 묶음. `label`을 주면 제목이 함께 붙는다.
 *
 * 제목을 별도 컴포넌트로 노출하지 않는 이유: Base UI의 GroupLabel은 Group 밖에서
 * 쓰면 런타임 에러가 난다. 둘을 하나로 묶어두면 그렇게 쓸 수가 없다.
 *
 *   <MenuGroup label="이슈">
 *     <MenuItem>이름 바꾸기</MenuItem>
 *   </MenuGroup>
 */
export interface MenuGroupProps extends React.ComponentProps<typeof Base.Group> {
  label?: React.ReactNode;
}

export function MenuGroup({ label, children, ...props }: MenuGroupProps) {
  return (
    <Base.Group {...props}>
      {label != null && (
        <Base.GroupLabel className="px-inset-sm py-inset-xs text-caption font-medium text-fg-muted">
          {label}
        </Base.GroupLabel>
      )}
      {children}
    </Base.Group>
  );
}

export function MenuSeparator({ className, ...props }: React.ComponentProps<typeof Base.Separator>) {
  return <Base.Separator className={cn('-mx-inset-xs my-inset-xs h-px bg-border-subtle', className)} {...props} />;
}

export function MenuSubTrigger({ className, children, ...props }: React.ComponentProps<typeof Base.SubmenuTrigger>) {
  return (
    <Base.SubmenuTrigger className={cn(ITEM, 'justify-between', className)} {...props}>
      {children}
      <span aria-hidden className="text-fg-subtle">
        ›
      </span>
    </Base.SubmenuTrigger>
  );
}

export function MenuSubContent(props: MenuContentProps) {
  return <MenuContent align="start" side="inline-end" sideOffset={2} {...props} />;
}
