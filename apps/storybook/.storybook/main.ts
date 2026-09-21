import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // 스토리는 컴포넌트 옆에 둔다. 그래야 계약 린트(scripts/check-contract.mjs)가 스토리의 클래스도 검사한다.
  stories: ['../../../packages/react/src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: '@storybook/react-vite',
  core: { disableTelemetry: true },
  async viteFinal(cfg) {
    const tailwindcss = (await import('@tailwindcss/vite')).default;
    const { fileURLToPath } = await import('node:url');
    cfg.plugins = [...(cfg.plugins ?? []), tailwindcss()];
    // 데코레이터(AxTheme)와 스토리의 컴포넌트가 같은 소스를 쓰게 한다.
    // 하나는 dist, 하나는 src면 React 컨텍스트 인스턴스가 갈려 포털 컨테이너가 null이 된다.
    // 덤으로 컴포넌트를 고치면 재빌드 없이 HMR로 스토리북에 바로 반영된다.
    // 정확히 '@ax/react'만 — '@ax/react/styles.css' 같은 서브패스는 dist를 그대로 써야 한다.
    const existing = Array.isArray(cfg.resolve?.alias) ? cfg.resolve.alias : Object.entries(cfg.resolve?.alias ?? {}).map(([find, replacement]) => ({ find, replacement: replacement as string }));
    cfg.resolve = { ...cfg.resolve, alias: [...existing, { find: /^@ax\/react$/, replacement: fileURLToPath(new URL('../../../packages/react/src/index.ts', import.meta.url)) }] };
    return cfg;
  },
};
export default config;
