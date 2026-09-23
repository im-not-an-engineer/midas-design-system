import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';
import type { Intent, Size } from '../lib/types';
import { Archive, ChevronRight, Ellipsis, Plus, X } from '../lib/icons';

const INTENTS: Intent[] = ['primary', 'secondary', 'ghost', 'destructive'];
const SIZES: Size[] = ['sm', 'md', 'lg'];

const meta = {
  title: '컴포넌트/Button',
  component: Button,
  args: { children: '저장', intent: 'secondary', size: 'md' },
  argTypes: {
    intent: { control: 'radio', options: INTENTS },
    size: { control: 'radio', options: SIZES },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 기본: Story = {};

/** 검수용 매트릭스. 아키타입을 바꾸면 모든 칸이 같이 움직여야 한다. */
export const 전체: Story = {
  render: () => (
    <div className="flex flex-col gap-stack-md">
      {INTENTS.map((intent) => (
        <div key={intent} className="flex flex-wrap items-center gap-inline-md">
          <span className="w-[96px] text-caption text-fg-muted">{intent}</span>
          {SIZES.map((size) => <Button key={size} intent={intent} size={size}>저장</Button>)}
          <Button intent={intent} disabled>비활성</Button>
          <Button intent={intent} iconOnly aria-label="더보기"><Ellipsis aria-hidden /></Button>
        </div>
      ))}
    </div>
  ),
};

export const 전체너비: Story = { args: { fullWidth: true, intent: 'primary' } };

/** render 합성 — <a>가 버튼처럼 보인다. */
export const 링크로: Story = {
  render: () => <Button render={<a href="#docs" />} intent="ghost">문서 보기 →</Button>,
};

/**
 * 아이콘이 붙은 버튼. 새로 만들 게 없다 — gap과 아이콘 크기는 Button이 이미 size별로 쥐고 있어서,
 * 자식으로 아이콘을 넣기만 하면 된다. 아이콘은 반드시 `lib/icons`를 거친다(규칙 6-3).
 */
export const 아이콘: Story = {
  render: () => (
    <div className="flex flex-col gap-stack-md">
      {SIZES.map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-inline-md">
          <span className="w-[32px] text-caption text-fg-muted">{size}</span>
          {/* 앞 아이콘 — 가장 흔한 형태. 아이콘이 동작을 먼저 알린다. */}
          <Button size={size} intent="primary"><Plus aria-hidden />추가</Button>
          {/* 뒤 아이콘 — 이동·펼침처럼 '다음'을 가리킬 때. */}
          <Button size={size}>다음<ChevronRight aria-hidden /></Button>
          <Button size={size} intent="ghost"><Archive aria-hidden />보관</Button>
          {/* 아이콘만 — 정사각이 된다. aria-label이 없으면 읽을 수 없는 버튼이 된다. */}
          <Button size={size} iconOnly aria-label="더보기"><Ellipsis aria-hidden /></Button>
          <Button size={size} iconOnly aria-label="닫기" intent="ghost"><X aria-hidden /></Button>
          <Button size={size} iconOnly aria-label="삭제" intent="destructive" disabled><X aria-hidden /></Button>
        </div>
      ))}
    </div>
  ),
};
