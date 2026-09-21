import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, AvatarGroup } from './avatar';

const meta = { title: '컴포넌트/표시/Avatar', component: Avatar, args: { name: '양희윤', size: 'md' }, argTypes: { size: { control: 'radio', options: ['xs', 'sm', 'md', 'lg'] } } } satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 기본: Story = {};
export const 크기: Story = {
  render: () => (
    <div className="flex items-center gap-inline-md">
      {(['xs', 'sm', 'md', 'lg'] as const).map((s) => <Avatar key={s} size={s} name="양희윤" />)}
      <Avatar size="lg" name="김민준" src="https://i.pravatar.cc/96?img=12" alt="김민준" />
      <Avatar size="lg" name="실패" src="https://invalid.example/x.png" alt="이미지 실패 → 첫 글자" />
    </div>
  ),
};
export const 겹치기: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar size="sm" name="양희윤" /><Avatar size="sm" name="김민준" /><Avatar size="sm" name="이서연" /><Avatar size="sm">+4</Avatar>
    </AvatarGroup>
  ),
};
