import type { Meta, StoryObj } from '@storybook/react-vite';
import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from './collapsible';
import { Button } from './button';
import { Checkbox } from './checkbox';

const meta = { title: '컴포넌트/내비/Collapsible', component: Collapsible, decorators: [(Story) => <div className="w-[400px]"><Story /></div>] } satisfies Meta<typeof Collapsible>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 고급옵션: Story = {
  render: () => (
    <Collapsible>
      <CollapsibleTrigger render={<Button intent="ghost" size="sm" />}>고급 옵션</CollapsibleTrigger>
      <CollapsiblePanel>
        <div className="flex flex-col gap-stack-sm rounded-surface border border-solid border-border-default bg-surface-subtle p-inset-md">
          <Checkbox label="변경 이력 남기기" defaultChecked />
          <Checkbox label="하위 이슈에도 적용" />
        </div>
      </CollapsiblePanel>
    </Collapsible>
  ),
};

export const 열린상태: Story = {
  render: () => (
    <Collapsible defaultOpen>
      <CollapsibleTrigger render={<Button intent="ghost" size="sm" />}>고급 옵션</CollapsibleTrigger>
      <CollapsiblePanel><p className="text-body text-fg-muted">열린 상태로 시작.</p></CollapsiblePanel>
    </Collapsible>
  ),
};
