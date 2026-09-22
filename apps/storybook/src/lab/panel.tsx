import * as React from 'react';
import { Button } from '@ax/react';
import {
  type Overlay, type Sources, type Json, api, withEdit, withoutEdit, targetFile,
  scaleOptions, leavesReferencing, palettes, effectiveRamps, deepMerge, getIn,
} from './api';

/* 패널은 미리보기 컨테이너 **밖**에 있어 항상 기본 테마로 그려진다.
   편집 중인 색이 패널까지 물들면 대비가 무너져 스스로를 읽을 수 없게 되기 때문이다. */

const CARD = 'rounded-surface border border-solid border-border-default bg-surface-raised';
const LABEL = 'text-caption font-medium text-fg-default';
const HINT = 'text-caption text-fg-muted';
const SELECT = 'h-control-sm w-full rounded-control border border-solid border-field-border-default bg-field-bg-default px-inset-sm text-body text-field-fg-default ax-focus-ring';

/** 치수 토큰이 고를 수 있는 scale 그룹. 아이콘 자리에 글자 크기를 넣는 식의 실수를 막는다. */
const ALLOWED: Record<string, string[]> = {
  'size.control': ['control', 'space'], 'size.row': ['control', 'space'], 'size.icon': ['icon', 'space'],
  space: ['space'], radius: ['radius'], 'font.size': ['fontSize'],
};
const allowedGroups = (p: string[]) => ALLOWED[p.slice(0, 2).join('.')] ?? ALLOWED[p[0]] ?? [];

function Group({ title, hint, children, defaultOpen }: { title: string; hint?: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(!!defaultOpen);
  return (
    <div className={CARD}>
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-inline-sm rounded-surface px-inset-md py-inset-sm text-left ax-focus-ring cursor-pointer hover:bg-surface-hover">
        <span className="flex flex-col gap-stack-xs"><span className={LABEL}>{title}</span>{hint && <span className={HINT}>{hint}</span>}</span>
        <span aria-hidden className="text-fg-subtle">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="flex flex-col gap-stack-md border-t border-solid border-border-subtle px-inset-md py-inset-md">{children}</div>}
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-inline-md">
      <span className="flex min-w-0 flex-col gap-stack-xs">
        <span className="truncate font-mono text-caption text-fg-default">{label}</span>
        {hint && <span className={`truncate ${HINT}`}>{hint}</span>}
      </span>
      <span className="w-[136px] shrink-0">{children}</span>
    </label>
  );
}

export interface PanelProps {
  sources: Sources;
  overlay: Overlay;
  setOverlay: (next: Overlay) => void;
  axes: { brand: string; archetype: string; mode: string };
  readOnly: boolean;
}

