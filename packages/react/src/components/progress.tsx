import * as React from 'react';
import { Progress as Base } from '@base-ui/react/progress';
import { Meter as BaseMeter } from '@base-ui/react/meter';
import { cn } from '../lib/cn';
import type { Status } from '../lib/types';

/**
 * 표시 가족 — Progress / Meter.
 * Progress: 진행 중인 작업(업로드 60%). value=null 이면 indeterminate(얼마나 남았는지 모름).
 * Meter: 정적인 측정값(저장 공간 80% 사용). 임계에 따라 status 색.
 * 둘은 모양이 같고 의미가 다르다 — 스크린리더가 다르게 읽는다.
 *
 * 트랙 두께는 Slider와 같은 식(icon.sm/3)에서 나와 아키타입을 따른다.
 */

const TRACK = 'relative h-[calc(var(--spacing-icon-sm)/3)] w-full overflow-hidden rounded-pill bg-surface-track';
const LABEL = 'font-sans text-caption font-medium leading-ui text-fg-default';
const VALUE = 'font-sans text-caption font-semibold leading-ui tabular-nums text-fg-muted';

export interface ProgressProps extends React.ComponentProps<typeof Base.Root> {
  label?: React.ReactNode;
  showValue?: boolean;
}

export function Progress({ label, showValue, className, ...props }: ProgressProps) {
  return (
    <Base.Root className={cn('flex w-full flex-col gap-stack-md', className)} {...props}>
      {(label != null || showValue) && (
        <div className="flex items-center justify-between gap-inline-md">
          {label != null ? <Base.Label className={LABEL}>{label}</Base.Label> : <span />}
          {showValue && <Base.Value className={VALUE} />}
        </div>
      )}
      <Base.Track className={TRACK}>
        <Base.Indicator
          className={cn(
            'h-full rounded-pill bg-action-primary-bg-default transition-[width] duration-normal ease-standard',
            'data-indeterminate:w-2/5 data-indeterminate:animate-indeterminate',
            'data-complete:bg-status-success-solid',
          )}
        />
      </Base.Track>
    </Base.Root>
  );
}

const METER_COLOR: Record<Status, string> = {
  info: 'bg-status-info-solid',
  success: 'bg-status-success-solid',
  warning: 'bg-status-warning-solid',
  danger: 'bg-status-danger-solid',
};

export interface MeterProps extends React.ComponentProps<typeof BaseMeter.Root> {
  label?: React.ReactNode;
  showValue?: boolean;
  /** 임계 상태. 생략하면 중립(primary). */
  status?: Status;
}

export function Meter({ label, showValue, status, className, ...props }: MeterProps) {
  return (
    <BaseMeter.Root className={cn('flex w-full flex-col gap-stack-md', className)} {...props}>
      {(label != null || showValue) && (
        <div className="flex items-center justify-between gap-inline-md">
          {label != null ? <BaseMeter.Label className={LABEL}>{label}</BaseMeter.Label> : <span />}
          {showValue && <BaseMeter.Value className={VALUE} />}
        </div>
      )}
      <BaseMeter.Track className={TRACK}>
        <BaseMeter.Indicator className={cn('h-full rounded-pill transition-[width] duration-normal ease-standard', status ? METER_COLOR[status] : 'bg-action-primary-bg-default')} />
      </BaseMeter.Track>
    </BaseMeter.Root>
  );
}
