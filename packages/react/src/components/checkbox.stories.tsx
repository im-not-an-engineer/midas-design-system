import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox, CheckboxGroup } from './checkbox';

const meta = {
  title: '컴포넌트/폼/Checkbox',
  component: Checkbox,
  args: { label: '담당자 표시', size: 'md' },
  argTypes: { size: { control: 'radio', options: ['sm', 'md', 'lg'] } },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 기본: Story = {};

/** 상태 매트릭스. 박스 크기는 size.icon.*라 아키타입을 바꾸면 아이콘과 같이 움직인다. */
export const 상태: Story = {
  render: () => (
    <div className="flex flex-col gap-stack-md">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-inline-lg">
          <span className="w-[32px] text-caption text-fg-muted">{size}</span>
          <Checkbox size={size} label="미체크" />
          <Checkbox size={size} label="체크" defaultChecked />
          <Checkbox size={size} label="일부" indeterminate />
          <Checkbox size={size} label="비활성" disabled />
          <Checkbox size={size} label="비활성·체크" disabled defaultChecked />
          <Checkbox size={size} label="검증 실패" aria-invalid data-invalid />
        </div>
      ))}
    </div>
  ),
};

export const 설명포함: Story = {
  args: { label: '알림 받기', description: '이슈가 나에게 배정되면 메일로 알립니다.' },
};

export const 그룹: Story = {
  render: () => (
    <CheckboxGroup label="표시할 컬럼" description="목록에 보이는 컬럼을 고릅니다." defaultValue={['owner', 'status']}>
      <Checkbox value="owner" label="담당자" />
      <Checkbox value="status" label="상태" />
      <Checkbox value="due" label="마감일" />
      <Checkbox value="labels" label="라벨" disabled />
    </CheckboxGroup>
  ),
};

export const 가로그룹: Story = {
  render: () => (
    <CheckboxGroup label="요일" orientation="horizontal" defaultValue={['mon', 'wed']}>
      {['mon', 'tue', 'wed', 'thu', 'fri'].map((d, i) => <Checkbox key={d} value={d} label={'월화수목금'[i]} />)}
    </CheckboxGroup>
  ),
};
