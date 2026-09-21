import type { Meta, StoryObj } from '@storybook/react-vite';
import { Autocomplete } from './autocomplete';
import { Field, FieldLabel, FieldDescription } from './field';

const TAGS = ['버그', '기능', '디자인시스템', '토큰', '접근성', '스토리북', '성능', '문서', '인프라', '에이전트'];

const meta = {
  title: '컴포넌트/폼/Autocomplete',
  component: Autocomplete,
  args: { items: TAGS, placeholder: '태그 입력', size: 'md' },
  argTypes: { size: { control: 'radio', options: ['sm', 'md', 'lg'] } },
  decorators: [(Story) => <div className="w-[280px]"><Story /></div>],
} satisfies Meta<typeof Autocomplete>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 기본: Story = {};

export const 필드안에서: Story = {
  render: (args) => (
    <Field>
      <FieldLabel>라벨</FieldLabel>
      <Autocomplete {...args} />
      <FieldDescription>목록에 없는 라벨도 입력할 수 있습니다.</FieldDescription>
    </Field>
  ),
};

export const 크기: Story = {
  render: (args) => (
    <div className="flex flex-col gap-stack-md">
      {(['sm', 'md', 'lg'] as const).map((size) => <Autocomplete key={size} {...args} size={size} />)}
    </div>
  ),
};
