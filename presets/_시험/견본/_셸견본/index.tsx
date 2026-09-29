import * as React from 'react';

/**
 * 셸 견본 — 에이전트가 보지 않는 시험용 화면. 셸마다 슬롯 자리에 이름표 상자를 채워 뼈대를 보인다.
 * 주소 #/_셸견본?id=<셸 id> 로 하나만 볼 수 있다 (사진용).
 */
const mods = import.meta.glob('../../kit/shells/*/shell.tsx', { eager: true }) as Record<string, Record<string, unknown>>;
const metas = import.meta.glob('../../kit/shells/*/shell.json', { eager: true, import: 'default' }) as Record<string, any>;

function Box({ name, desc, tall }: { name: string; desc?: string; tall?: boolean }) {
  return (
    <div className={`flex flex-col gap-stack-xs rounded-control border-width-default border-dashed border-border-strong bg-surface-subtle p-inset-sm ${tall ? 'min-h-[160px]' : ''}`}>
      <span className="text-caption font-semibold text-fg-link">{name}</span>
      {desc && <span className="text-caption text-fg-muted">{desc}</span>}
    </div>
  );
}
const TALL = new Set(['body', 'list', 'detail', 'main', 'items', 'columns', 'grid', 'matrix', 'table', 'timeline', 'sections', 'item', 'groups', 'review', 'upload', 'start']);

export default function Screen() {
  const only = new URLSearchParams(window.location.search).get('id');
  const shells = Object.entries(metas)
    .map(([file, meta]) => {
      const mod = mods[file.replace('shell.json', 'shell.tsx')];
      const Comp = Object.entries(mod).find(([k, v]) => typeof v === 'function' && k.endsWith('Shell'))?.[1] as React.ComponentType<any>;
      return { meta, Comp };
    })
    .filter((s) => !only || s.meta.id === only);
  return (
    <div data-shell="_견본" className="flex flex-col gap-section-lg">
      {shells.map(({ meta, Comp }) => {
        const props: Record<string, unknown> = { state: 'ready', hasFolder: true, hasQuery: true, ...(meta.견본 ?? {}) };
        for (const [name, def] of Object.entries<any>(meta.슬롯)) {
          if (name in props) continue;
          props[name] = name === 'columns' && meta.id === 'compare' ? [<Box key="a" name="columns[0]" tall />, <Box key="b" name="columns[1]" tall />] : <Box name={name} desc={def.설명} tall={TALL.has(name)} />;
        }
        return (
          <section key={meta.id} data-견본={meta.id} className="flex flex-col gap-stack-md">
            <h2 className="text-heading-sm font-semibold text-fg-muted">{meta.id} · {meta.이름}</h2>
            <div className="rounded-surface bg-surface-sunken p-inset-lg">{Comp ? <Comp {...props} /> : '컴포넌트 없음'}</div>
          </section>
        );
      })}
    </div>
  );
}
