/* ax-lint-disable-file — 목데이터 */
export type Inquiry = { id: string; title: string; customer: string; channel: '메일' | '채팅' | '전화'; days: number; status: 'waiting' | 'answered' | 'closed'; sla: number; body: string };
const 제목 = ['결제 영수증 재발급', '로그인이 안 됩니다', '요금제 변경 문의', '데이터 내보내기 오류', '팀원 초대 메일 미수신', '청구서 주소 변경', '모바일 알림이 오지 않음', 'API 호출 한도', '계정 삭제 요청', '세금계산서 발행'];
const 고객 = ['(주)한빛', '누리소프트', '다온상사', '미래물산', '새봄디자인', '온길랩'];
export const SEED: Inquiry[] = Array.from({ length: 30 }, (_, i) => ({
  id: `q${i + 1}`,
  title: `${제목[i % 10]} #${1040 - i}`,
  customer: 고객[i % 6],
  channel: (['메일', '채팅', '전화'] as const)[i % 3],
  days: i % 40,
  status: (['waiting', 'answered', 'closed'] as const)[i % 3],
  sla: Math.min(100, 20 + ((i * 17) % 90)),
  body: `${고객[i % 6]} 담당자가 보낸 문의입니다. ${제목[i % 10]} 관련으로 확인을 요청했습니다.`,
}));
export const PERIODS = [{ value: '7', label: '최근 7일' }, { value: '30', label: '최근 30일' }, { value: 'all', label: '전체 기간' }];
export const STATUSES = [{ value: 'all', label: '전체 상태' }, { value: 'waiting', label: '답변 대기' }, { value: 'answered', label: '답변 완료' }, { value: 'closed', label: '종료' }];
export const LABEL = { waiting: '답변 대기', answered: '답변 완료', closed: '종료' } as const;
export const TONE = { waiting: 'info', answered: 'success', closed: undefined } as const;
