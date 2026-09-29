/* ax-lint-disable-file — 목데이터 */
export type Row = { line: number; name: string; email: string; dept: string; error?: string };
export const ROWS: Row[] = Array.from({ length: 20 }, (_, i) => ({
  line: i + 2,
  name: ['김', '이', '박', '최', '정'][i % 5] + ['하늘', '바다', '나래', '가온', '다온'][(i * 3) % 5],
  email: i === 6 ? 'no-at-sign' : `new${i + 1}@corp.kr`,
  dept: i === 13 ? '' : ['디자인', '기획', '개발', '영업'][i % 4],
  error: i === 6 ? '이메일 형식이 아닙니다' : i === 13 ? '부서가 비어 있습니다' : undefined,
}));
export const tick = (ms: number) => new Promise((r) => setTimeout(r, ms));
