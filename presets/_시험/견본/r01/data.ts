/* ax-lint-disable-file — 목데이터 */
export type Account = { id: string; name: string; email: string; dept: string; role: string; active: boolean; lastSeen: string };

export const SEED: Account[] = [
  { id: 'a1', name: '김민수', email: 'minsu.kim@corp.kr', dept: '디자인', role: '구성원', active: true, lastSeen: '2026-09-29' },
  { id: 'a2', name: '이채연', email: 'chaeyeon.lee@corp.kr', dept: '기획', role: '팀장', active: true, lastSeen: '2026-09-28' },
  { id: 'a3', name: '박서연', email: 'seoyeon.park@corp.kr', dept: '개발', role: '구성원', active: true, lastSeen: '2026-09-29' },
  { id: 'a4', name: '정우진', email: 'woojin.jung@corp.kr', dept: '개발', role: '구성원', active: false, lastSeen: '2026-07-02' },
  { id: 'a5', name: '한지은', email: 'jieun.han@corp.kr', dept: '디자인', role: '팀장', active: true, lastSeen: '2026-09-27' },
  { id: 'a6', name: '최현우', email: 'hyunwoo.choi@corp.kr', dept: '영업', role: '구성원', active: true, lastSeen: '2026-09-25' },
  { id: 'a7', name: '윤다연', email: 'dayeon.yoon@corp.kr', dept: '인사', role: '구성원', active: true, lastSeen: '2026-09-29' },
  { id: 'a8', name: '김아름', email: 'areum.kim@corp.kr', dept: '영업', role: '팀장', active: false, lastSeen: '2026-05-11' },
  { id: 'a9', name: '오세훈', email: 'sehoon.oh@corp.kr', dept: '기획', role: '구성원', active: true, lastSeen: '2026-09-20' },
  { id: 'a10', name: '서유나', email: 'yuna.seo@corp.kr', dept: '인사', role: '구성원', active: true, lastSeen: '2026-09-26' },
];

export const DEPTS = [{ value: 'all', label: '전체 부서' }, ...['디자인', '기획', '개발', '영업', '인사'].map((d) => ({ value: d, label: d }))];
export const STATUSES = [{ value: 'all', label: '전체 상태' }, { value: 'active', label: '사용 중' }, { value: 'inactive', label: '비활성' }];
