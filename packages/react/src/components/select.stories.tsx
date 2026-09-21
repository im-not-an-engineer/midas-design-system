import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select, SelectRoot, SelectTrigger, SelectValue, SelectContent, SelectOption, SelectGroup, SelectGroupLabel, SelectSeparator } from './select';
import { Field, FieldLabel, FieldDescription } from './field';

const STATUS = [
  { value: 'todo', label: '대기' },
  { value: 'doing', label: '진행' },
  { value: 'review', label: '리뷰' },
  { value: 'done', label: '완료' },
  { value: 'archived', label: '보관 (권한 없음)', disabled: true },
];

const meta = {
  title: '컴포넌트/폼/Select',
  component: Select,
  args: { items: STATUS, placeholder: '상태 선택', size: 'md' },
  argTypes: { size: { control: 'radio', options: ['sm', 'md', 'lg'] } },
  decorators: [(Story) => <div className="w-[280px]"><Story /></div>],
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 기본: Story = {};
export const 선택됨: Story = { args: { defaultValue: 'doing' } };
export const 비활성: Story = { args: { defaultValue: 'done', disabled: true } };

export const 크기: Story = {
  render: (args) => (
    <div className="flex flex-col gap-stack-md">
      {(['sm', 'md', 'lg'] as const).map((size) => <Select key={size} {...args} size={size} defaultValue="review" />)}
    </div>
  ),
};

/** Field 안에서 — 레이블 연결은 Base UI가 한다. */
export const 필드안에서: Story = {
  render: (args) => (
    <Field>
      <FieldLabel>상태</FieldLabel>
      <Select {...args} />
      <FieldDescription>변경하면 담당자에게 알림이 갑니다.</FieldDescription>
    </Field>
  ),
};

/** 그룹·구분선이 필요하면 파트로 조립한다. */
export const 그룹조립: Story = {
  render: () => (
    <SelectRoot items={[...STATUS, { value: 'me', label: '내가 담당' }, { value: 'unassigned', label: '미배정' }]}>
      <SelectTrigger><SelectValue placeholder="필터" /></SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectGroupLabel>상태</SelectGroupLabel>
          {STATUS.slice(0, 4).map((s) => <SelectOption key={s.value} value={s.value}>{s.label}</SelectOption>)}
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectGroupLabel>담당</SelectGroupLabel>
          <SelectOption value="me">내가 담당</SelectOption>
          <SelectOption value="unassigned">미배정</SelectOption>
        </SelectGroup>
      </SelectContent>
    </SelectRoot>
  ),
};
