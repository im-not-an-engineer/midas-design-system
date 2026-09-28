import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chip, ChipGroup, ChipCheckbox, ChipCheckboxGroup } from './chip';
import { Button } from './button';
import { Check } from '../lib/icons';

const meta = { title: '컴포넌트/폼/Chip', component: Chip } satisfies Meta<typeof Chip>;
export default meta;
type Story = StoryObj<typeof meta>;

const 상태 = [
  { value: 'open', label: '열림' },
  { value: 'doing', label: '진행 중' },
  { value: 'review', label: '검토' },
  { value: 'done', label: '완료' },
];

/** 누르는 즉시 반영된다. 화살표로 칩 사이를 옮긴다. */
export const 거르기: Story = {
  render: function 거르기() {
    const [고른것, 고르기] = React.useState<string[]>(['doing']);
    return (
      <div className="flex flex-col gap-stack-lg">
        <ChipGroup label="상태" description="누르는 즉시 목록이 걸러집니다" value={고른것} onValueChange={고르기}>
          {상태.map((s) => <Chip key={s.value} value={s.value}>{s.label}</Chip>)}
        </ChipGroup>
        <span className="text-caption text-fg-muted">고른 것: {고른것.length ? 고른것.join(', ') : '없음'}</span>
      </div>
    );
  },
};

/** 하나만 고르게 하려면 toggleMultiple={false}. */
export const 하나만: Story = {
  render: () => (
    <ChipGroup label="보기 방식" multiple={false} defaultValue={['list']}>
      <Chip value="list">목록</Chip>
      <Chip value="board">보드</Chip>
      <Chip value="calendar">달력</Chip>
    </ChipGroup>
  ),
};

/** 폼에 실려 제출된다. 저장을 눌러야 반영되는 자리는 이쪽이다. */
export const 폼: Story = {
  render: function 폼() {
    const [보낸것, 보내기] = React.useState<string | null>(null);
    return (
      <form
        className="flex flex-col gap-stack-xl"
        onSubmit={(e) => {
          e.preventDefault();
          보내기([...new FormData(e.currentTarget).getAll('tags')].join(', ') || '없음');
        }}
      >
        {/* name 은 묶음이 아니라 칩마다 준다 — 같은 name 으로 여러 값이 함께 제출된다. */}
        <ChipCheckboxGroup label="태그" description="저장을 눌러야 반영됩니다" defaultValue={['ui']}>
          <ChipCheckbox name="tags" value="ui">UI</ChipCheckbox>
          <ChipCheckbox name="tags" value="tokens">토큰</ChipCheckbox>
          <ChipCheckbox name="tags" value="a11y">접근성</ChipCheckbox>
          <ChipCheckbox name="tags" value="docs" disabled>문서(비활성)</ChipCheckbox>
        </ChipCheckboxGroup>
        <div className="flex items-center gap-inline-lg">
          <Button type="submit" intent="primary" size="sm">저장</Button>
          {보낸것 != null && <span className="text-caption text-fg-muted">보낸 값: {보낸것}</span>}
        </div>
      </form>
    );
  },
};

export const 크기: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-stack-md">
      {(['sm', 'md', 'lg'] as const).map((s) => (
        <ChipGroup key={s} defaultValue={['b']}>
          <Chip size={s} value="a">안 고름</Chip>
          <Chip size={s} value="b"><Check aria-hidden />고름</Chip>
          <Chip size={s} value="c" disabled>비활성</Chip>
        </ChipGroup>
      ))}
    </div>
  ),
};
