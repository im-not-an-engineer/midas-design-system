import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from './slider';
import { Field, FieldLabel, FieldDescription } from './field';

const meta = {
  title: '컴포넌트/폼/Slider',
  component: Slider,
  args: { defaultValue: 40, min: 0, max: 100, step: 1, showValue: true },
  decorators: [(Story) => <div className="w-[320px]"><Story /></div>],
} satisfies Meta<typeof Slider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 기본: Story = {};
export const 범위: Story = { args: { defaultValue: [20, 60] } };
export const 비활성: Story = { args: { disabled: true } };
export const 단계: Story = { args: { defaultValue: 50, step: 25 } };

export const 필드안에서: Story = {
  render: (args) => (
    <Field>
      <FieldLabel>우선순위 가중치</FieldLabel>
      <Slider {...args} />
      <FieldDescription>높을수록 목록 상단에 정렬됩니다.</FieldDescription>
    </Field>
  ),
};
