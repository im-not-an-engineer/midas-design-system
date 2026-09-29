/* ax-lint-disable-file — 목데이터 */
export const PARTNERS = [{ value: 'hanbit', label: '(주)한빛' }, { value: 'nuri', label: '누리소프트' }, { value: 'daon', label: '다온상사' }];
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
