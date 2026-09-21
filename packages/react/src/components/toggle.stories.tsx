import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toggle, ToggleGroup } from './toggle';

const meta = {
  title: '컴포넌트/내비/Toggle',
  component: Toggle,
  args: { children: '즐겨찾기', size: 'md' },
  argTypes: { size: { control: 'radio', options: ['sm', 'md', 'lg'] } },
} satisfies Meta<typeof Toggle>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 단독: Story = {};

export const 상태: Story = {
  render: () => (
    <div className="flex flex-col gap-stack-md">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex items-center gap-inline-md">
          <span className="w-[32px] text-caption text-fg-muted">{size}</span>
          <Toggle size={size}>꺼짐</Toggle>
          <Toggle size={size} defaultPressed>켜짐</Toggle>
          <Toggle size={size} disabled>비활성</Toggle>
          <Toggle size={size} disabled defaultPressed>비활성·켜짐</Toggle>
        </div>
      ))}
    </div>
  ),
};

/** 묶음 안에서는 세그먼트 컨트롤이 된다 — 눌린 조각이 떠 보인다. */
export const 세그먼트: Story = {
  render: () => (
    <div className="flex flex-col gap-stack-md">
      <ToggleGroup defaultValue={['list']} aria-label="보기 방식">
        <Toggle value="list" size="sm">목록</Toggle>
        <Toggle value="board" size="sm">보드</Toggle>
        <Toggle value="calendar" size="sm">캘린더</Toggle>
      </ToggleGroup>
      <ToggleGroup defaultValue={['bold', 'italic']} multiple aria-label="서식">
        <Toggle value="bold" size="sm" aria-label="굵게"><b>B</b></Toggle>
        <Toggle value="italic" size="sm" aria-label="기울임"><i>I</i></Toggle>
        <Toggle value="underline" size="sm" aria-label="밑줄"><u>U</u></Toggle>
      </ToggleGroup>
    </div>
  ),
};
