/* ax-lint-disable-file */
/**
 * 사람이 브라우저에서 직접 눌러 보며 UX 정책을 확인할 점검표를 만든다. 저장소 루트에서:
 *   node presets/_시험/직접-확인.mjs ~/Documents/ds-sandbox/kit-on r03
 * 에이전트가 고른 카드의 "보장"을 그대로 옮기고, 명세의 경로(어디를 누르면 되는지)를 사람 말로 붙인다.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import YAML from 'yaml';

const here = path.dirname(fileURLToPath(import.meta.url));
const [appArg, id] = process.argv.slice(2);
const app = path.resolve(appArg ?? '');
const base = 'http://localhost:5195';
const spec = JSON.parse(await readFile(path.join(app, 'src/screens', id, '명세.json'), 'utf8'));
const index = JSON.parse(await readFile(path.join(app, 'src/kit/index.json'), 'utf8'));
const cardFile = Object.fromEntries(index.policy.flatMap((g) => g.카드.map((c) => [c.id, c.파일])));

const say = (loc, paths = {}) => {
  if (loc == null) return '';
  if (typeof loc === 'string') return `“${loc}”`;
  if (Array.isArray(loc)) return loc.map((x) => say(x, paths)).join(' → ');
  const where = loc.안 ? `${typeof loc.안 === 'string' ? (paths[loc.안] ? say(paths[loc.안], paths) : `“${loc.안}”`) : say(loc.안, paths)} 안의 ` : '';
  const what = loc.글자 ? `글자 “${loc.글자}”` : `${{ button: '버튼', menuitem: '메뉴 항목', checkbox: '체크칸', textbox: '입력칸', combobox: '고르기', option: '선택지', row: '표의 행', table: '표', dialog: '창', alertdialog: '확인창', link: '링크', switch: '스위치', toolbar: '작업 줄', listitem: '목록 항목', list: '목록', alert: '알림', meter: '막대', progressbar: '진행 막대', tab: '탭', rowgroup: '표 본문', heading: '제목', menu: '메뉴', region: '영역' }[loc.역할] ?? loc.역할}${loc.이름 ? ` “${loc.이름}”` : ''}`;
  return `${where}${loc.순번 != null ? `${loc.순번 + 1}번째 ` : ''}${what}${loc.입력 ? `에 “${loc.입력}” 입력` : ''}`;
};

const out = [`# ${id} 직접 확인 — ${spec['요구 요약'] ?? ''}`, '', `화면: ${base}/${spec.주소 ?? `#/${id}`}`, `셸: ${spec.셸?.id ?? '없음(멈춤)'}`, ''];
out.push('## 상태 화면', '', ...['empty', 'error', 'loading'].map((s) => `- [ ] ${s === 'empty' ? '빈 화면' : s === 'error' ? '에러' : '로딩'} — ${base}/?state=${s}${spec.주소 ?? `#/${id}`}  (다음 행동이 함께 있는가)`), '');
for (const f of Object.keys(spec['실패 흉내'] ?? {})) out.push(`- [ ] 실패 흉내 “${f}” — ${base}/?fail=${f}${spec.주소}  (${spec['실패 흉내'][f]})`);
out.push('');
for (const p of spec.정책 ?? []) {
  const file = cardFile[p.id];
  if (!file) continue;
  const src = await readFile(path.join(app, 'src/kit', file), 'utf8');
  const front = YAML.parse(/^---\n([\s\S]*?)\n---/.exec(src)[1]);
  const title = (/^#\s+(.+)$/m.exec(src) ?? [])[1];
  out.push(`## ${front.갈래} / ${front.유형} — ${title}`, '', `근거: ${p['근거 조건']}`, '');
  const paths = spec.경로?.[p.id] ?? {};
  const hints = Object.entries(paths).filter(([k, v]) => typeof v === 'object').map(([k, v]) => `${k} = ${say(v, paths)}`);
  if (hints.length) out.push(`어디를: ${hints.join(' · ')}`, '');
  for (const b of front.보장 ?? []) out.push(`- [ ] ${b.문장}`);
  const rule = (/\*\*규칙\*\*\s*([^\n]+(?:\n(?!\n)[^\n]+)*)/.exec(src) ?? [])[1];
  const ban = (/\*\*금지\*\*\s*([^\n]+)/.exec(src) ?? [])[1];
  if (rule) out.push(`- [ ] 규칙: ${rule.replace(/\n/g, ' ')}`);
  if (ban) out.push(`- [ ] 금지된 모양이 없다: ${ban}`);
  out.push('');
}
if (spec['확인 필요']?.length) out.push('## 에이전트가 망설인 것 — 사람이 정할 것', '', ...spec['확인 필요'].map((x) => `- ${x}`), '');
await mkdir(path.join(here, '기록/3단계'), { recursive: true });
const file = path.join(here, '기록/3단계', `${path.basename(app)}-${id}-직접확인.md`);
await writeFile(file, out.join('\n'));
console.log(out.join('\n'));
console.log(`\n저장: ${path.relative(process.cwd(), file)}`);
