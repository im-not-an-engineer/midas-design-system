import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, FieldLabel, FieldDescription, FieldError, Input, Textarea } from './field';

const meta = {
  title: '컴포넌트/Field',
  component: Field,
  args: { size: 'md' },
  argTypes: { size: { control: 'radio', options: ['sm', 'md', 'lg'] } },
} satisfies Meta<typeof Field>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 기본: Story = {
  render: (args) => (
    <Field {...args} className="w-[320px]">
      <FieldLabel>이슈 제목</FieldLabel>
      <Input placeholder="한 줄로 요약하세요" />
      <FieldDescription>목록에 이 텍스트가 그대로 보입니다.</FieldDescription>
    </Field>
  ),
};

/** 상태 매트릭스. 레이블·설명·에러의 연결은 Field가 자동으로 한다 — a11y 탭에서 확인. */
export const 상태: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-inline-lg">
      <Field {...args} className="w-[280px]" required>
        <FieldLabel>필수</FieldLabel>
        <Input placeholder="비워두면 제출되지 않습니다" />
      </Field>
      <Field {...args} className="w-[280px]" invalid>
        <FieldLabel>검증 실패</FieldLabel>
        <Input defaultValue="없는사람" />
        <FieldError match>존재하지 않는 계정입니다.</FieldError>
      </Field>
      <Field {...args} className="w-[280px]" disabled>
        <FieldLabel>비활성</FieldLabel>
        <Input defaultValue="수정 불가" />
      </Field>
      <Field {...args} className="w-[280px]">
        <FieldLabel>읽기 전용</FieldLabel>
        <Input defaultValue="ISSUE-241" readOnly />
      </Field>
    </div>
  ),
};

export const 크기: Story = {
  render: () => (
    <div className="flex flex-col gap-stack-md">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Field key={size} size={size} className="w-[320px]">
          <FieldLabel>{size}</FieldLabel>
          <Input placeholder={`size=${size}`} />
        </Field>
      ))}
    </div>
  ),
};

export const 여러줄: Story = {
  render: (args) => (
    <Field {...args} className="w-[400px]">
      <FieldLabel>보관 사유</FieldLabel>
      <Textarea placeholder="보관된 이슈만 입력할 수 있습니다" />
    </Field>
  ),
};

/**
 * 밑줄형. 상자가 줄줄이 늘어서면 테두리끼리 격자를 만들어 내용보다 눈에 띈다 —
 * 표 안이나 빽빽한 편집 화면에서 쓴다. 한 화면에서 두 모양을 섞지 않는다.
 *
 * 네 변을 다 두고 세 변만 투명하게 만들었기 때문에 상자형과 **높이·글자 자리가 같다.**
 */
export const 밑줄형: Story = {
  render: () => (
    <div className="flex w-[520px] gap-inline-lg">
      <div className="flex flex-1 flex-col gap-stack-lg">
        <span className="text-caption text-fg-muted">상자형</span>
        <Field><FieldLabel>제목</FieldLabel><Input defaultValue="토큰 계약 린트" /></Field>
        <Field><FieldLabel>담당</FieldLabel><Input placeholder="이름을 입력하세요" /></Field>
        <Field invalid><FieldLabel>기한</FieldLabel><Input defaultValue="어제" /><FieldError match="customError">지난 날짜입니다</FieldError></Field>
        <Field disabled><FieldLabel>비활성</FieldLabel><Input defaultValue="수정 불가" /></Field>
      </div>
      <div className="flex flex-1 flex-col gap-stack-lg">
        <span className="text-caption text-fg-muted">밑줄형</span>
        <Field><FieldLabel>제목</FieldLabel><Input variant="underlined" defaultValue="토큰 계약 린트" /></Field>
        <Field><FieldLabel>담당</FieldLabel><Input variant="underlined" placeholder="이름을 입력하세요" /></Field>
        <Field invalid><FieldLabel>기한</FieldLabel><Input variant="underlined" defaultValue="어제" /><FieldError match="customError">지난 날짜입니다</FieldError></Field>
        <Field disabled><FieldLabel>비활성</FieldLabel><Input variant="underlined" defaultValue="수정 불가" /></Field>
      </div>
    </div>
  ),
};
