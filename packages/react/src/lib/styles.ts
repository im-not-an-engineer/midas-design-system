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
  'border-width-default border-solid border-field-border-default bg-field-bg-default shadow-control',
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

/** 박스 옆 레이블. 비활성이면 글자도 흐려진다. 글자 크기는 SELECTION_LABEL_SIZE 가 정한다. */
export const SELECTION_LABEL = [
  // 박스와 글자 사이는 inline-md(6px). sm(4px)은 붙어 보이고 lg(8px)은 벌어져 보인다.
  'inline-flex items-center gap-inline-md',
  'font-sans leading-ui text-fg-default select-none cursor-pointer',
  'has-data-disabled:text-fg-disabled has-data-disabled:cursor-not-allowed',
].join(' ');

/** 레이블 글자도 크기를 따라간다 — 박스만 커지고 글자가 그대로면 균형이 어긋난다. */
export const SELECTION_LABEL_SIZE = {
  sm: 'text-caption',
  md: 'text-body',
  lg: 'text-body-lg',
} as const;

/** 항목 묶음(CheckboxGroup, RadioGroup)의 컨테이너. */
export const SELECTION_GROUP = {
  vertical: 'flex flex-col gap-stack-sm',
  horizontal: 'flex flex-wrap items-center gap-inline-lg',
} as const;

export const GROUP_LABEL = 'font-sans text-caption font-medium leading-ui text-fg-default';
export const GROUP_DESCRIPTION = 'font-sans text-caption leading-normal text-fg-muted';

/** 입력 컨트롤(Input, Textarea, Select 트리거, Combobox 입력…)의 공통 외형. 폼 컨트롤은 한 가족이다. */
export const FIELD_CONTROL = [
  'w-full font-sans text-body leading-ui',
  'bg-field-bg-default text-field-fg-default',
  'border-width-default border-solid border-field-border-default rounded-control',
  'shadow-control',
  'placeholder:text-field-fg-placeholder data-placeholder:text-field-fg-placeholder',
  'transition-colors duration-fast ease-standard',
  'ax-focus-ring',
  'hover:not-disabled:not-data-disabled:not-data-invalid:border-field-border-hover',
  'data-invalid:border-field-border-invalid',
  'disabled:bg-field-bg-disabled disabled:text-field-fg-disabled disabled:border-field-border-disabled disabled:cursor-not-allowed',
  'data-disabled:bg-field-bg-disabled data-disabled:text-field-fg-disabled data-disabled:border-field-border-disabled data-disabled:cursor-not-allowed',
  'read-only:bg-field-bg-readonly data-readonly:bg-field-bg-readonly',
].join(' ');

export const FIELD_CONTROL_SIZE = {
  sm: 'h-control-sm px-inset-sm',
  md: 'h-control-md px-inset-sm',
  lg: 'h-control-lg px-inset-md',
} as const;

/** 팝업 면(Menu, Select, Combobox, Popover…). 팝업은 한 가족이다. */
export const POPUP_SURFACE = [
  'min-w-[180px] origin-(--transform-origin) overflow-hidden outline-none',
  'bg-surface-overlay text-fg-default',
  'border border-solid border-border-default rounded-surface shadow-overlay',
  'p-inset-xs font-sans text-body',
  'transition-[opacity,scale] duration-fast ease-standard',
  'data-starting-style:opacity-0 data-starting-style:scale-[0.97]',
  'data-ending-style:opacity-0 data-ending-style:scale-[0.97]',
].join(' ');

/** 팝업 항목. 높이가 control.sm이라 아키타입과 함께 조여진다. */
export const POPUP_ITEM = [
  'relative flex items-center gap-inline-sm',
  'h-control-md px-inset-sm rounded-control',
  'leading-ui outline-none select-none cursor-pointer',
  // 선택은 남아 있는 상태, 하이라이트는 커서가 지금 있는 자리다. 둘이 겹치면
  // 하이라이트가 이겨야 어디를 고르는 중인지 보인다. 클래스를 뒤에 두는 것으로는
  // 안 된다 — Tailwind 가 자기 순서로 정렬해서 data-selected 가 이긴다. 조건으로 뺀다.
  'data-selected:not-data-highlighted:bg-surface-selected',
  'data-checked:not-data-highlighted:bg-surface-selected',
  'data-highlighted:bg-surface-hover',
  'data-disabled:text-fg-disabled data-disabled:pointer-events-none',
  '[&_svg]:size-icon-sm [&_svg]:shrink-0',
].join(' ');

/** 항목 왼쪽의 선택 표시자(체크·점). 키 컬러로 칠한다 — 글자와 같은 색이면 눈에 안 띈다. */
export const POPUP_ITEM_MARKER =
  'absolute left-inset-xs flex size-icon-sm items-center justify-center text-fg-link';

/**
 * 왼쪽에 표시자(체크·점)가 붙는 팝업 항목의 들여쓰기.
 * 표시자 위치(inset-xs) + 표시자 크기(icon-sm) + 표시자와 글자 사이(inline-md).
 *
 * 값을 박으면 아이콘 척도를 바꿨을 때 글자가 표시자를 덮는다 — pl-inset-lg(16px)가
 * 12px 아이콘 기준이었는데 아이콘이 14px 이 되면서 실제로 2px 겹쳤다.
 */
export const POPUP_ITEM_INDENT =
  'pl-[calc(var(--spacing-inset-xs)+var(--spacing-icon-sm)+var(--spacing-inline-md))]';

export const POPUP_GROUP_LABEL = 'px-inset-sm py-inset-xs text-caption font-medium text-fg-muted';
export const POPUP_SEPARATOR = '-mx-inset-xs my-inset-xs h-px bg-border-subtle';
export const POPUP_EMPTY = 'px-inset-sm py-inset-md text-caption text-fg-muted';

/** 모달 계열(Dialog, AlertDialog, Drawer)의 뒷배경. */
export const MODAL_BACKDROP = [
  'fixed inset-0 z-overlay bg-surface-scrim',
  'transition-opacity duration-fast ease-standard',
  'data-starting-style:opacity-0 data-ending-style:opacity-0',
].join(' ');

/** 모달 계열의 면. 위치·크기는 각 컴포넌트가 더한다. */
export const MODAL_SURFACE = [
  'z-modal outline-none',
  'bg-surface-overlay text-fg-default',
  'border border-solid border-border-default shadow-modal',
  'font-sans text-body',
].join(' ');

/** 중앙 다이얼로그의 너비 단계. 밀도가 아니라 가독성 문제라 아키타입과 무관한 px다. */
export const DIALOG_WIDTH = {
  sm: 'max-w-[380px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[800px]',
} as const;

export const DIALOG_TITLE = 'text-heading-sm font-semibold leading-tight tracking-heading text-fg-default';
export const DIALOG_DESCRIPTION = 'text-body leading-normal text-fg-muted';
