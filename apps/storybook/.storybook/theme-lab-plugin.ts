import type { Plugin } from 'vite';
import { readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const run = promisify(execFile);
const TOKENS = fileURLToPath(new URL('../../../packages/tokens/', import.meta.url));
const SRC = path.join(TOKENS, 'src');
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));

/**
 * 테마 랩 개발 서버.
 *
 * 미리보기와 저장 모두 packages/tokens/lib.mjs 를 그대로 쓴다 — 랩에서 본 것과
 * 빌드 결과가 어긋날 수 없게 하기 위해서다. 클라이언트에서 토큰 해석을 흉내 내면
 * 규칙(1~6)과 조용히 멀어진다.
 *
 * 정적 빌드(GitHub Pages)에는 이 플러그인이 없다 → 랩은 읽기 전용으로 동작한다.
 */
export function themeLab(): Plugin {
  let usageCache: Promise<unknown> | null = null;
  const lib = () => import(/* @vite-ignore */ path.join(TOKENS, 'lib.mjs'));
  const json = (res: any, code: number, body: unknown) => {
    res.statusCode = code;
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
  };
  const readBody = (req: any) =>
    new Promise<any>((resolve, reject) => {
      let raw = '';
      req.on('data', (c: Buffer) => { raw += c; if (raw.length > 4e6) reject(new Error('요청이 너무 큽니다')); });
      req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { reject(e); } });
      req.on('error', reject);
    });

  return {
    name: 'ax-theme-lab',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/__ax/')) return next();
        try {
          const { listLayers, resolveOne, buildAll } = await lib();

          // 랩이 처음 켜질 때: 편집 대상 소스 파일 원본과 층 목록.
          if (req.url === '/__ax/sources') {
            const L = await listLayers(SRC);
            const files = [
              ...L.primitive, ...L.semantic,
              ...L.archetypes.map((n: string) => `archetype/${n}.json`),
              'brand/default.json', ...L.brands.map((n: string) => `brand/${n}.json`),
              ...[...L.brandDarks].map((n: string) => `brand/${n}.dark.json`),
              'mode/dark.json',
            ];
            const sources: Record<string, unknown> = {};
            for (const rel of files) sources[rel] = JSON.parse(await readFile(path.join(SRC, rel), 'utf8'));
            return json(res, 200, { sources, layers: { ...L, brandDarks: [...L.brandDarks] } });
          }

          // 어느 계약 토큰이 어느 컴포넌트에 쓰이는가. 소스를 훑어야 해서 한 번만 만들고 재사용한다.
          // (컴포넌트를 고치면 서버를 다시 켜야 갱신된다 — 토큰 작업 중에는 바뀌지 않는 값이다.)
          if (req.url === '/__ax/usage') {
            usageCache ??= (async () => {
              const { buildUsageIndex } = await import(/* @vite-ignore */ path.join(ROOT, 'scripts/token-usage.mjs'));
              return buildUsageIndex();
            })();
            return json(res, 200, await usageCache);
          }

          // 편집 중 미리보기: 선택한 조합 하나만 해석한다(~13ms). 규칙 검사는 저장할 때.
          if (req.url === '/__ax/preview') {
            const { overlay, brand, archetype, mode } = await readBody(req);
            return json(res, 200, { vars: await resolveOne(SRC, { overlay, brand, archetype, mode }) });
          }

          // 브랜드 색 하나 → 램프 11단계. 기준 램프의 명도·채도 곡선을 빌려 쓴다.
          if (req.url === '/__ax/ramp') {
            const { hex, reference = 'blue', anchorStep } = await readBody(req);
            const { generateRamp } = await import(/* @vite-ignore */ path.join(TOKENS, 'ramp.mjs'));
            const palette = JSON.parse(await readFile(path.join(SRC, 'primitive/color.json'), 'utf8')).palette;
            const ref = Object.fromEntries(
              Object.entries<any>(palette[reference] ?? {}).filter(([k]) => !k.startsWith('$')).map(([k, v]) => [k, v.$value]),
            );
            if (!Object.keys(ref).length) throw new Error(`기준 램프 palette.${reference} 이 없습니다.`);
            return json(res, 200, generateRamp(hex, ref, anchorStep));
          }

          // 저장: 규칙 1~6을 모두 통과해야 파일을 쓴다. 실패하면 아무것도 쓰지 않는다.
          if (req.url === '/__ax/save') {
            const { overlay } = await readBody(req);
            await buildAll(SRC, { overlay }); // 여기서 규칙 위반이면 throw
            for (const [rel, patch] of Object.entries(overlay ?? {})) {
              const file = path.join(SRC, rel);
              const merged = deepMerge(JSON.parse(await readFile(file, 'utf8')), patch);
              await writeFile(file, JSON.stringify(merged, null, 2) + '\n');
            }
            // dist는 CLI가 쓴다 — 사용자가 직접 돌리는 명령과 같은 경로를 타게.
            const { stdout } = await run('node', ['build.mjs'], { cwd: TOKENS });
            return json(res, 200, { ok: true, files: Object.keys(overlay ?? {}), log: stdout.trim() });
          }

          return next();
        } catch (e: any) {
          return json(res, 400, { error: String(e?.message ?? e) });
        }
      });
    },
  };
}

const isObj = (v: any) => v && typeof v === 'object' && !Array.isArray(v);
/** lib.mjs의 병합과 같은 규칙: 토큰 노드는 통째로 교체. */
function deepMerge(a: any, b: any): any {
  if (!isObj(a) || !isObj(b)) return b;
  if ('$value' in b || '$ramp' in b) return b;
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = k in a ? deepMerge(a[k], v) : v;
  return out;
}
