import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';
import type { Intent, Size } from '../lib/types';

const INTENTS: Intent[] = ['primary', 'secondary', 'ghost', 'destructive'];
const SIZES: Size[] = ['sm', 'md', 'lg'];

const meta = {
  title: '컴포넌트/Button',
  component: Button,
  args: { children: '저장', intent: 'secondary', size: 'md' },
  argTypes: {
    intent: { control: 'radio', options: INTENTS },
    size: { control: 'radio', options: SIZES },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 기본: Story = {};

/** 검수용 매트릭스. 아키타입을 바꾸면 모든 칸이 같이 움직여야 한다. */
export const 전체: Story = {
  render: () => (
    <div className="flex flex-col gap-stack-md">
      {INTENTS.map((intent) => (
        <div key={intent} className="flex flex-wrap items-center gap-inline-md">
          <span className="w-[96px] text-caption text-fg-muted">{intent}</span>
          {SIZES.map((size) => <Button key={size} intent={intent} size={size}>저장</Button>)}
          <Button intent={intent} disabled>비활성</Button>
          <Button intent={intent} iconOnly aria-label="더보기"><span aria-hidden>⋯</span></Button>
        </div>
      ))}
    </div>
  ),
};

export const 전체너비: Story = { args: { fullWidth: true, intent: 'primary' } };

/** render 합성 — <a>가 버튼처럼 보인다. */
export const 링크로: Story = {
  render: () => <Button render={<a href="#docs" />} intent="ghost">문서 보기 →</Button>,
};
