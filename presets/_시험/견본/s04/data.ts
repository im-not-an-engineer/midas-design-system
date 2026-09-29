/* ax-lint-disable-file — 목데이터 */
export type Template = { id: string; name: string; category: string; uses: number; updated: string; summary: string };
const 이름 = ['주간 업무 보고', '회의록', '출장 신청', '구매 요청', '휴가 신청', '신규 입사 안내', '분기 목표', '장애 보고', '고객 인터뷰', '릴리스 노트', '교육 신청', '비용 정산'];
const 분류 = ['보고', '기록', '신청', '신청', '신청', '안내', '계획', '보고', '기록', '안내', '신청', '신청'];
export const SEED: Template[] = 이름.map((n, i) => ({ id: `t${i + 1}`, name: n, category: 분류[i], uses: 120 - i * 9, updated: `2026-09-${String(28 - i).padStart(2, '0')}`, summary: `${n}을(를) 빠르게 쓰기 위한 기본 양식입니다.` }));
