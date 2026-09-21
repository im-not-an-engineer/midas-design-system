import type { Meta, StoryObj } from '@storybook/react-vite';
import { Radio, RadioGroup } from './radio';

const meta = {
  title: '컴포넌트/폼/Radio',
  component: RadioGroup,
} satisfies Meta<typeof RadioGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 기본: Story = {
  render: () => (
    <RadioGroup label="밀도" defaultValue="comfortable">
      <Radio value="compact" label="촘촘하게" />
      <Radio value="comfortable" label="보통" />
      <Radio value="spacious" label="넉넉하게" />
    </RadioGroup>
  ),
};

export const 설명포함: Story = {
  render: () => (
    <RadioGroup label="공개 범위" description="누가 이 이슈를 볼 수 있는지 정합니다." defaultValue="team">
      <Radio value="private" label="나만" description="작성자만 볼 수 있습니다." />
      <Radio value="team" label="팀" description="프로젝트 멤버 전원이 볼 수 있습니다." />
      <Radio value="org" label="조직 전체" description="로그인한 모든 구성원이 볼 수 있습니다." disabled />
    </RadioGroup>
  ),
};

export const 상태: Story = {
  render: () => (
    <div className="flex flex-col gap-stack-md">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <RadioGroup key={size} orientation="horizontal" defaultValue="b">
          <span className="w-[32px] text-caption text-fg-muted">{size}</span>
          <Radio size={size} value="a" label="미선택" />
          <Radio size={size} value="b" label="선택" />
          <Radio size={size} value="c" label="비활성" disabled />
        </RadioGroup>
      ))}
      <RadioGroup orientation="horizontal" defaultValue="x" disabled>
        <span className="w-[32px] text-caption text-fg-muted">그룹 비활성</span>
        <Radio value="x" label="선택됨" />
        <Radio value="y" label="미선택" />
      </RadioGroup>
    </div>
  ),
};
