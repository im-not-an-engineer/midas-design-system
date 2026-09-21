import * as React from 'react';
import { Tooltip as Base } from '@base-ui/react/tooltip';
import { cn } from '../lib/cn';
import { usePortalContainer } from '../lib/theme';

/**
 * 오버레이 가족 — Tooltip. 호버·포커스에 뜨는 한두 줄 보조 설명. 포커스를 받지 않고, 상호작용 요소를 넣지 않는다.
 * 그게 필요하면 Popover.
 *
 * 토큰: surface.inverse / fg.onInverse — 이 컴포넌트 때문에 계약에 추가된 첫 키. 밝은 화면 위의 어두운 면.
 *
 * 앱 최상단에 <TooltipProvider>를 한 번 두면 툴팁 사이 이동이 지연 없이 이어진다.
 */

export const TooltipProvider = ({ delay = 400, closeDelay = 0, ...props }: React.ComponentProps<typeof Base.Provider>) => (
  <Base.Provider delay={delay} closeDelay={closeDelay} {...props} />
);

export interface TooltipProps extends Omit<React.ComponentProps<typeof Base.Root>, 'children'> {
  /** 툴팁 본문. */
  content: React.ReactNode;
  /** 트리거 하나. 그대로 렌더되고 이벤트만 붙는다. */
  children: React.ReactElement;
  side?: React.ComponentProps<typeof Base.Positioner>['side'];
  align?: React.ComponentProps<typeof Base.Positioner>['align'];
  sideOffset?: number;
}

export function Tooltip({ content, children, side = 'top', align = 'center', sideOffset = 6, ...props }: TooltipProps) {
  const container = usePortalContainer();
  return (
    <Base.Root {...props}>
      <Base.Trigger render={children} />
      <Base.Portal container={container ?? undefined}>
        <Base.Positioner side={side} align={align} sideOffset={sideOffset} className="z-popover">
          <Base.Popup
            className={cn(
              'max-w-[280px] rounded-control px-inset-sm py-inset-xs',
              'bg-surface-inverse text-fg-on-inverse font-sans text-caption leading-normal shadow-overlay',
              'origin-(--transform-origin) transition-[opacity,scale] duration-fast ease-standard',
              'data-starting-style:opacity-0 data-starting-style:scale-[0.96] data-ending-style:opacity-0 data-ending-style:scale-[0.96]',
            )}
          >
            {content}
          </Base.Popup>
        </Base.Positioner>
      </Base.Portal>
    </Base.Root>
  );
}
