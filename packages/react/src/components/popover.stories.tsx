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
        {/* 고르는 줄이라 셀 높이를 맞춘다 — 척도에 24px 단계가 없어 가장 가까운 row-sm(28px). */}
        <div className="mt-stack-md flex flex-col">
          {['대기', '진행', '완료'].map((s, i) => (
            <div key={s} className="flex h-row-sm items-center"><Checkbox label={s} defaultChecked={i < 2} /></div>
          ))}
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
