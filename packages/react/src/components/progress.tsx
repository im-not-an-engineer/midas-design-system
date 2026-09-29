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
 * 트랙 두께는 Slider와 같은 식(icon.sm/2.5)에서 나와 아키타입을 따른다 — 둘은 항상 같은 굵기다.
 *
 * 수치 자리(valuePosition): top(기본)은 레이블 줄 오른쪽, end 는 막대와 같은 줄 끝.
 * end 는 표 칸처럼 세로 자리가 좁을 때 쓴다 — 간격과 수치 폭은 Slider 의 showValue 와 같다.
 */

const TRACK = 'relative h-[calc(var(--spacing-icon-sm)/2.5)] w-full overflow-hidden rounded-pill bg-surface-track';
const LABEL = 'font-sans text-caption font-medium leading-ui text-fg-default';
const VALUE = 'font-sans text-caption font-semibold leading-ui tabular-nums text-fg-muted';
// 막대 끝의 수치. 폭을 받쳐 두어야 75% 와 125% 가 섞인 표에서 막대 길이가 줄마다 달라지지 않는다.
// 5ch — '%' 가 숫자보다 넓어 4ch 로는 '100%' 에서 막대가 짧아졌다.
const VALUE_END = 'shrink-0 min-w-[5ch] text-right';
// 막대 ↔ 수치. Slider 와 같은 간격.
const BAR_ROW = 'flex w-full items-center gap-inline-md';

export type ValuePosition = 'top' | 'end';

export interface ProgressProps extends React.ComponentProps<typeof Base.Root> {
  label?: React.ReactNode;
  showValue?: boolean;
  /** 수치 자리. top(기본)은 레이블 줄, end 는 막대 끝. */
  valuePosition?: ValuePosition;
}

export function Progress({ label, showValue, valuePosition = 'top', className, ...props }: ProgressProps) {
  const top = showValue && valuePosition === 'top';
  const end = showValue && valuePosition === 'end';
  const track = (
    <Base.Track className={TRACK}>
      <Base.Indicator
        className={cn(
          'h-full rounded-pill bg-action-primary-bg-default transition-[width] duration-normal ease-standard',
          'data-indeterminate:w-2/5 data-indeterminate:animate-indeterminate',
        )}
      />
    </Base.Track>
  );
  return (
    <Base.Root className={cn('flex w-full flex-col gap-stack-md', className)} {...props}>
      {(label != null || top) && (
        <div className="flex items-center justify-between gap-inline-md">
          {label != null ? <Base.Label className={LABEL}>{label}</Base.Label> : <span />}
          {top && <Base.Value className={VALUE} />}
        </div>
      )}
      {end ? <div className={BAR_ROW}>{track}<Base.Value className={cn(VALUE, VALUE_END)} /></div> : track}
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
  /** 수치 자리. top(기본)은 레이블 줄, end 는 막대 끝. */
  valuePosition?: ValuePosition;
}

export function Meter({ label, showValue, status, valuePosition = 'top', className, ...props }: MeterProps) {
  const top = showValue && valuePosition === 'top';
  const end = showValue && valuePosition === 'end';
  const track = (
    <BaseMeter.Track className={TRACK}>
      <BaseMeter.Indicator className={cn('h-full rounded-pill transition-[width] duration-normal ease-standard', status ? METER_COLOR[status] : 'bg-action-primary-bg-default')} />
    </BaseMeter.Track>
  );
  return (
    <BaseMeter.Root className={cn('flex w-full flex-col gap-stack-md', className)} {...props}>
      {(label != null || top) && (
        <div className="flex items-center justify-between gap-inline-md">
          {label != null ? <BaseMeter.Label className={LABEL}>{label}</BaseMeter.Label> : <span />}
          {top && <BaseMeter.Value className={VALUE} />}
        </div>
      )}
      {end ? <div className={BAR_ROW}>{track}<BaseMeter.Value className={cn(VALUE, VALUE_END)} /></div> : track}
    </BaseMeter.Root>
  );
}
