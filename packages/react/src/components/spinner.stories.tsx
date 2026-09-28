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
      <span className="inline-flex items-center gap-inline-lg rounded-control bg-action-primary-bg-default px-inset-md py-inset-sm text-fg-on-accent">
        저장 중<Spinner size="sm" className="border-t-current" />
      </span>
    </div>
  ),
};

/**
 * 글자 옆에 세울 때. 고리는 **글자 오른쪽**에 둔다.
 *
 * 간격은 **8px(`gap-inline-lg`)** 로 벌린다. Button 이 아이콘에 쓰는 값(4px)의 두 배다 —
 * 아이콘은 잉크가 상자를 꽉 채우지만 동그라미는 네 점에서만 상자에 닿아서, 같은 값을
 * 주면 더 붙어 보인다.
 *
 * 진한 면 위에서는 **도는 쪽만** 글자 색에 맞춘다(`border-t-current`). 궤도는 지우지
 * 않는다 — 지우면 상자 안에 조각만 남아 글자에서 멀어 보이고, 그 거리가 조각이 돌
 * 때마다 바뀐다.
 *
 * 실제로는 **`<Button loading>` 이 먼저다** — 고리를 글자 자리에 겹쳐 띄워 버튼 너비가
 * 변하지 않는다. 여기서는 고리의 자리와 간격을 보이려고 직접 조립했다.
 */
export const 버튼_안: Story = {
  render: () => (
    <div className="flex items-center gap-inline-md">
      <Button intent="primary" className="gap-inline-lg">저장 중<Spinner size="sm" className="border-t-current" /></Button>
      <Button intent="secondary" className="gap-inline-lg">불러오는 중<Spinner size="sm" /></Button>
    </div>
  ),
};
