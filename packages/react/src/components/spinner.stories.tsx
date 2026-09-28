import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './spinner';
import { Button } from './button';

const meta = {
  title: '컴포넌트/표시/Spinner',
  component: Spinner,
  args: { size: 'md', label: '불러오는 중' },
  argTypes: { size: { control: 'radio', options: ['sm', 'md', 'lg'] } },
} satisfies Meta<typeof Spinner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 기본: Story = {};

/** 굵기가 지름을 따라간다 — 어느 크기에서도 같은 인상이다. */
export const 크기: Story = {
  render: () => (
    <div className="flex items-center gap-inline-lg">
      {(['sm', 'md', 'lg'] as const).map((s) => <Spinner key={s} size={s} label="불러오는 중" />)}
    </div>
  ),
};

/** 도는 쪽은 currentColor 라 놓인 자리의 글자 색을 그대로 따른다. */
export const 글자색을_따른다: Story = {
  render: () => (
    <div className="flex items-center gap-inline-lg">
      <span className="text-fg-default"><Spinner label="기본" /></span>
      <span className="text-fg-muted"><Spinner label="흐린 글자" /></span>
      <span className="text-status-danger-fg"><Spinner label="위험" /></span>
      <span className="inline-flex items-center gap-inline-sm rounded-control bg-action-primary-bg-default px-inset-md py-inset-sm text-fg-on-accent">
        <Spinner size="sm" className="border-transparent" />저장 중
      </span>
    </div>
  ),
};

/** 진한 면 위에서는 궤도를 지운다 — 회색 고리가 면과 싸운다. */
export const 버튼_안: Story = {
  render: () => (
    <div className="flex items-center gap-inline-md">
      <Button intent="primary" disabled><Spinner size="sm" className="border-transparent" />저장 중</Button>
      <Button intent="secondary" disabled><Spinner size="sm" />불러오는 중</Button>
    </div>
  ),
};
