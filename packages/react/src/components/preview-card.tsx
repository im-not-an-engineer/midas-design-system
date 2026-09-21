import * as React from 'react';
import { PreviewCard as Base } from '@base-ui/react/preview-card';
import { cn } from '../lib/cn';
import { usePortalContainer } from '../lib/theme';
import { POPUP_SURFACE } from '../lib/styles';

/**
 * 오버레이 가족 — PreviewCard. 링크에 호버하면 미리보기가 뜬다(사용자 카드, 이슈 요약).
 * 트리거는 진짜 <a>라서 클릭하면 이동한다 — 미리보기는 덤이다.
 */

export const PreviewCard = Base.Root;

export function PreviewCardTrigger({ className, ...props }: React.ComponentProps<typeof Base.Trigger>) {
  return <Base.Trigger className={cn('text-fg-link underline-offset-2 hover:underline ax-focus-ring rounded-control', className)} {...props} />;
}

export interface PreviewCardContentProps extends React.ComponentProps<typeof Base.Popup> {
  side?: React.ComponentProps<typeof Base.Positioner>['side'];
  align?: React.ComponentProps<typeof Base.Positioner>['align'];
}

export function PreviewCardContent({ side = 'bottom', align = 'start', className, ...props }: PreviewCardContentProps) {
  const container = usePortalContainer();
  return (
    <Base.Portal container={container ?? undefined}>
      <Base.Positioner side={side} align={align} sideOffset={8} className="z-popover">
        <Base.Popup className={cn(POPUP_SURFACE, 'w-[320px] p-inset-md', className)} {...props} />
      </Base.Positioner>
    </Base.Portal>
  );
}