export function Panel({ sources, overlay, setOverlay, axes, readOnly }: PanelProps) {
  const [saving, setSaving] = React.useState(false);
  const [result, setResult] = React.useState<{ ok: boolean; text: string } | null>(null);
  const merged = (rel: string) => deepMerge(sources.sources[rel] ?? {}, overlay[rel] ?? {});
  const edits = flattenOverlay(overlay);

  const edit = (file: string, path: string[], leaf: Json) => { setResult(null); setOverlay(withEdit(overlay, file, path, leaf)); };
  const revert = (file: string, path: string[]) => { setResult(null); setOverlay(withoutEdit(overlay, file, path)); };

  async function save() {
    setSaving(true); setResult(null);
    try {
      const { files } = await api.save(overlay);
      setOverlay({});
      setResult({ ok: true, text: `저장했습니다 — ${files.join(', ')}\n토큰을 다시 빌드했고 규칙 1~6을 통과했습니다.` });
    } catch (e: any) {
      setResult({ ok: false, text: String(e?.message ?? e) });
    } finally { setSaving(false); }
  }

  const pal = palettes(sources.sources, overlay);
  const ramps = effectiveRamps(sources.sources, overlay, axes.brand);
  const scales = scaleOptions(sources.sources);
  const semanticColors = leavesReferencing(merged('semantic/color.json').color ?? {}, 'ramp');

  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col border-l border-solid border-border-default bg-surface-base">
      <header className="flex flex-col gap-stack-sm border-b border-solid border-border-default px-inset-md py-inset-md">
        <div className="flex items-center justify-between gap-inline-sm">
          <h2 className="text-heading-sm font-semibold tracking-heading text-fg-default">테마 랩</h2>
          <span className={HINT}>{axes.brand} · {axes.archetype} · {axes.mode}</span>
        </div>
        {readOnly ? (
          <p className={HINT}>읽기 전용입니다. 편집하려면 <code className="font-mono">npm run storybook</code> 으로 실행하세요.</p>
        ) : (
          <>
            <p className={HINT}>{edits.length ? `${edits.length}개 편집 중 — 저장하면 토큰 소스에 기록됩니다.` : '왼쪽 화면을 보면서 값을 바꿔보세요.'}</p>
            <div className="flex items-center gap-inline-sm">
              <Button size="sm" intent="primary" disabled={!edits.length || saving} onClick={save}>{saving ? '저장 중…' : '저장'}</Button>
              <Button size="sm" intent="ghost" disabled={!edits.length || saving} onClick={() => { setOverlay({}); setResult(null); }}>전체 되돌리기</Button>
            </div>
          </>
        )}
        {result && (
          <pre className={`max-h-[180px] overflow-auto whitespace-pre-wrap rounded-control border border-solid p-inset-sm font-mono text-caption ${
            result.ok ? 'border-status-success-border bg-status-success-subtle text-status-success-fg' : 'border-status-danger-border bg-status-danger-subtle text-status-danger-fg'}`}>{result.text}</pre>
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-stack-sm overflow-y-auto p-inset-md">
        {edits.length > 0 && (
          <Group title="변경 사항" hint={`${edits.length}개`} defaultOpen>
            {edits.map(({ file, path, leaf }) => (
              <div key={`${file}/${path.join('.')}`} className="flex items-center justify-between gap-inline-sm">
                <span className="flex min-w-0 flex-col gap-stack-xs">
                  <span className="truncate font-mono text-caption text-fg-default">{path.join('.')}</span>
                  <span className={`truncate ${HINT}`}>{file} · {String(leaf.$value ?? leaf.$ramp)}</span>
                </span>
                <Button size="sm" intent="ghost" onClick={() => revert(file, path)}>되돌리기</Button>
              </div>
            ))}
          </Group>
        )}

        <BrandRamp palettes={pal} overlay={overlay} setOverlay={setOverlay} brand={axes.brand} readOnly={readOnly} onEdit={() => setResult(null)} />

        <Group title="재질 — 팔레트" hint={`색을 눌러 바꿉니다 · ${targetFile.palette()}`} defaultOpen>
          {Object.entries(pal).map(([name, steps]) => {
            const patched = merged('primitive/color.json').palette?.[name] ?? {};
            return (
              <div key={name} className="flex flex-col gap-stack-xs">
                <span className="font-mono text-caption text-fg-muted">{name}</span>
                <div className="flex flex-wrap gap-inline-xs">
                  {Object.keys(steps).map((step) => {
                    const cur = String(patched[step]?.$value ?? steps[step]);
                    const changed = getIn(overlay[targetFile.palette()], ['palette', name, step]) !== undefined;
                    return (
                      <label key={step} title={`${name}.${step} — ${cur}`}
                        className={`relative size-icon-lg cursor-pointer rounded-control border border-solid ${changed ? 'border-focus-ring border-width-strong' : 'border-border-default'}`}
                        style={{ background: cur }}>
                        <input type="color" disabled={readOnly} value={toHex(cur)} aria-label={`${name}.${step}`}
                          onChange={(e) => edit(targetFile.palette(), ['palette', name, step], { $value: e.target.value })}
                          className="absolute inset-0 size-full cursor-pointer opacity-0" />
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </Group>

        <Group title="역할 — 램프" hint={`어느 재질이 neutral/accent인가 · ${targetFile.ramp(axes.brand)}`}>
          <p className={HINT}>램프를 바꾸면 그 역할을 쓰는 모든 키가 한 번에 바뀝니다. 브랜드가 소유하는 결정입니다.</p>
          {Object.entries(ramps).map(([role, ref]) => (
            <Row key={role} label={role} hint={ref.replace(/[{}]|palette\./g, '')}>
              <select className={SELECT} disabled={readOnly} value={ref}
                onChange={(e) => edit(targetFile.ramp(axes.brand), ['ramp', role], { $ramp: e.target.value })}>
                {Object.keys(pal).map((p) => <option key={p} value={`{palette.${p}}`}>{p}</option>)}
              </select>
            </Row>
          ))}
        </Group>

        {(['layout', 'typography'] as const).map((file) => {
          const leaves = leavesReferencing(merged(`semantic/${file}.json`), 'scale');
          const target = targetFile.dimension(axes.archetype, file);
          return (
            <Group key={file} title={file === 'layout' ? '치수 — 크기 · 간격 · 모서리' : '치수 — 글자'} hint={target}>
              <p className={HINT}>
                {axes.archetype === 'base'
                  ? '기본 아키타입을 고쳤습니다 — 모든 아키타입의 출발점이 바뀝니다.'
                  : `툴바에서 ${axes.archetype}을 골랐으므로 그 아키타입의 delta에 기록됩니다.`}
              </p>
              {leaves.map(({ path, ref, description }) => {
                const groups = allowedGroups(path);
                const opts = scales.filter((o) => groups.includes(o.group));
                const eff = String(getIn(merged(target), path)?.$value ?? ref);
                return (
                  <Row key={path.join('.')} label={path.join('.')} hint={description ?? opts.find((o) => o.ref === eff)?.value}>
                    <select className={SELECT} disabled={readOnly || !opts.length} value={eff}
                      onChange={(e) => edit(target, path, { $value: e.target.value })}>
                      {!opts.some((o) => o.ref === eff) && <option value={eff}>{eff.replace(/[{}]|scale\./g, '')}</option>}
                      {opts.map((o) => <option key={o.ref} value={o.ref}>{o.label} — {o.value}</option>)}
                    </select>
                  </Row>
                );
              })}
            </Group>
          );
        })}

        <Group title="매핑 — 시맨틱 색" hint={targetFile.semanticColor(axes.brand)}>
          {axes.brand !== 'default' ? (
            <p className={HINT}>
              파생 브랜드({axes.brand})의 시맨틱 매핑은 규칙 5에 따라 <code className="font-mono">brand/{axes.brand}.dark.json</code> 도 함께 정해야 합니다.
              랩에서는 기본 브랜드에서만 편집합니다 — 툴바에서 brand를 default로 바꾸세요.
            </p>
          ) : (
            <>
              <p className={HINT}>"primary 버튼은 브랜드색이 아니라 무채색" 같은 결정. 역할 램프와 단계를 고릅니다.</p>
              {semanticColors.map(({ path, ref, description }) => {
                const m = /^\{ramp\.([a-z]+)\.([a-z0-9]+)\}$/i.exec(ref);
                const steps = Object.keys(pal[rampMaterial(ramps, m?.[1] ?? 'neutral')] ?? {});
                return (
                  <Row key={path.join('.')} label={path.join('.')} hint={description}>
                    <span className="flex gap-inline-xs">
                      <select className={SELECT} disabled={readOnly} value={m?.[1] ?? ''}
                        onChange={(e) => edit(targetFile.semanticColor(axes.brand), ['color', ...path], { $value: `{ramp.${e.target.value}.${m?.[2] ?? '600'}}` })}>
                        {Object.keys(ramps).map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <select className={SELECT} disabled={readOnly} value={m?.[2] ?? ''}
                        onChange={(e) => edit(targetFile.semanticColor(axes.brand), ['color', ...path], { $value: `{ramp.${m?.[1] ?? 'neutral'}.${e.target.value}}` })}>
                        {steps.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </span>
                  </Row>
                );
              })}
            </>
          )}
        </Group>
      </div>
    </aside>
  );
}

/**
 * 브랜드가 주는 건 보통 "메인 색 한 개"인데 토큰이 필요로 하는 건 11단계다.
 * 기존 램프의 명도·채도 곡선을 빌려 만들면 accent만 바꿔도 화면의 리듬이 그대로 남는다.
 * 브랜드 색은 어느 한 단계에 **그대로** 들어간다 — 가이드의 헥스가 화면에 없으면
 * "우리 색이 아니다"라는 말을 듣는다.
 */
/**
 * 재질 이름은 색으로만 짓는다. 역할·소유자 이름을 쓰면 배정이 바뀌는 순간 이름이 거짓말이
 * 된다 — palette.brand 를 palette.azure 로 되돌린 적이 있다. 여기서 미리 막는다.
 */
const NOT_A_COLOR = new Set(['brand', 'primary', 'secondary', 'accent', 'main', 'point', 'theme', 'default']);

function BrandRamp({ palettes: pal, overlay, setOverlay, brand, readOnly, onEdit }: {
  palettes: Record<string, Record<string, string>>;
  overlay: Overlay; setOverlay: (o: Overlay) => void; brand: string; readOnly: boolean; onEdit: () => void;
}) {
  const [hex, setHex] = React.useState('#1b62d4');
  const [name, setName] = React.useState('');
  const [reference, setReference] = React.useState('blue');
  const [assign, setAssign] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [note, setNote] = React.useState<string | null>(null);
  const badName = NOT_A_COLOR.has(name);
  const valid = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex.trim()) && /^[a-z][a-z0-9]*$/.test(name) && !badName;

  async function generate() {
    setBusy(true); setNote(null); onEdit();
    try {
      const { ramp, anchorStep } = await api.ramp(hex.trim(), reference);
      let next = withEdit(overlay, targetFile.palette(), ['palette', name],
        Object.fromEntries(Object.entries(ramp).map(([k, v]) => [k, { $value: v }])));
      if (assign) next = withEdit(next, targetFile.ramp(brand), ['ramp', 'accent'], { $ramp: `{palette.${name}}` });
      setOverlay(next);
      setNote(`palette.${name} 을 만들었습니다 — 브랜드 색은 ${anchorStep} 단계에 그대로 들어갔습니다.` +
        (assign ? ` accent를 여기에 배정했습니다.` : ' 아래 "역할 — 램프"에서 accent에 배정하세요.'));
    } catch (e: any) { setNote(`실패: ${String(e?.message ?? e)}`); } finally { setBusy(false); }
  }

  return (
    <Group title="브랜드 색에서 램프 만들기" hint="헥스 한 개 → 11단계" defaultOpen>
      <p className={HINT}>브랜드 가이드의 색 하나를 넣으면 기준 램프의 명도 곡선을 빌려 11단계를 만듭니다.</p>
      <Row label="브랜드 색">
        <span className="flex items-center gap-inline-xs">
          <label className="relative size-control-sm shrink-0 cursor-pointer rounded-control border border-solid border-border-default" style={{ background: valid ? hex : 'transparent' }}>
            <input type="color" disabled={readOnly} value={/^#[0-9a-f]{6}$/i.test(hex) ? hex : '#000000'}
              onChange={(e) => setHex(e.target.value)} className="absolute inset-0 size-full cursor-pointer opacity-0" aria-label="브랜드 색" />
          </label>
          <input value={hex} disabled={readOnly} onChange={(e) => setHex(e.target.value)} spellCheck={false}
            className="h-control-sm w-full min-w-0 rounded-control border border-solid border-field-border-default bg-field-bg-default px-inset-sm font-mono text-body text-field-fg-default ax-focus-ring" />
        </span>
      </Row>
      <Row label="램프 이름" hint="palette.<이름> · 색 이름으로">
        <input value={name} placeholder="cobalt" disabled={readOnly} onChange={(e) => setName(e.target.value)} spellCheck={false}
          className="h-control-sm w-full rounded-control border border-solid border-field-border-default bg-field-bg-default px-inset-sm font-mono text-body text-field-fg-default ax-focus-ring" />
      </Row>
      <Row label="기준 램프" hint="명도 곡선을 빌려올 곳">
        <select className={SELECT} disabled={readOnly} value={reference} onChange={(e) => setReference(e.target.value)}>
          {Object.keys(pal).map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </Row>
      <label className="flex items-center gap-inline-sm text-caption text-fg-default">
        <input type="checkbox" checked={assign} disabled={readOnly} onChange={(e) => setAssign(e.target.checked)} />
        만들면서 accent에 바로 배정 ({targetFile.ramp(brand)})
      </label>
      {badName && (
        <p className={HINT}>
          재질 이름은 색으로 짓습니다. 역할이나 소유자를 이름에 넣으면 배정이 바뀌는 순간 이름이 거짓말이 됩니다 — azure 는 되고 brand 는 안 됩니다.
        </p>
      )}
      <Button size="sm" intent="secondary" disabled={readOnly || !valid || busy} onClick={generate}>
        {busy ? '만드는 중…' : '램프 만들기'}
      </Button>
      {note && <p className={HINT}>{note}</p>}
    </Group>
  );
}

const rampMaterial = (ramps: Record<string, string>, role: string) => (ramps[role] ?? '').replace(/[{}]|palette\./g, '');

/** #rgb·색이름도 <input type="color">가 받는 #rrggbb 로. 실패하면 검정. */
function toHex(v: string) {
  if (/^#[0-9a-f]{6}$/i.test(v)) return v;
  if (/^#[0-9a-f]{3}$/i.test(v)) return '#' + v.slice(1).split('').map((c) => c + c).join('');
  const m = /^rgba?\(([^)]+)\)/.exec(v);
  if (m) {
    const [r, g, b] = m[1].split(',').map((n) => Math.max(0, Math.min(255, Math.round(parseFloat(n)))));
    return '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('');
  }
  return '#000000';
}

interface FlatEdit { file: string; path: string[]; leaf: Json }
function flattenOverlay(overlay: Overlay): FlatEdit[] {
  const out: FlatEdit[] = [];
  const walk = (file: string, node: Json, trail: string[]) => {
    for (const [k, v] of Object.entries<Json>(node ?? {})) {
      const here = [...trail, k];
      if (v && typeof v === 'object' && ('$value' in v || '$ramp' in v)) out.push({ file, path: here, leaf: v });
      else if (v && typeof v === 'object') walk(file, v, here);
    }
  };
  for (const [file, patch] of Object.entries(overlay)) walk(file, patch, []);
  return out;
}
