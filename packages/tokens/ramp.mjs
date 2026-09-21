/**
 * 브랜드 색 하나에서 램프(50~950)를 만든다.
 *
 * 왜 필요한가: 브랜드가 주는 건 보통 "메인 색 한 개"인데, 토큰이 필요로 하는 건
 * 11단계다. 단계를 손으로 찍으면 명도 간격이 기존 램프와 어긋나서, accent만 바꿨는데
 * 화면 전체의 리듬이 깨진다.
 *
 * 그래서 **기존 램프의 명도·채도 곡선을 그대로 빌려 쓰고 색상만 갈아끼운다.**
 * 색 공간은 OKLCH — 같은 L 차이가 눈에 같은 밝기 차이로 보이는 공간이라,
 * sRGB에서 밝기를 섞을 때 생기는 탁한 중간톤이 나오지 않는다.
 *
 * 의존성 없이 sRGB ↔ OKLab 변환을 직접 한다(Björn Ottosson).
 */

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function hexToRgb(hex) {
  const h = hex.replace('#', '').trim();
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  if (!/^[0-9a-f]{6}$/i.test(full)) throw new Error(`헥스 값이 아닙니다: ${hex}`);
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
}
const rgbToHex = (rgb) => '#' + rgb.map((c) => Math.round(clamp01(c) * 255).toString(16).padStart(2, '0')).join('');

export function rgbToOklch([r, g, b]) {
  const [R, G, B] = [toLinear(r), toLinear(g), toLinear(b)];
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, Bb), h: (Math.atan2(Bb, A) * 180) / Math.PI };
}

function oklchToRgb({ L, C, h }) {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l_ = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    toSrgb(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_),
    toSrgb(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_),
    toSrgb(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_),
  ];
}

const inGamut = (rgb) => rgb.every((c) => c >= -0.0005 && c <= 1.0005);

/** 색역을 벗어나면 채도를 낮춰 들어올 때까지 줄인다. 명도와 색상은 지킨다. */
function toHexInGamut(oklch) {
  if (inGamut(oklchToRgb(oklch))) return rgbToHex(oklchToRgb(oklch));
  let lo = 0, hi = oklch.C;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklchToRgb({ ...oklch, C: mid }))) lo = mid; else hi = mid;
  }
  return rgbToHex(oklchToRgb({ ...oklch, C: lo }));
}

/**
 * 기준 램프(보통 팔레트에 이미 있는 blue)의 곡선을 빌려 새 램프를 만든다.
 *
 * 브랜드가 준 색은 **어느 한 단계에 그대로 들어간다**(기본은 명도가 가장 가까운 단계).
 * 브랜드 가이드의 헥스가 화면 어디에도 없으면 "우리 색이 아니다"라는 말을 듣게 된다.
 *
 * @param hex         브랜드가 준 색 한 개
 * @param reference   { '50': '#eff6ff', … } 형태의 기존 램프
 * @param anchorStep  브랜드 색을 앉힐 단계. 생략하면 명도가 가장 가까운 곳.
 * @returns           { ramp: { '50': '#…', … }, anchorStep }
 */
export function generateRamp(hex, reference, anchorStep) {
  const source = rgbToOklch(hexToRgb(hex));
  const steps = Object.keys(reference).sort((a, b) => Number(a) - Number(b));
  const curve = steps.map((s) => ({ step: s, ...rgbToOklch(hexToRgb(reference[s])) }));

  const anchor = anchorStep
    ? curve.find((c) => c.step === String(anchorStep)) ?? curve[0]
    : curve.reduce((best, c) => (Math.abs(c.L - source.L) < Math.abs(best.L - source.L) ? c : best));

  // 명도 곡선을 통째로 옮기면 밝은 끝이 흰색에 눌려 50과 100이 같은 색이 된다.
  // 대신 **양 끝(가장 밝은 단계·가장 어두운 단계)은 그대로 두고 가운데만 구부린다** —
  // 기준점이 브랜드 색의 명도를 지나가게 하면서 단계 간 순서와 대비는 유지된다.
  const Lmax = curve[0].L;                    // 50 (가장 밝음)
  const Lmin = curve[curve.length - 1].L;     // 950 (가장 어두움)
  const remapL = (L) => {
    if (L >= anchor.L) {
      const span = Lmax - anchor.L;
      return span < 1e-6 ? L : source.L + ((L - anchor.L) / span) * (Lmax - source.L);
    }
    const span = anchor.L - Lmin;
    return span < 1e-6 ? L : Lmin + ((L - Lmin) / span) * (source.L - Lmin);
  };
  // 그 단계에서 기준 램프가 갖는 채도 대비, 브랜드 색이 얼마나 진한지의 비율.
  const scale = anchor.C > 1e-6 ? source.C / anchor.C : 1;

  const ramp = Object.fromEntries(
    curve.map((c) => [
      c.step,
      c.step === anchor.step
        ? hex.toLowerCase().replace(/^#?/, '#') // 브랜드 색은 변환을 거치지 않고 그대로
        : toHexInGamut({ L: remapL(c.L), C: c.C * scale, h: source.h }),
    ]),
  );
  return { ramp, anchorStep: anchor.step };
}

/** CLI: node ramp.mjs <헥스> [기준램프이름] — 결과를 JSON으로 찍는다. */
if (import.meta.url === `file://${process.argv[1]}`) {
  const [hex, refName = 'blue'] = process.argv.slice(2);
  if (!hex) { console.error('사용법: node ramp.mjs <헥스> [기준램프=blue]'); process.exit(1); }
  const { readFile } = await import('node:fs/promises');
  const src = new URL('./src/primitive/color.json', import.meta.url);
  const palette = JSON.parse(await readFile(src, 'utf8')).palette;
  const reference = Object.fromEntries(
    Object.entries(palette[refName] ?? {}).filter(([k]) => !k.startsWith('$')).map(([k, v]) => [k, v.$value]),
  );
  if (!Object.keys(reference).length) { console.error(`기준 램프 palette.${refName} 이 없습니다.`); process.exit(1); }
  const { ramp, anchorStep } = generateRamp(hex, reference);
  console.error(`기준 램프 ${refName} · 브랜드 색이 앉은 단계: ${anchorStep}`);
  console.log(JSON.stringify(Object.fromEntries(Object.entries(ramp).map(([k, v]) => [k, { $value: v }])), null, 2));
}
