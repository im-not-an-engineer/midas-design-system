/* ax-lint-disable-file — 목데이터 */
export type Doc = { id: string; title: string; drafter: string; kind: string; date: string; state: 'pending' | 'approved' };
const 제목 = ['9월 법인카드 정산', '신규 서버 구매', '외부 교육 참가', '10월 채용 계획', '사무용품 구매', '출장비 선지급', '보안 점검 외주', '행사 대관'];
export const SEED: Doc[] = 제목.map((t, i) => ({ id: `d${i + 1}`, title: t, drafter: ['김민수', '이채연', '박서연', '한지은'][i % 4], kind: i % 2 ? '품의' : '지출', date: `2026-09-${String(29 - i).padStart(2, '0')}`, state: 'pending' }));
