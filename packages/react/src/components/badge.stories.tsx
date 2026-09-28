import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './badge';
import { Check } from '../lib/icons';

const meta = {
  title: '컴포넌트/표시/Badge',
  component: Badge,
  args: { children: '배지', variant: 'subtle', size: 'md' },
  argTypes: {
    status: { control: 'radio', options: [undefined, 'info', 'success', 'warning', 'danger'] },
    variant: { control: 'radio', options: ['subtle', 'solid', 'outline', 'ghost'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

const TONES = [undefined, 'info', 'success', 'warning', 'danger'] as const;
const VARIANTS = ['subtle', 'solid', 'outline', 'ghost'] as const;

export const 기본: Story = {};

/** 색 5 × 채움 4. 맨 왼쪽 열이 뜻 없는 회색(status 를 뺀 것)이다. */
export const 전체: Story = {
  render: () => (
    <div className="flex flex-col gap-stack-md">
      {VARIANTS.map((v) => (
        <div key={v} className="flex items-center gap-inline-md">
          <span className="w-[64px] text-caption text-fg-muted">{v}</span>
          {TONES.map((t) => (
            <Badge key={t ?? 'neutral'} status={t} variant={v}>{t ?? 'neutral'}</Badge>
          ))}
        </div>
      ))}
    </div>
  ),
};

/** md·lg 는 최소 너비 56px 이 바닥을 받친다. 글자가 길면 늘어난다. sm 은 최소 너비가 없다. */
export const 크기: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-stack-md">
      <div className="flex items-center gap-inline-md">
        <Badge size="sm" variant="solid">12</Badge>
        <Badge size="sm" variant="solid">3</Badge>
        <Badge size="sm" status="danger" variant="solid">99+</Badge>
        <span className="text-caption text-fg-muted">sm — 숫자 배지</span>
      </div>
      <div className="flex flex-col items-start gap-stack-sm">
        <Badge status="info">info</Badge>
        <Badge status="danger">danger</Badge>
        <Badge status="warning">검토가 필요합니다</Badge>
        <span className="text-caption text-fg-muted">md — 짧으면 56px, 길면 늘어난다</span>
      </div>
      <Badge size="lg" status="success">lg</Badge>
    </div>
  ),
};

export const 아이콘: Story = {
  render: () => (
    <div className="flex items-center gap-inline-md">
      <Badge status="success"><Check />완료</Badge>
      <Badge status="success" variant="solid"><Check />완료</Badge>
    </div>
  ),
};
