import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // 스토리는 컴포넌트 옆에 둔다. 그래야 계약 린트(scripts/check-contract.mjs)가 스토리의 클래스도 검사한다.
  stories: ['../../../packages/react/src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: '@storybook/react-vite',
  core: { disableTelemetry: true },
  async viteFinal(cfg) {
    const tailwindcss = (await import('@tailwindcss/vite')).default;
    cfg.plugins = [...(cfg.plugins ?? []), tailwindcss()];
    return cfg;
  },
};
export default config;
