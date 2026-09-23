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

/**
 * 제목과 그 아래 설명 사이. Dialog·Drawer·Popover·Toast·체크박스 설명까지 전부 같은 값이라
 * 한 곳에 둔다. stack-xs(workbench 2px)일 때는 두 줄이 한 덩어리로 뭉쳐 읽혔다.
 * 척도에 10px 단계가 없어 그 위인 stack-lg(12px)로 맞춘다.
 */
export const TITLE_DESC_GAP = 'gap-stack-lg';
/** 위와 같은 간격을 flex gap 이 아니라 margin 으로 줘야 하는 자리(Popover 처럼 부모가 flex 가 아닐 때). */
export const TITLE_DESC_MARGIN = 'mt-stack-lg';

/** 제목 줄. 아래 설명(GROUP_DESCRIPTION)과 같은 굵기면 어느 쪽이 제목인지 안 보인다. */
export const TITLE_IN_PAIR = 'font-medium text-fg-default';

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

/**
 * 항목 묶음(CheckboxGroup, RadioGroup)의 컨테이너.
 *
 * 설명이 붙으면 항목 하나가 두 줄이 되고, 그 안쪽 간격이 TITLE_DESC_GAP(12px)이다.
 * 항목 사이가 그대로 4px 이면 설명이 아래 항목에 붙어 읽힌다 — 안쪽보다 바깥이 넓어야
 * 묶음이 제대로 나뉜다. 설명이 하나라도 있을 때만 벌리므로, 한 줄짜리 목록은 촘촘하게 남는다.
 */
export const SELECTION_GROUP = {
  vertical: 'flex flex-col gap-stack-sm has-[[data-slot=description]]:gap-stack-xl',
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
/**
 * 팝업 항목의 공통 뼈대.
 *
 * 호버는 중립 회색이다. 커서가 지나가는 것은 뜻이 없는 일시적 표시라, 키 컬러를
 * 여기까지 쓰면 "선택됨"과 구분이 흐려진다. 키 컬러는 선택에만 쓴다(POPUP_ITEM_PICK).
 * Ant Design·Material·Primer 가 쓰는 방식이다.
 */
export const POPUP_ITEM = [
  'relative flex items-center gap-inline-sm',
  'h-control-md px-inset-sm rounded-control',
  'leading-ui outline-none select-none cursor-pointer',
  // 선택된 항목은 호버해도 그대로 둔다 — 이미 골라둔 것이라 회색으로 덮을 이유가 없다.
  'data-highlighted:not-data-selected:not-data-checked:bg-surface-hover',
  'data-disabled:text-fg-disabled data-disabled:pointer-events-none',
  '[&_svg]:size-icon-sm [&_svg]:shrink-0',
].join(' ');

/**
 * 고르는 목록(Select·Combobox·체크 메뉴)의 항목. 선택이라는 남아 있는 상태가
 * 있는 쪽에만 붙인다. 실행 메뉴(이름 바꾸기·삭제)에는 선택이 없어 붙이지 않는다.
 */
export const POPUP_ITEM_PICK = 'data-selected:bg-surface-selected data-checked:bg-surface-selected';

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
