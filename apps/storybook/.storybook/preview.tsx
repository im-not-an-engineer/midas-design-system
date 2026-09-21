import type { Preview } from '@storybook/react-vite';
import { AxTheme } from '@ax/react';
import { axes } from '@ax/tokens';
import './storybook.css';

/**
 * 툴바의 세 축은 contract.json에서 읽는다 — 브랜드·아키타입을 추가하면 툴바가 따라온다.
 * 이 스토리북의 존재 이유는 "아키타입을 바꿨을 때 모든 부품이 같이 움직이는가"를
 * 컴포넌트 하나하나, 상태 하나하나 눈으로 확인하는 것이다.
 */
const preview: Preview = {
  globalTypes: {
    archetype: {
      description: '문법 아키타입 — 치수·간격·모서리·글자 크기',
      toolbar: { title: '아키타입', icon: 'component', items: axes.archetype.values, dynamicTitle: true },
    },
    brand: {
      description: '브랜드 — 램프(색군)와 시맨틱 매핑',
      toolbar: { title: '브랜드', icon: 'paintbrush', items: axes.brand.values, dynamicTitle: true },
    },
    mode: {
      description: '라이트/다크',
      toolbar: { title: '모드', icon: 'circlehollow', items: axes.mode.values, dynamicTitle: true },
    },
  },
  initialGlobals: { archetype: 'base', brand: 'default', mode: 'light' },
  decorators: [
    (Story, { globals, parameters }) =>
      // 테마 랩은 스스로 테마 컨테이너를 만든다 — 편집 중인 색이 랩 UI까지 물들면
      // 대비가 무너져 패널을 읽을 수 없게 된다.
      parameters.axOwnTheme ? (
        <Story />
      ) : (
      <AxTheme
        archetype={globals.archetype}
        brand={globals.brand}
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
