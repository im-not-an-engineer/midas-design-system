import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScrollArea } from './scroll-area';

const meta = { title: '컴포넌트/레이아웃/ScrollArea', component: ScrollArea } satisfies Meta<typeof ScrollArea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 세로: Story = {
  render: () => (
    <ScrollArea className="h-[240px] w-[320px] rounded-surface border border-solid border-border-default">
      <ul className="flex flex-col p-inset-sm">
        {Array.from({ length: 30 }, (_, i) => (
          <li key={i} className="flex h-row-sm items-center border-b border-solid border-border-subtle px-inset-sm text-body last:border-b-0">ISSUE-{240 - i}</li>
        ))}
      </ul>
    </ScrollArea>
  ),
};

export const 양방향: Story = {
  render: () => (
    <ScrollArea horizontal className="h-[200px] w-[400px] rounded-surface border border-solid border-border-default">
      <div className="w-[900px] p-inset-md text-body text-fg-muted">
        {Array.from({ length: 12 }, (_, i) => <p key={i} className="whitespace-nowrap py-inset-xs">{i + 1}. 가로로도 세로로도 넘치는 넓은 내용 — 표나 코드 블록처럼 줄바꿈이 없는 내용을 감쌀 때 씁니다.</p>)}
      </div>
    </ScrollArea>
  ),
};
