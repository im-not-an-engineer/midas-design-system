import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from './switch';

const meta = {
  title: '컴포넌트/폼/Switch',
  component: Switch,
  args: { label: '자동 저장', size: 'md' },
  argTypes: { size: { control: 'radio', options: ['sm', 'md', 'lg'] } },
} satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 기본: Story = {};

/** 트랙·썸이 전부 아이콘 급 토큰에서 나온다 — 아키타입을 바꿔도 여백이 맞는지 본다. */
export const 상태: Story = {
  render: () => (
    <div className="flex flex-col gap-stack-md">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-inline-lg">
          <span className="w-[32px] text-caption text-fg-muted">{size}</span>
          <Switch size={size} label="꺼짐" />
          <Switch size={size} label="켜짐" defaultChecked />
          <Switch size={size} label="비활성" disabled />
          <Switch size={size} label="비활성·켜짐" disabled defaultChecked />
        </div>
      ))}
    </div>
  ),
};

export const 설명포함: Story = {
  args: { label: '2단계 인증', description: '로그인할 때 인증 앱의 코드를 추가로 요구합니다.', defaultChecked: true },
};
