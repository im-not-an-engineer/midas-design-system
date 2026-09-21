import type { Meta, StoryObj } from '@storybook/react-vite';
import { Progress, Meter } from './progress';

const meta = { title: '컴포넌트/표시/Progress · Meter', component: Progress, args: { value: 62 }, decorators: [(Story) => <div className="w-[360px]"><Story /></div>] } satisfies Meta<typeof Progress>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 진행: Story = { args: { value: 62, label: '내보내기', showValue: true } };
export const 완료: Story = { args: { value: 100, label: '내보내기', showValue: true } };
export const 알수없음: Story = { args: { value: null, label: '서버 응답 대기' } };

export const 측정값: Story = {
  render: () => (
    <div className="flex flex-col gap-stack-lg">
      <Meter value={32} label="저장 공간" showValue />
      <Meter value={78} label="저장 공간" showValue status="warning" />
      <Meter value={96} label="저장 공간" showValue status="danger" />
      <Meter value={12} max={20} label="이번 달 사용량" showValue status="success" format={{ style: 'unit', unit: 'gigabyte' }} />
    </div>
  ),
};
