/* ax-lint-disable-file — 목데이터 */
export const SLUG = /^[a-z0-9-]{3,20}$/;
export const SESSIONS = [{ value: '1', label: '1시간' }, { value: '8', label: '8시간' }, { value: '24', label: '24시간' }];
export const INITIAL = { name: 'AX 디자인팀', slug: 'ax-design', mail: true, mention: true, digest: false, twoFactor: false, session: '8' };
