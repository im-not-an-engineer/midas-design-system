import type { Meta, StoryObj } from '@storybook/react-vite';
import { Combobox, ComboboxMultiple } from './combobox';
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

/**
 * 여럿 고르기. 고른 것이 알약으로 쌓이고, 알약 생김새는 Chip 과 같은 상수를 쓴다 —
 * 같은 화면에 두 종류의 알약이 있으면 사용자는 둘을 같은 것으로 읽는다.
 *
 * 칸은 **한 줄로 고정**이다. 알약이 늘 때 아래로 자라면 그 아래 것들이 밀려 내려가
 * 폼 전체가 들썩인다.
 *
 * 그래서 펼쳐 보이는 개수를 정해두고(`maxVisible`, 기본 2) 나머지는 `+N` 하나로 접는다.
 * 다 펼치면 알약이 서로 밀어내 이름이 한 글자씩만 남는다 — 실측으로 320px 칸에 세 개를
 * 펼치니 '양.' '김.' '이.' 가 됐다.
 *
 * 안내 글자는 하나라도 고르면 사라진다.
 */
export const 여럿고르기: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-stack-lg">
      <ComboboxMultiple items={PEOPLE} placeholder="담당자 검색" defaultValue={PEOPLE.slice(0, 2)} />
      <ComboboxMultiple items={PEOPLE} placeholder="담당자 검색" defaultValue={PEOPLE.slice(0, 5)} />
      <ComboboxMultiple items={PEOPLE} placeholder="담당자 검색" />
    </div>
  ),
};
