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

/**
 * 기본은 키컬러다. 진한 면 위에 얹을 때만 `border-t-current` 로 그 자리 글자 색을
 * 따르게 바꾼다 — 파란 버튼 위에 파란 고리를 두면 보이지 않는다.
 */
export const 색: Story = {
  render: () => (
    <div className="flex items-center gap-inline-lg">
      <Spinner label="기본" />
      <span className="inline-flex items-center gap-inline-md rounded-control bg-action-primary-bg-default px-inset-md py-inset-sm text-fg-on-accent">
        저장 중<Spinner size="sm" className="border-transparent border-t-current" />
      </span>
    </div>
  ),
};

/**
 * 글자 옆에 세울 때. 고리는 **글자 오른쪽**에 두고 간격은 6px(`gap-inline-md`)로 벌린다 —
 * Button 의 기본 간격 4px 은 아이콘용이라 도는 고리에는 좁다.
 * 진한 면 위에서는 궤도를 지운다(`border-transparent`) — 회색 고리가 면과 싸운다.
 *
 * 너비를 유지해야 하면 이렇게 조립하지 말고 `<Button loading>` 을 쓴다. 그쪽은 고리를
 * 글자 자리에 겹쳐 띄워서 버튼이 넓어지지 않는다.
 */
export const 버튼_안: Story = {
  render: () => (
    <div className="flex items-center gap-inline-md">
      <Button intent="primary" disabled className="gap-inline-md">저장 중<Spinner size="sm" className="border-transparent border-t-current" /></Button>
      <Button intent="secondary" disabled className="gap-inline-md">불러오는 중<Spinner size="sm" /></Button>
    </div>
  ),
};
