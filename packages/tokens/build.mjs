/**
 * 토큰 빌드 CLI. 실제 로직은 lib.mjs에 있다 — 테마 랩 개발 서버가 같은 코드를 쓴다.
 */
import { buildAll } from './lib.mjs';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');

const lit = (arr) => arr.map((v) => JSON.stringify(v)).join(' | ');

async function main() {
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
  console.log(`✓ 규칙 1~6 통과 (1층 비노출 · 계약 키만 · 브랜드∩아키타입=∅ · 다크 완전 · 브랜드 다크 책임 · 램프 통째)`);
}

main().catch((e) => { console.error('\n✗ 빌드 실패\n' + e.message + '\n'); process.exit(1); });
