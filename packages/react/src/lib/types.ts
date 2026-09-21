/**
 * 전 컴포넌트가 공유하는 prop 어휘.
 *
 * 이 파일이 존재하는 이유: 에이전트(그리고 사람)가 한 번 배워서 전부에 적용할 수 있어야 한다.
 * small/compact/dense 처럼 같은 뜻의 다른 이름이 섞이면 컴포넌트 개수가 아무리 많아도
 * 환각이 늘어난다. 새 컴포넌트를 추가할 때 여기 있는 이름을 쓰고, 여기 없는 축이
 * 필요하면 먼저 이 파일에 추가해서 전체에 퍼뜨린다.
 */

/** 크기. 어디서나 같은 세 값. 컨트롤 높이는 --spacing-control-{size}에서 온다. */
export type Size = 'sm' | 'md' | 'lg';

/** 누를 수 있는 것의 강조도. 이 네 개 외에는 추가하지 않는다. */
export type Intent = 'primary' | 'secondary' | 'ghost' | 'destructive';

/** 피드백의 종류. */
export type Status = 'info' | 'success' | 'warning' | 'danger';

/** 입력 컨트롤이 공유하는 상태. */
export interface FieldState {
  /** 비활성. 값 제출 안 됨, 포커스 안 받음. */
  disabled?: boolean;
  /** 검증 실패. 테두리와 메시지 색이 danger로 바뀐다. */
  invalid?: boolean;
  /** 필수 입력. 레이블에 표시가 붙는다. */
  required?: boolean;
}
