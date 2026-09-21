import type { Meta, StoryObj } from '@storybook/react-vite';
import { Separator } from './separator';
import { Button } from './button';

const meta = { title: '컴포넌트/레이아웃/Separator', component: Separator } satisfies Meta<typeof Separator>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 가로: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-stack-md text-body">
      <p>위 내용</p><Separator /><p>아래 내용</p>
      <Separator label="또는" />
      <Button intent="secondary" fullWidth>다른 방법으로 계속</Button>
    </div>
  ),
};

export const 세로: Story = {
  render: () => (
    <div className="flex h-control-md items-center gap-inline-md text-body">
      <span>양희윤</span><Separator orientation="vertical" /><span>HRS개발팀</span><Separator orientation="vertical" /><span className="text-fg-muted">2026-09-21</span>
    </div>
  ),
};
