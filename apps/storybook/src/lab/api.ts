/* ax-lint-disable-file — 여기 문자열은 클래스가 아니라 토큰 경로·파일 경로다 */

/**
 * 테마 랩 ↔ 개발 서버.
 *
 * 편집 내용은 overlay = { '<src 기준 파일 경로>': <부분 JSON> } 하나로 다룬다.
 * 미리보기·저장·파일 쓰기가 전부 같은 모양을 쓰므로, "지금 편집이 어느 파일로 가는가"가
 * 화면에 그대로 드러난다 — 그게 이 도구가 가르쳐야 할 층 모델이다.
 */

export type Json = any;
export type Overlay = Record<string, Json>;

export interface Layers {
  primitive: string[];
  semantic: string[];
  archetypes: string[];
  brands: string[];
  brandDarks: string[];
}

export interface Sources {
  sources: Record<string, Json>;
  layers: Layers;
}

const isObj = (v: any) => v && typeof v === 'object' && !Array.isArray(v);

/** lib.mjs와 같은 규칙: 토큰 노드는 통째로 교체. */
export function deepMerge(a: Json, b: Json): Json {
  if (!isObj(a) || !isObj(b)) return b;
  if ('$value' in b || '$ramp' in b) return b;
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = k in a ? deepMerge(a[k], v) : v;
  return out;
}

/** 경로 배열을 중첩 객체로. setIn(['palette','blue','600'], {$value:'#f00'}) */
export function setIn(path: string[], leaf: Json): Json {
  return path.reduceRight<Json>((acc, key) => ({ [key]: acc }), leaf);
}

export function getIn(obj: Json, path: string[]): Json {
  return path.reduce((acc, k) => (isObj(acc) ? acc[k] : undefined), obj);
}

/** overlay에 편집 하나를 얹는다. */
export function withEdit(overlay: Overlay, file: string, path: string[], leaf: Json): Overlay {
  return { ...overlay, [file]: deepMerge(overlay[file] ?? {}, setIn(path, leaf)) };
}

/** overlay에서 편집 하나를 되돌린다(같은 파일의 다른 편집은 유지). */
export function withoutEdit(overlay: Overlay, file: string, path: string[]): Overlay {
  const next = structuredClone(overlay);
  const patch = next[file];
  if (!patch) return overlay;
  const parents: Json[] = [patch];
  let cur = patch;
  for (const k of path.slice(0, -1)) { if (!isObj(cur?.[k])) return overlay; cur = cur[k]; parents.push(cur); }
  delete cur[path[path.length - 1]];
  // 빈 껍데기 정리
  for (let i = parents.length - 1; i > 0; i--) if (Object.keys(parents[i]).length === 0) delete parents[i - 1][path[i - 1]];
  if (Object.keys(patch).length === 0) delete next[file];
  return next;
}

/**
 * 편집이 기록될 파일을 정한다. 이게 곧 층 모델이다:
 *   재질(팔레트 헥스) → 모든 테마가 공유하는 창고
 *   램프(어느 재질이 neutral인가) → 브랜드
 *   시맨틱 매핑 → 기본 브랜드면 계약 자체, 파생 브랜드면 그 브랜드
 *   치수 → 기본이면 계약, 아키타입을 골랐으면 그 아키타입
 */
export const targetFile = {
  palette: () => 'primitive/color.json',
  ramp: (brand: string) => `brand/${brand}.json`,
  semanticColor: (brand: string) => (brand === 'default' ? 'semantic/color.json' : `brand/${brand}.json`),
  dimension: (archetype: string, file: 'layout' | 'typography') =>
    archetype === 'base' ? `semantic/${file}.json` : `archetype/${archetype}.json`,
};

async function post(url: string, body: unknown) {
  const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({ error: `응답을 읽지 못했습니다 (${res.status})` }));
  if (!res.ok) throw new Error(data.error ?? `요청 실패 (${res.status})`);
  return data;
}

export const api = {
  async sources(): Promise<Sources> {
    const res = await fetch('/__ax/sources');
    if (!res.ok) throw new Error('개발 서버 없음');
    return res.json();
  },
  async preview(overlay: Overlay, axes: { brand: string; archetype: string; mode: string }): Promise<Record<string, string>> {
    const { vars } = await post('/__ax/preview', { overlay, ...axes });
    return vars;
  },
  async save(overlay: Overlay): Promise<{ files: string[]; log: string }> {
    return post('/__ax/save', { overlay });
  },
};

// ── 소스에서 편집 가능한 항목을 뽑아낸다. 하드코딩하지 않으므로 토큰을 추가하면 랩이 따라온다. ──

export interface ScaleOption { ref: string; group: string; label: string; value: string }

/** primitive의 scale.* 을 참조 문자열 목록으로. 치수 드롭다운의 선택지. */
export function scaleOptions(sources: Record<string, Json>): ScaleOption[] {
  const out: ScaleOption[] = [];
  for (const rel of ['primitive/dimension.json', 'primitive/typography.json']) {
    const scale = sources[rel]?.scale ?? {};
    for (const [group, entries] of Object.entries<Json>(scale)) {
      if (group.startsWith('$')) continue;
      for (const [step, node] of Object.entries<Json>(entries)) {
        if (step.startsWith('$') || !isObj(node) || !('$value' in node)) continue;
        const v = String(node.$value);
        if (!/^-?[\d.]+(px|em|rem)$/.test(v)) continue; // 치수만. 색·굵기·배수는 제외
        out.push({ ref: `{scale.${group}.${step}}`, group, label: `${group}.${step}`, value: v });
      }
    }
  }
  return out;
}

export interface Leaf { path: string[]; ref: string; description?: string }

/** 어떤 JSON에서 $value가 특정 접두사를 참조하는 잎들을 모은다. */
export function leavesReferencing(json: Json, prefix: string, trail: string[] = []): Leaf[] {
  const out: Leaf[] = [];
  for (const [k, v] of Object.entries<Json>(json ?? {})) {
    if (k.startsWith('$')) continue;
    const here = [...trail, k];
    if (isObj(v) && '$value' in v) {
      const ref = String(v.$value);
      if (ref.startsWith(`{${prefix}.`)) out.push({ path: here, ref, description: v.$description });
    } else if (isObj(v)) out.push(...leavesReferencing(v, prefix, here));
  }
  return out;
}

/** 팔레트 이름 → 단계 → 헥스 */
export function palettes(sources: Record<string, Json>): Record<string, Record<string, string>> {
  const pal = sources['primitive/color.json']?.palette ?? {};
  const out: Record<string, Record<string, string>> = {};
  for (const [name, steps] of Object.entries<Json>(pal)) {
    if (name.startsWith('$')) continue;
    out[name] = Object.fromEntries(
      Object.entries<Json>(steps).filter(([s, n]) => !s.startsWith('$') && isObj(n) && '$value' in n).map(([s, n]) => [s, String(n.$value)]),
    );
  }
  return out;
}

/** 현재 브랜드에서 유효한 램프 배정 (브랜드가 덮었으면 그 값, 아니면 default). */
export function effectiveRamps(sources: Record<string, Json>, overlay: Overlay, brand: string): Record<string, string> {
  const read = (rel: string) => deepMerge(sources[rel] ?? {}, overlay[rel] ?? {}).ramp ?? {};
  const merged = { ...read('brand/default.json'), ...(brand === 'default' ? {} : read(`brand/${brand}.json`)) };
  return Object.fromEntries(
    Object.entries<Json>(merged).filter(([k]) => !k.startsWith('$')).map(([k, v]) => [k, String(v.$ramp ?? '')]),
  );
}
