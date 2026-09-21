import type { Meta, StoryObj } from '@storybook/react-vite';
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription } from './popover';
import { Button } from './button';
import { Checkbox } from './checkbox';

const meta = { title: '컴포넌트/오버레이/Popover', component: PopoverContent } satisfies Meta<typeof PopoverContent>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 필터: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button />}>필터</PopoverTrigger>
      <PopoverContent align="start">
        <PopoverTitle>표시할 상태</PopoverTitle>
        <PopoverDescription>고른 상태의 이슈만 목록에 보입니다.</PopoverDescription>
        <div className="mt-stack-md flex flex-col gap-stack-sm">
          <Checkbox label="대기" defaultChecked />
          <Checkbox label="진행" defaultChecked />
          <Checkbox label="완료" />
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const 열린상태: Story = {
  render: () => (
    <Popover open>
      <PopoverTrigger render={<Button intent="ghost" />}>도움말</PopoverTrigger>
      <PopoverContent side="right">
        <PopoverTitle>가중치란?</PopoverTitle>
        <PopoverDescription>높을수록 목록 상단에 정렬됩니다. 같은 값이면 최근 수정 순입니다.</PopoverDescription>
      </PopoverContent>
    </Popover>
  ),
};
