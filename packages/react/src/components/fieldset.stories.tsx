import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Fieldset, Form } from './fieldset';
import { Field, FieldLabel, FieldDescription, FieldError, Input, Textarea } from './field';
import { Select } from './select';
import { Checkbox } from './checkbox';
import { Button } from './button';

const meta = {
  title: '컴포넌트/폼/Fieldset · Form',
  component: Fieldset,
  decorators: [(Story) => <div className="w-[480px]"><Story /></div>],
} satisfies Meta<typeof Fieldset>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 묶음: Story = {
  render: () => (
    <Fieldset legend="알림" description="어떤 일이 생기면 알려드릴까요?">
      <Checkbox label="나에게 배정될 때" defaultChecked />
      <Checkbox label="내 이슈에 댓글이 달릴 때" defaultChecked />
      <Checkbox label="마감 하루 전" />
    </Fieldset>
  ),
};

/** Form + Fieldset + Field로 짓는 폼 화면의 골격. 제출하면 서버 에러가 필드에 붙는 흐름까지. */
export const 폼전체: Story = {
  render: () => {
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [saved, setSaved] = React.useState(false);
    return (
      <Form
        errors={errors}
        onSubmit={(e) => {
          e.preventDefault();
          const title = String(new FormData(e.currentTarget).get('title') ?? '');
          if (title.includes('버그')) setErrors({ title: '제목에 "버그"라고만 쓰지 말고 무엇이 잘못됐는지 적어주세요.' });
          else { setErrors({}); setSaved(true); }
        }}
      >
        <Fieldset legend="새 이슈">
          <Field name="title" required>
            <FieldLabel>제목</FieldLabel>
            <Input placeholder="한 줄로 요약" />
            <FieldError />
          </Field>
          <Field name="status">
            <FieldLabel>상태</FieldLabel>
            <Select items={[{ value: 'todo', label: '대기' }, { value: 'doing', label: '진행' }]} defaultValue="todo" />
          </Field>
          <Field name="body">
            <FieldLabel>내용</FieldLabel>
            <Textarea placeholder="재현 순서, 기대 동작, 실제 동작" />
            <FieldDescription>마크다운을 쓸 수 있습니다.</FieldDescription>
          </Field>
        </Fieldset>
        <div className="flex items-center justify-end gap-inline-md">
          {saved && <span className="text-caption text-status-success-fg">저장됨</span>}
          <Button type="button" intent="secondary">취소</Button>
          <Button type="submit" intent="primary">만들기</Button>
        </div>
      </Form>
    );
  },
};
