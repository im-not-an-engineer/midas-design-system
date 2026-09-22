/**
 * 토큰 빌드 CLI. 실제 로직은 lib.mjs에 있다 — 테마 랩 개발 서버가 같은 코드를 쓴다.
 */
import { buildAll } from './lib.mjs';
import { unformatted } from '../../scripts/format-tokens.mjs';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');

const lit = (arr) => arr.map((v) => JSON.stringify(v)).join(' | ');

async function main() {
  // 규칙 7: 토큰 소스는 한 가지 포맷이어야 한다. 테마 랩이 저장할 때 JSON을 통째로 다시 쓰므로,
  // 포맷이 제각각이면 값 하나를 바꿔도 파일 전체가 바뀐 것으로 보이고 협업 시 충돌이 난다.
  const bad = await unformatted();
  if (bad.length) throw new Error(
    `토큰 소스 ${bad.length}개의 포맷이 어긋나 있습니다:\n  ${bad.join('\n  ')}\n` +
    `  npm run format:tokens  으로 고치세요. — 규칙 7`);

  const { base, archetypes, brands, dark, contract, css } = await buildAll(src);

  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  await writeFile(path.join(dist, 'tokens.css'), css);
  await writeFile(path.join(dist, 'contract.json'), JSON.stringify(contract, null, 2));
  await writeFile(path.join(dist, 'index.js'),
    `// 자동 생성. 직접 수정하지 마세요.\nconst contract = ${JSON.stringify(contract)};\n` +
    `export const tokens = contract.tokens;\nexport const axes = contract.axes;\nexport const ramps = contract.ramps;\n` +
    `export const cssVars = Object.keys(contract.tokens);\nexport default contract;\n`);
  await writeFile(path.join(dist, 'index.d.ts'),
    `export type TokenName = ${lit(Object.keys(base))};\n\n` +
    `export type Archetype = ${lit(contract.axes.archetype.values)};\nexport type Brand = ${lit(contract.axes.brand.values)};\nexport type Mode = ${lit(contract.axes.mode.values)};\n` +
    `export type Ramp = ${lit(Object.keys(contract.ramps))};\n\n` +
    `export interface TokenMeta { path: string; type?: string; default: string; description: string | null }\n` +
    `export declare const tokens: Record<TokenName, TokenMeta>;\nexport declare const cssVars: TokenName[];\n` +
    `export declare const ramps: Record<Ramp, { default: string }>;\n` +
    `export declare const axes: { archetype: { values: Archetype[] }; brand: { values: Brand[] }; mode: { values: Mode[] } };\n`);

  const n = (m) => String(Object.keys(m).length).padStart(3);
  console.log(`✓ 계약 토큰 ${Object.keys(base).length}개 · 램프 ${Object.keys(contract.ramps).length}개 (${Object.keys(contract.ramps).join(', ')})`);
  for (const [k, m] of Object.entries(archetypes)) console.log(`  아키타입 ${k.padEnd(10)} → ${n(m)}개 덮어씀`);
  for (const [k, b] of Object.entries(brands))     console.log(`  브랜드   ${k.padEnd(10)} → 라이트 ${n(b.light)}개, 다크 보정 ${n(b.dark)}개`);
  console.log(`  모드     dark       → ${n(dark)}개 덮어씀`);
  console.log(`✓ 규칙 1~8 통과 (1층 비노출 · 계약 키만 · 브랜드∩아키타입=∅ · 다크 완전 · 브랜드 다크 책임 · 램프 통째 · 포맷 일치 · 치수 순서)`);
}

main().catch((e) => { console.error('\n✗ 빌드 실패\n' + e.message + '\n'); process.exit(1); });
