import type { Preview } from '@storybook/react-vite';
import { AxTheme } from '@ax/react';
import { axes } from '@ax/tokens';
import presetsFile from '../../../packages/tokens/presets.json';
import './storybook.css';

/**
 * 툴바의 세 축은 contract.json에서 읽는다 — 브랜드·아키타입을 추가하면 툴바가 따라온다.
 * 이 스토리북의 존재 이유는 "아키타입을 바꿨을 때 모든 부품이 같이 움직이는가"를
 * 컴포넌트 하나하나, 상태 하나하나 눈으로 확인하는 것이다.
 */
const PRESETS = presetsFile.presets as Record<string, { product: boolean; archetype: string; brand: string; label: string }>;

const preview: Preview = {
  globalTypes: {
    // 제품팀에게는 "이 제품은 이걸 쓰세요" 하나만 보여준다. 아키타입·브랜드라는 내부 축은
    // 테마 랩에서만 다룬다 — 선택지가 많으면 무엇을 써야 할지 알 수 없다.
    preset: {
      description: '제품군 프리셋 — 제품은 이 중 하나를 고정해서 받습니다',
      toolbar: {
        title: '프리셋', icon: 'component', dynamicTitle: true,
        items: Object.entries(PRESETS).map(([value, p]) => ({
          value, title: p.label, right: p.product ? undefined : '검증용',
        })),
      },
    },
    mode: {
      description: '라이트/다크 — 이건 런타임에 바뀝니다',
      toolbar: { title: '모드', icon: 'circlehollow', items: axes.mode.values, dynamicTitle: true },
    },
  },
  initialGlobals: { preset: 'saas', mode: 'light' },
  decorators: [
    (Story, { globals, parameters }) =>
      // 테마 랩은 스스로 테마 컨테이너를 만든다 — 편집 중인 색이 랩 UI까지 물들면
      // 대비가 무너져 패널을 읽을 수 없게 된다.
      parameters.axOwnTheme ? (
        <Story />
      ) : (
      <AxTheme
        archetype={PRESETS[globals.preset]?.archetype}
        brand={PRESETS[globals.preset]?.brand}
        mode={globals.mode}
        className="min-h-screen bg-surface-base p-inset-xl font-sans text-body text-fg-default"
      >
        <Story />
      </AxTheme>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    a11y: { test: 'error' },
    backgrounds: { disable: true },
  },
};
export default preview;
