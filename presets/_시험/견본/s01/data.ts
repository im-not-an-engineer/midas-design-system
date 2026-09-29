/* ax-lint-disable-file — 목데이터 */
export type Account = { id: string; name: string; email: string; dept: string; role: string; active: boolean; docs: number };

const 성 = ['강', '김', '이', '박', '최', '정', '윤', '한', '오', '서'];
const 이름 = ['민준', '서연', '지호', '하은', '도윤', '수아', '시우', '지유', '예준', '하린', '주원', '채원', '건우', '지아', '현우', '서윤'];
const 부서 = ['디자인', '기획', '개발', '영업', '인사'];

export const SEED: Account[] = Array.from({ length: 46 }, (_, i) => ({
  id: `a${i + 1}`,
  name: 성[i % 10] + 이름[(i * 7) % 16],
  email: `user${i + 1}@corp.kr`,
  dept: 부서[i % 5],
  role: i % 7 === 0 ? '팀장' : '구성원',
  active: i % 9 !== 4,
  docs: (i * 3) % 11,
}));

export const DEPTS = [{ value: 'all', label: '전체 부서' }, ...부서.map((d) => ({ value: d, label: d }))];
export const PAGE_SIZE = 10;
export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
