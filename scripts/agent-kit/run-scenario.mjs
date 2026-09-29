/* ax-lint-disable-file — 이 파일의 문자열은 클래스가 아니라 역할·필드 이름이다 */
/**
 * 시나리오 실행기 — 카드의 보장이 실제 화면에서 지켜지는지 브라우저로 확인한다 (샌드박스 앱 루트에서).
 *   node scripts/agent-kit/run-scenario.mjs src/screens/<화면-id> [--기대 유형id,유형id] [--기록 파일.json] [--사진 파일.png]
 *
 * 카드 = 무엇을 보장하나(단계에 이름만 적힌다), 명세.경로 = 그 이름이 내 화면의 어느 요소인가.
 * 이 둘을 합쳐 돌린다. --기대 를 주면 명세가 고른 유형 대신 **정답 유형**의 카드로 돌린다.
 * 상태 슬롯(빈·에러·로딩)은 주소에 ?state= 를 붙여 하나씩 띄워 본다.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { locate, loadKit } from './lib.mjs';

const args = process.argv.slice(2);
const screenDir = path.resolve(args[0] ?? '');
const flag = (k) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : null; };
const where = await locate();
const kit = await loadKit(where.kit);
const cards = new Map(kit.groups.flatMap((g) => g.cards.map((c) => [c.id, c])));
const spec = JSON.parse(await readFile(path.join(screenDir, '명세.json'), 'utf8'));
const shell = kit.shells.find((s) => s.id === spec.셸.id);
const PORT = Number(process.env.PORT ?? 5199);
const BASE = `http://localhost:${PORT}/`;
const TIMEOUT = 4000;

const expected = flag('--기대')?.split(',');
const targetIds = expected ?? spec.정책.map((p) => p.id);

// ── 서버 ───────────────────────────────────────────────────────────────────
const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { cwd: where.root, stdio: 'pipe' });
const stop = () => { try { server.kill(); } catch {} };
process.on('exit', stop);
for (let i = 0; ; i++) {
  try { if ((await fetch(BASE)).ok) break; } catch {}
  if (i > 60) { console.error('✗ 개발 서버가 뜨지 않습니다'); process.exit(2); }
  await new Promise((r) => setTimeout(r, 500));
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const rows = [];

async function open(state) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}${state ? `?state=${state}` : ''}${spec.주소}`);
  await page.locator('[data-shell]').first().waitFor({ timeout: TIMEOUT });
  return page;
}

// ── 0. 사진 (시각 검토용) ──────────────────────────────────────────────────
const shot = flag('--사진');
if (shot) {
  const page = await open(null);
  // 처음에 불러오기를 흉내 내는 화면이 있다 — 준비된 상태가 될 때까지 조금 기다린 뒤 찍는다
  await page.locator('[data-shell-state="ready"]').first().waitFor({ timeout: 6000 }).catch(() => {});
  await page.waitForTimeout(300);
  await page.screenshot({ path: shot, fullPage: true });
  await page.close();
}

// ── 1. 상태 슬롯 ───────────────────────────────────────────────────────────
for (const st of ['empty', 'error', 'loading']) {
  if (!shell.슬롯[st]?.상태) continue;
  const declared = spec.슬롯?.[st];
  if (declared && typeof declared === 'object' && declared.없음) { rows.push({ 카드: '상태', 보장: st, 결과: '해당 없음', 메모: declared.없음 }); continue; }
  const page = await open(st);
  try {
    await page.locator(`[data-shell-state="${st}"]`).waitFor({ timeout: TIMEOUT });
    const region = page.locator('[data-slot="region"]').first();
    const filled = (await region.innerText()).trim().length > 0 || (await region.locator('svg,[role]').count()) > 0;
    rows.push({ 카드: '상태', 보장: `${st} 가 그려진다`, 결과: filled ? '통과' : '실패', 메모: filled ? (await region.innerText()).trim().slice(0, 40).replace(/\n/g, ' ') : '자리가 비어 있음' });
  } catch (e) { rows.push({ 카드: '상태', 보장: st, 결과: '실패', 메모: e.message.split('\n')[0] }); }
  await page.close();
}

// ── 2. 카드 보장 ───────────────────────────────────────────────────────────
for (const id of targetIds) {
  const card = cards.get(id);
  if (!card) { rows.push({ 카드: id, 보장: '-', 결과: '실패', 메모: '카드 없음' }); continue; }
  if (card.검사 !== '시나리오') { rows.push({ 카드: id, 보장: '(전체)', 결과: '해당 없음', 메모: `검사 방식: ${card.검사}` }); continue; }
  let paths = spec.경로?.[id];
  let borrowed = null;
  if (!paths) {
    // 유형을 잘못 골랐으면 정답 카드의 경로가 없다. 같은 갈래에서 고른 카드의 경로를 빌려
    // 정답 유형의 보장을 그대로 돌린다 — "틀렸다"가 아니라 "어떻게 다르게 움직이는가"가 드러난다.
    borrowed = spec.정책.map((p) => cards.get(p.id)).find((c) => c && c.갈래 === card.갈래 && spec.경로?.[c.id]);
    if (borrowed) paths = spec.경로[borrowed.id];
    else { rows.push({ 카드: id, 보장: '(전체)', 결과: '실패', 메모: '이 갈래를 다루지 않았다 (명세에 같은 갈래 카드가 없음)' }); continue; }
  }
  for (const g of card.보장) {
    const page = await open(null);
    try {
      // 명세 경로의 '준비' = 보장을 보기 전에 먼저 누를 것 (고른 뒤에만 보이는 막대 등)
      await runSteps(page, [...(paths.준비 ? [{ 누르기: '준비' }] : []), ...g.단계], paths);
      rows.push({ 카드: id, 보장: g.문장, 결과: '통과', 메모: borrowed ? `${borrowed.id} 의 경로로` : '' });
    } catch (e) {
      rows.push({ 카드: id, 보장: g.문장, 결과: '실패', 메모: `${borrowed ? `[고른 유형 ${borrowed.유형}] ` : ''}${e.message.split('\n')[0].slice(0, 120)}` });
    }
    await page.close();
  }
}

await browser.close();
stop();

console.log(`\n화면 ${path.basename(screenDir)} — 시나리오${expected ? ` (정답 유형: ${expected.join(', ')})` : ''}\n`);
console.log('| 카드 | 보장 | 결과 | 메모 |\n|---|---|---|---|');
for (const r of rows) console.log(`| ${r.카드} | ${r.보장} | ${r.결과} | ${String(r.메모).replace(/\|/g, '/')} |`);
const fails = rows.filter((r) => r.결과 === '실패').length;
console.log(`\n${fails ? `✗ 실패 ${fails}` : '✓ 통과'}\n`);
const out = flag('--기록');
if (out) await writeFile(out, JSON.stringify({ 화면: path.basename(screenDir), 기대: expected, rows }, null, 2));
process.exit(fails ? 1 : 0);

// ── 단계 실행 ──────────────────────────────────────────────────────────────
async function runSteps(page, steps, paths) {
  const mem = {};
  const entry = (name) => {
    const v = paths[name];
    if (v == null) throw new Error(`경로 '${name}' 없음`);
    return v;
  };
  /** 경로 한 칸 → Playwright 로케이터 (모두). */
  // hidden: 모달이 열리면 뒤쪽 화면이 aria-hidden 이 된다. 개수는 그래도 세야 하므로 셀 때만 숨은 것도 본다.
  const all = (loc, hidden = false) => {
    let scope = page;
    if (loc.안) scope = typeof loc.안 === 'string' ? one(entry(loc.안), undefined, hidden) : one(loc.안, undefined, hidden);
    // 역할이 없는 요소(칸 아래 오류 문구 등)는 { "글자": "…" } 로 가리킨다
    if (loc.글자) return scope.getByText(loc.글자);
    return scope.getByRole(loc.역할, { ...(loc.이름 ? { name: loc.이름 } : {}), ...(hidden ? { includeHidden: true } : {}) });
  };
  const one = (loc, 순번, hidden = false) => {
    const l = all(loc, hidden);
    const n = 순번 ?? loc.순번;
    return n != null ? l.nth(n) : l.first();
  };
  const last = (name) => [entry(name)].flat().at(-1);
  const poll = async (fn, what) => { // what: 실패 때 부르는 함수 (그 순간의 값으로 메시지를 만든다)
    const t0 = Date.now();
    for (;;) {
      if (await fn()) return;
      if (Date.now() - t0 > TIMEOUT) throw new Error(typeof what === 'function' ? what() : what);
      await page.waitForTimeout(100);
    }
  };
  const countOf = async (name) => all(last(name), true).count();
  const memText = {};
  /** 카드에 적힌 값이 경로 이름이면 명세의 값으로 바꾼다 ("입력값" → "Alpha 프로젝트"). */
  // { 경로: 이름 } 이면 명세 경로의 값, 문자열이 경로 이름이면 그 값(입력의 값), 아니면 그대로
  const val = (x) => (x && typeof x === 'object' && x.경로 ? paths[x.경로] : typeof x === 'string' && typeof paths[x] === 'string' ? paths[x] : x);

  for (const step of steps) {
    const [kind, v] = Object.entries(step)[0];
    if (kind === '기억') mem[v] = await countOf(v);
    else if (kind === '기억글자') memText[v] = await one(last(v)).innerText();
    else if (kind === '누르기') {
      const name = typeof v === 'string' ? v : v.경로;
      const seq = [entry(name)].flat();
      for (const [i, loc] of seq.entries()) {
        const target = one(loc, i === seq.length - 1 && typeof v === 'object' ? v.순번 : undefined);
        // 경로 한 칸에 "입력" 이 있으면 누르지 않고 그 글자를 넣는다 (검색칸으로 조건 바꾸기 등)
        if (loc.입력 != null) { await target.fill(String(loc.입력), { timeout: TIMEOUT }); continue; }
        await target.click({ timeout: TIMEOUT }).catch((e) => { throw new Error(`누르기 ${name}${seq.length > 1 ? `[${i}]` : ''}: ${loc.역할} '${loc.이름 ?? ''}' 를 누르지 못함 — ${e.message.split('\n')[0]}`); });
      }
    } else if (kind === '보인다') {
      await one(last(v)).waitFor({ state: 'visible', timeout: TIMEOUT }).catch(() => { throw new Error(`보인다 ${v}: ${last(v).역할} '${last(v).이름 ?? ''}' 가 보이지 않음`); });
    } else if (kind === '안보인다') {
      await one(last(v)).waitFor({ state: 'hidden', timeout: TIMEOUT }).catch(() => { throw new Error(`안보인다 ${v}: 아직 보임`); });
    } else if (kind === '개수') {
      const base = mem[v.대상];
      let got;
      const same = v.같음 != null ? Number(val(v.같음)) : null;
      const test = same != null ? (n) => n === same
        : v.늘어남 ? (n) => n > base
        : v.달라짐 ? (n) => n !== base
        : (n) => n === base + v.차이;
      const want = same != null ? `${same}` : v.늘어남 ? `${base} 보다 많아야` : v.달라짐 ? `${base} 가 아니어야` : `${base + v.차이}`;
      await poll(async () => test((got = await countOf(v.대상))), () => `개수 ${v.대상}: ${want} 하는데 ${got}`);
    } else if (kind === '막힘없음') {
      await page.waitForTimeout(300);
      // 막는 창의 표시는 두 가지다: 창 자신의 aria-modal, 또는 뒤쪽 화면에 걸린 aria-hidden/inert
      // (Base UI 는 뒤쪽을 aria-hidden 으로 막고 aria-modal 은 달지 않는다).
      const blocked = await page.evaluate(() => {
        const shell = document.querySelector('[data-shell]');
        const behind = !!shell?.closest('[aria-hidden="true"],[inert]');
        const modal = [...document.querySelectorAll('[aria-modal="true"]')].some((e) => e.checkVisibility?.() ?? true);
        return behind || modal;
      });
      if (blocked) throw new Error('막힘없음: 화면을 막는 창이 떠 있음 (뒤쪽 화면이 가려짐)');
    } else if (kind === '비활성' || kind === '활성') {
      const want = kind === '비활성';
      await poll(async () => (await one(last(v)).isDisabled()) === want, `${kind} ${v}: 반대 상태`);
    } else if (kind === '바쁨') {
      // 버튼 안 로딩: aria-busy (우리 Button 의 loading) 이 서야 한다
      await poll(async () => (await one(last(v)).getAttribute('aria-busy')) === 'true', `바쁨 ${v}: 기다리는 표시(aria-busy)가 없음`);
    } else if (kind === '입력') {
      await one(last(v.곳)).fill(String(val(v.값)), { timeout: TIMEOUT });
    } else if (kind === '떠나기') {
      await one(last(v)).focus();
      await page.keyboard.press('Tab');
    } else if (kind === '값') {
      let cur = '';
      const want = String(val(v.포함));
      await poll(async () => (cur = await one(last(v.곳)).inputValue()).includes(want), () => `값 ${v.곳}: '${want}' 이어야 하는데 '${cur}'`);
    } else if (kind === '글자') {
      let text = '';
      if (v.달라짐) await poll(async () => (text = await one(last(v.곳)).innerText()) !== memText[v.곳], () => `글자 ${v.곳}: 바뀌지 않음 ('${text.slice(0, 40)}')`);
      else if (v.그대로) { await page.waitForTimeout(300); text = await one(last(v.곳)).innerText(); if (text !== memText[v.곳]) throw new Error(`글자 ${v.곳}: 바뀜 ('${memText[v.곳]?.slice(0, 30)}' → '${text.slice(0, 30)}')`); }
      else {
        const want = String(val(v.포함));
        await poll(async () => (text = await one(last(v.곳)).innerText()).includes(want), () => `글자 ${v.곳}: '${want}' 없음 (지금 '${text.slice(0, 40)}')`);
      }
    } else if (kind === '기다리기') {
      await page.waitForTimeout(Number(v) * 1000);
    } else if (kind === '다시열기') {
      await page.reload();
      await page.locator('[data-shell]').first().waitFor({ timeout: TIMEOUT });
    } else if (kind === '실패로열기') {
      const action = val(v);
      await page.goto(`${BASE}?fail=${encodeURIComponent(action)}${spec.주소}`);
      await page.locator('[data-shell]').first().waitFor({ timeout: TIMEOUT });
    } else throw new Error(`모르는 단계 ${kind}`);
  }
}
