import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, BadgeDot } from './badge';
import { Button } from './button';
import { Bell, Check, ListFilter } from '../lib/icons';

const meta = {
  title: '컴포넌트/표시/Badge',
  component: Badge,
  args: { children: '배지', variant: 'subtle', size: 'md' },
  argTypes: {
    status: { control: 'radio', options: [undefined, 'info', 'success', 'warning', 'danger'] },
    variant: { control: 'radio', options: ['subtle', 'solid', 'outline', 'ghost'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    shape: { control: 'radio', options: ['pill', 'rounded'] },
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

/** 윤곽 둘. 채움(variant)과 따로 논다 — rounded 는 알약보다 각져 보여 태그·분류 라벨에 어울린다. */
export const 모양: Story = {
  render: () => (
    <div className="flex flex-col gap-stack-md">
      {(['pill', 'rounded'] as const).map((shape) => (
        <div key={shape} className="flex items-center gap-inline-md">
          <span className="w-[64px] text-caption text-fg-muted">{shape}</span>
          {TONES.map((t) => (
            <Badge key={t ?? 'neutral'} status={t} shape={shape}>{t ?? 'neutral'}</Badge>
          ))}
        </div>
      ))}
    </div>
  ),
};

/** 높이 sm 16 · md 20. md·lg 는 최소 너비(control-md)가 바닥을 받친다. sm 은 한 자리 숫자가 동그라미가 되는 만큼만. */
export const 크기: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-stack-md">
      <div className="flex items-center gap-inline-md">
        <Badge size="sm" variant="solid">12</Badge>
        <Badge size="sm" variant="solid">3</Badge>
        <Badge size="sm" variant="solid">99+</Badge>
        <Badge size="sm" status="info">신규</Badge>
        <span className="text-caption text-fg-muted">sm — 숫자 배지 · 작은 라벨</span>
      </div>
      <div className="flex flex-col items-start gap-stack-sm">
        <Badge status="info">info</Badge>
        <Badge status="danger">danger</Badge>
        <Badge status="warning">검토가 필요합니다</Badge>
        <span className="text-caption text-fg-muted">md — 짧아도 최소 폭(control-md), 길면 늘어난다</span>
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

/** 점 배지. 아이콘을 감싸면 오른쪽 위에 얹히고, 감싸지 않으면 글자 줄 안에 놓인다. */
export const 점: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-stack-md">
      <div className="flex items-center gap-inline-md">
        <Button intent="secondary">
          <BadgeDot label="적용된 필터 있음"><ListFilter /></BadgeDot>
          필터
        </Button>
        <Button intent="ghost" aria-label="알림">
          <BadgeDot status="info" label="새 알림"><Bell /></BadgeDot>
        </Button>
      </div>
      <div className="flex items-center gap-inline-md">
        {(['neutral', 'info', 'success', 'warning', 'danger'] as const).map((t) => (
          <span key={t} className="inline-flex items-center gap-inline-sm text-caption text-fg-muted">
            <BadgeDot status={t} />
            {t}
          </span>
        ))}
      </div>
    </div>
  ),
};
