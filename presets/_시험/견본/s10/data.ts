/* ax-lint-disable-file — 목데이터 */
export type Contract = { id: string; name: string; partner: string; end: string; state: 'active' | 'expiring' | 'ended'; amount: number };
const 이름 = ['유지보수', '클라우드 사용', '보안 점검', '교육 위탁', '물류 대행', '콜센터 운영', '디자인 용역', '번역 용역', '청소 용역', '인쇄 계약', '광고 대행', '데이터 구매'];
export const SEED: Contract[] = 이름.map((n, i) => ({ id: `k${i + 1}`, name: `${n} 계약`, partner: ['(주)한빛', '누리소프트', '다온상사', '미래물산'][i % 4], end: `2026-${String(10 + (i % 3)).padStart(2, '0')}-${String(5 + i).padStart(2, '0')}`, state: (['active', 'expiring', 'active', 'ended'] as const)[i % 4], amount: 1200 + i * 350 }));
export const ACTIVITY = ['김민수 님이 ‘보안 점검 계약’을 갱신했습니다', '이채연 님이 ‘광고 대행 계약’에 메모를 남겼습니다', '‘청소 용역 계약’이 만료되었습니다', '박서연 님이 ‘데이터 구매 계약’을 등록했습니다'];
export const LABEL = { active: '진행 중', expiring: '만료 임박', ended: '종료' } as const;
export const TONE = { active: 'success', expiring: 'warning', ended: undefined } as const;
