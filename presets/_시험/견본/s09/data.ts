/* ax-lint-disable-file — 목데이터 */
export const DAYS = ['월', '화', '수', '목', '금'];
export const HOURS = [9, 10, 11, 13, 14, 15, 16, 17];
export const ROOMS = [{ value: 'a', label: '회의실 A (6인)' }, { value: 'b', label: '회의실 B (12인)' }];
export type Booking = { day: string; hour: number; title: string; who: string };
export const SEED: Booking[] = [
  { day: '월', hour: 9, title: '주간 계획', who: '김민수' },
  { day: '화', hour: 14, title: '디자인 리뷰', who: '한지은' },
  { day: '목', hour: 10, title: '고객 미팅', who: '이채연' },
];
