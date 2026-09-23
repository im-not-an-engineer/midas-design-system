import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AxTheme } from '@ax/react';
import { affectedComponents, changedVars, type Usage, api, type Overlay, type Sources } from './api';
import { Panel } from './panel';
import { Gallery } from './gallery';
import presetsFile from '../../../../packages/tokens/presets.json';

const PRESETS = presetsFile.presets as Record<string, { archetype: string; brand: string; label: string }>;

/**
 * 테마 랩 — 전 컴포넌트를 띄워놓고 토큰을 일괄 조정한다.
 *
 * 미리보기는 개발 서버가 packages/tokens/lib.mjs 로 실제 해석한 값이다(약 13ms).
 * 클라이언트에서 흉내 내지 않는 이유: 랩에서 본 것과 빌드 결과가 어긋나면
 * 도구가 거짓말을 하게 되고, 그 순간 도구를 믿을 수 없다.
 *
 * 저장하면 규칙 1~6을 모두 통과해야 파일이 쓰인다. 하나라도 어기면 아무것도 쓰지 않고
 * 위반 내용을 그대로 보여준다.
 */
const meta: Meta = {
  title: '테마 랩',
  parameters: { layout: 'fullscreen', axOwnTheme: true, a11y: { test: 'off' } },
};
export default meta;

function Lab({ archetype, brand, mode }: { archetype: string; brand: string; mode: string }) {
  const [sources, setSources] = React.useState<Sources | null>(null);
  const [overlay, setOverlay] = React.useState<Overlay>({});
  const [vars, setVars] = React.useState<Record<string, string> | null>(null);
  // 편집이 무엇을 바꿨는지 알려면 "편집 없는 같은 조합"이 필요하다. 축이 바뀔 때만 다시 받는다.
  const [baseVars, setBaseVars] = React.useState<Record<string, string> | null>(null);
  const [usage, setUsage] = React.useState<Usage | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const readOnly = !!error;

  React.useEffect(() => { api.sources().then(setSources).catch((e) => setError(String(e.message ?? e))); }, []);
  React.useEffect(() => { api.usage().then(setUsage).catch(() => setUsage(null)); }, []);
  React.useEffect(() => {
    if (!sources) return;
    let alive = true;
    api.preview({}, { brand, archetype, mode }).then((v) => alive && setBaseVars(v)).catch(() => alive && setBaseVars(null));
    return () => { alive = false; };
  }, [brand, archetype, mode, sources]);

  // 편집이 멈추면 미리보기를 갱신한다. 색상 선택기를 드래그하는 동안에도 따라올 만큼 가볍다.
  React.useEffect(() => {
    if (!sources) return;
    let alive = true;
    const t = setTimeout(() => {
      api.preview(overlay, { brand, archetype, mode })
        .then((v) => alive && setVars(v))
        .catch(() => alive && setVars(null));
    }, 100);
    return () => { alive = false; clearTimeout(t); };
  }, [overlay, brand, archetype, mode, sources]);

  if (error) {
    return (
      <AxTheme archetype={archetype as never} brand={brand as never} mode={mode as never} className="flex min-h-screen flex-col gap-stack-md bg-surface-base p-inset-xl font-sans">
        <h2 className="text-heading-md font-semibold tracking-heading text-fg-default">테마 랩은 개발 서버에서만 동작합니다</h2>
        <p className="max-w-[560px] text-body leading-normal text-fg-muted">
          토큰을 편집하려면 저장소를 받아 <code className="font-mono">npm run storybook</code> 으로 실행하세요.
          미리보기와 저장이 실제 빌드(<code className="font-mono">packages/tokens/lib.mjs</code>)를 거치기 때문에
          정적으로 배포된 스토리북에서는 열 수 없습니다.
        </p>
        <p className={'text-caption text-fg-subtle'}>서버 응답: {error}</p>
      </AxTheme>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans">
      {/* 미리보기는 이 컨테이너 안에서만 적용된다. 인라인 스타일이라 어떤 규칙보다 우선한다. */}
      {/* AxTheme 이 곧 포털 컨테이너다. 여기에 overflow 를 걸면 스크롤 상자가 되어
          팝업(메뉴·셀렉트·다이얼로그)이 경계에서 잘린다. 스크롤은 안쪽 div 가 맡는다. */}
      <AxTheme
        archetype={archetype as never} brand={brand as never} mode={mode as never}
        style={vars as React.CSSProperties}
        className="relative isolate z-overlay min-h-0 flex-1 bg-surface-base text-body text-fg-default"
      >
        <div className="h-full overflow-y-auto p-inset-xl">
          <Gallery />
        </div>
      </AxTheme>
      {sources && (
        <Panel
          sources={sources} overlay={overlay} setOverlay={setOverlay}
          axes={{ brand, archetype, mode }} readOnly={readOnly}
          affected={affectedComponents(changedVars(baseVars, vars), usage)}
        />
      )}
    </div>
  );
}

export const 랩: StoryObj = {
  render: (_args, { globals }) => {
    const p = PRESETS[globals.preset ?? 'saas'] ?? PRESETS.saas;
    return <Lab archetype={p.archetype} brand={p.brand} mode={globals.mode ?? 'light'} />;
  },
};
