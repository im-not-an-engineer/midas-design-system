/**
 * 가족이 공유하는 스타일 조각.
 *
 * 폼 컨트롤(Input, Checkbox, Radio, Switch, Select…)은 한 가족이라 테두리·배경·상태 색을
 * 같은 field.* 토큰에서 받고, 팝업(Menu, Select, Combobox…)은 한 가족이라 같은 surface·item
 * 스타일을 쓴다. 여기서 한 번 정의하고 가져다 쓴다 — 컴포넌트마다 다시 적으면 어긋난다.
 */

/** 체크박스·라디오의 '박스'. 크기는 아이콘과 같은 급(size.icon.*)이라 아이콘 옆에 놓아도 줄이 맞는다. */
export const SELECTION_BOX = [
  'relative inline-flex shrink-0 items-center justify-center',
  'border border-solid border-field-border-default bg-field-bg-default',
  'transition-colors duration-fast ease-standard cursor-pointer',
  'ax-focus-ring',
  'hover:not-data-disabled:not-data-checked:border-field-border-hover',
  'data-checked:bg-action-primary-bg-default data-checked:border-action-primary-bg-default',
  'data-indeterminate:bg-action-primary-bg-default data-indeterminate:border-action-primary-bg-default',
  'data-invalid:border-field-border-invalid',
  'data-disabled:cursor-not-allowed data-disabled:bg-field-bg-disabled data-disabled:border-field-border-disabled',
  'data-disabled:data-checked:bg-action-primary-bg-disabled data-disabled:data-checked:border-action-primary-bg-disabled',
].join(' ');

export const SELECTION_BOX_SIZE = {
  sm: 'size-icon-sm',
  md: 'size-icon-md',
  lg: 'size-icon-lg',
} as const;

/** 박스 옆 레이블. 비활성이면 글자도 흐려진다. */
export const SELECTION_LABEL = [
  'inline-flex items-center gap-inline-sm',
  'font-sans text-body leading-ui text-fg-default select-none cursor-pointer',
  'has-data-disabled:text-fg-disabled has-data-disabled:cursor-not-allowed',
].join(' ');

/** 항목 묶음(CheckboxGroup, RadioGroup)의 컨테이너. */
export const SELECTION_GROUP = {
  vertical: 'flex flex-col gap-stack-sm',
  horizontal: 'flex flex-wrap items-center gap-inline-lg',
} as const;

export const GROUP_LABEL = 'font-sans text-caption font-medium leading-ui text-fg-default';
export const GROUP_DESCRIPTION = 'font-sans text-caption leading-normal text-fg-muted';
