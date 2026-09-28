import * as React from 'react';
import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group';
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { CheckboxGroup as BaseCheckboxGroup } from '@base-ui/react/checkbox-group';
import { cn } from '../lib/cn';
import { CHIP, CHIP_SIZE, CHIP_GROUP, SELECTION_GROUP_WRAP, SELECTION_GROUP_HEADER, GROUP_LABEL, GROUP_DESCRIPTION } from '../lib/styles';
import type { Size } from '../lib/types';

/**
 * 폼 가족 — Chip. 고를 수 있는 알약이다.
 *
 * **Badge 와 다른 물건이다.** Badge 는 못 누르는 라벨(상태 표시)이고, 이건 누르는 것이라
 * 커서·포커스 링·호버·눌림·비활성이 전부 필요하다. 모양만 닮았다 — 알약 생김새는
 * `lib/styles.ts` 의 `CHIP` 에 한 번만 적어 두 가족이 갈라지지 않게 했다.
 *
 * 쓰임이 두 가지라 부품도 두 벌이다. 겉모습은 같고 안이 다르다.
 *
 *   Chip · ChipGroup                 누르는 즉시 반영된다 (목록 거르기, 보기 방식)
 *                                    화살표로 항목 사이를 옮긴다. 폼에 값이 안 실린다.
 *                                    하나만 고르게 하려면 ChipGroup 에 multiple={false}.
 *   ChipCheckbox · ChipCheckboxGroup 폼에 실려 제출된다 (태그 고르기)
 *                                    각 알약이 탭 정거장이고, name 으로 값이 나간다.
 *
 * 헷갈리면 **"저장 버튼을 눌러야 반영되나?"** 로 가른다. 그렇다면 ChipCheckbox 다.
 */

export interface ChipProps extends React.ComponentProps<typeof BaseToggle> {
  /**
   * 기본은 sm(28px)이다. 버튼·입력칸과 같은 높이 사다리를 쓰되 한 칸 아래를 기본으로
   * 둔다 — 알약은 보통 여러 개가 한 줄에 늘어서고, 워크벤치는 밀도가 높은 화면이다.
   * 알약만 있는 줄이 아니라 검색창·버튼과 같은 줄에 선다면 md 로 올려 줄을 맞춘다.
   */
  size?: Size;
}

/** 즉시 반영되는 알약. ChipGroup 안에 넣고 value 를 준다. */
export function Chip({ size = 'sm', className, ...props }: ChipProps) {
  return <BaseToggle data-size={size} className={cn(CHIP, CHIP_SIZE[size], className)} {...props} />;
}

export interface ChipGroupProps extends React.ComponentProps<typeof BaseToggleGroup> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

/**
 * 여러 개를 고르려면 `toggleMultiple`(Base UI 기본값)을 그대로 두고,
 * 하나만 고르게 하려면 `toggleMultiple={false}` 를 준다.
 */
export function ChipGroup({ label, description, className, children, ...props }: ChipGroupProps) {
  const id = React.useId();
  const header = label != null || description != null;
  return (
    <div className={SELECTION_GROUP_WRAP}>
      {header && (
        <div className={SELECTION_GROUP_HEADER}>
          {label != null && <span id={`${id}-label`} className={GROUP_LABEL}>{label}</span>}
          {description != null && <span id={`${id}-desc`} className={GROUP_DESCRIPTION}>{description}</span>}
        </div>
      )}
      <BaseToggleGroup
        aria-labelledby={label != null ? `${id}-label` : undefined}
        aria-describedby={description != null ? `${id}-desc` : undefined}
        className={cn(CHIP_GROUP, className)}
        {...props}
      >
        {children}
      </BaseToggleGroup>
    </div>
  );
}

export interface ChipCheckboxProps extends React.ComponentProps<typeof BaseCheckbox.Root> {
  size?: Size;
}

/**
 * 폼에 실리는 알약. 체크박스라서 화면 읽기 프로그램도 "선택됨/해제됨"으로 읽는다.
 * 네모 상자는 그리지 않는다 — 알약 자체가 켜짐/꺼짐을 말한다.
 */
export function ChipCheckbox({ size = 'sm', className, ...props }: ChipCheckboxProps) {
  return <BaseCheckbox.Root data-size={size} className={cn(CHIP, CHIP_SIZE[size], className)} {...props} />;
}

export interface ChipCheckboxGroupProps extends React.ComponentProps<typeof BaseCheckboxGroup> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

/**
 * 값이 배열 하나로 묶인다: value={['a','b']} onValueChange. 항목에는 value 를 준다.
 *
 * **`name` 은 묶음이 아니라 알약마다 준다.** Base UI 의 CheckboxGroup 에는 name 이 없고,
 * 폼에 나가는 숨은 입력칸은 각 Checkbox 가 들고 있다. 같은 name 을 주면 고른 값이
 * 여러 개로 함께 제출된다.
 */
export function ChipCheckboxGroup({ label, description, className, children, ...props }: ChipCheckboxGroupProps) {
  const id = React.useId();
  const header = label != null || description != null;
  return (
    <div className={SELECTION_GROUP_WRAP}>
      {header && (
        <div className={SELECTION_GROUP_HEADER}>
          {label != null && <span id={`${id}-label`} className={GROUP_LABEL}>{label}</span>}
          {description != null && <span id={`${id}-desc`} className={GROUP_DESCRIPTION}>{description}</span>}
        </div>
      )}
      <BaseCheckboxGroup
        aria-labelledby={label != null ? `${id}-label` : undefined}
        aria-describedby={description != null ? `${id}-desc` : undefined}
        className={cn(CHIP_GROUP, className)}
        {...props}
      >
        {children}
      </BaseCheckboxGroup>
    </div>
  );
}
