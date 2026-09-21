import type { Meta, StoryObj } from '@storybook/react-vite';
import { Combobox } from './combobox';
import { Field, FieldLabel } from './field';

const PEOPLE = ['양희윤', '김민준', '이서연', '박도윤', '최지우', '정하은', '강시우', '조수아', '윤예준', '장하윤', '임지호', '한서준']
  .map((n, i) => ({ value: `u${i}`, label: n, disabled: i === 7 }));

// satisfies 대신 명시 주석: 제너릭 컴포넌트는 추론 타입을 export할 수 없다(TS2742)
const meta: Meta<typeof Combobox> = {
  title: '컴포넌트/폼/Combobox',
  component: Combobox,
  args: { items: PEOPLE, placeholder: '이름으로 검색', size: 'md' },
  argTypes: { size: { control: 'radio', options: ['sm', 'md', 'lg'] } },
  decorators: [(Story) => <div className="w-[280px]"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const 기본: Story = {};
export const 선택됨: Story = { args: { defaultValue: PEOPLE[2] } };
export const 비활성: Story = { args: { defaultValue: PEOPLE[0], disabled: true } };

export const 필드안에서: Story = {
  render: (args) => (
    <Field>
      <FieldLabel>담당자</FieldLabel>
      <Combobox {...args} />
    </Field>
  ),
};

export const 크기: Story = {
  render: (args) => (
    <div className="flex flex-col gap-stack-md">
      {(['sm', 'md', 'lg'] as const).map((size) => <Combobox key={size} {...args} size={size} defaultValue={PEOPLE[size === 'sm' ? 0 : size === 'md' ? 1 : 2]} />)}
    </div>
  ),
};
