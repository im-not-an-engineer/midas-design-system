/* ax-lint-disable-file — 목데이터 */
export type Claim = {
  id: string; title: string; who: string; dept: string; date: string;
  category: '교통' | '식대' | '숙박' | '소모품'; amount: number; memo: string; receipt: string;
};

export const SEED: Claim[] = [
  { id: 'c1', title: '부산 고객사 방문 KTX', who: '김민수', dept: '영업', date: '2026-09-24', category: '교통', amount: 119600, memo: '왕복. 고객사 미팅 2건.', receipt: 'ktx-0924.pdf' },
  { id: 'c2', title: '분기 워크숍 점심', who: '이채연', dept: '기획', date: '2026-09-25', category: '식대', amount: 184000, memo: '팀원 8명.', receipt: 'lunch-0925.jpg' },
  { id: 'c3', title: '제주 파트너 미팅 숙박', who: '박서연', dept: '개발', date: '2026-09-22', category: '숙박', amount: 236000, memo: '1박. 회사 제휴 호텔.', receipt: 'hotel-0922.pdf' },
  { id: 'c4', title: '프린터 토너', who: '윤다연', dept: '인사', date: '2026-09-26', category: '소모품', amount: 58000, memo: '3층 공용 프린터.', receipt: 'toner.jpg' },
  { id: 'c5', title: '야근 택시', who: '최현우', dept: '영업', date: '2026-09-26', category: '교통', amount: 32400, memo: '23시 40분 퇴근.', receipt: 'taxi-0926.jpg' },
  { id: 'c6', title: '고객 저녁 식사', who: '한지은', dept: '디자인', date: '2026-09-27', category: '식대', amount: 312000, memo: '고객사 4명, 당사 2명.', receipt: 'dinner-0927.jpg' },
  { id: 'c7', title: '프린터 토너 (중복)', who: '윤다연', dept: '인사', date: '2026-09-26', category: '소모품', amount: 58000, memo: '같은 영수증을 두 번 올림.', receipt: 'toner.jpg' },
];

export const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;
