import type { Meta, StoryObj } from '@storybook/react-vite';
import { OTPField } from './otp-field';
import { Field, FieldLabel, FieldDescription } from './field';

const meta = {
  title: '컴포넌트/폼/OTPField',
  component: OTPField,
  args: { length: 6, size: 'md' },
  argTypes: { size: { control: 'radio', options: ['sm', 'md', 'lg'] } },
} satisfies Meta<typeof OTPField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 기본: Story = {};
export const 구분선: Story = { args: { separatorAfter: 3 } };
export const 비활성: Story = { args: { disabled: true, defaultValue: '482' } };

export const 크기: Story = {
  render: (args) => (
    <div className="flex flex-col gap-stack-md">
      {(['sm', 'md', 'lg'] as const).map((size) => <OTPField key={size} {...args} size={size} length={4} />)}
    </div>
  ),
};

export const 필드안에서: Story = {
  render: (args) => (
    <Field>
      <FieldLabel>인증 코드</FieldLabel>
      <OTPField {...args} separatorAfter={3} />
      <FieldDescription>문자로 받은 6자리 코드를 입력하세요.</FieldDescription>
    </Field>
  ),
};
