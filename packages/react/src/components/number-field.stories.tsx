import type { Meta, StoryObj } from '@storybook/react-vite';
import { NumberField } from './number-field';
import { Field, FieldLabel, FieldDescription } from './field';

const meta = {
  title: '컴포넌트/폼/NumberField',
  component: NumberField,
  args: { defaultValue: 3, min: 0, max: 20, step: 1, size: 'md' },
  argTypes: { size: { control: 'radio', options: ['sm', 'md', 'lg'] } },
  decorators: [(Story) => <div className="w-[200px]"><Story /></div>],
} satisfies Meta<typeof NumberField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 기본: Story = {};
export const 비활성: Story = { args: { disabled: true } };
export const 소수와단위: Story = { args: { defaultValue: 1.5, step: 0.5, min: 0, max: 10, format: { style: 'unit', unit: 'hour' } } };

export const 크기: Story = {
  render: (args) => (
    <div className="flex flex-col gap-stack-md">
      {(['sm', 'md', 'lg'] as const).map((size) => <NumberField key={size} {...args} size={size} />)}
    </div>
  ),
};

export const 필드안에서: Story = {
  render: (args) => (
    <Field>
      <FieldLabel>예상 소요 시간</FieldLabel>
      <NumberField {...args} format={{ style: 'unit', unit: 'hour' }} />
      <FieldDescription>0.5시간 단위로 입력합니다.</FieldDescription>
    </Field>
  ),
};
