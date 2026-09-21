import type { Meta, StoryObj } from '@storybook/react-vite';
import { PreviewCard, PreviewCardTrigger, PreviewCardContent } from './preview-card';

const meta = { title: '컴포넌트/오버레이/PreviewCard', component: PreviewCardContent } satisfies Meta<typeof PreviewCardContent>;
export default meta;
type Story = StoryObj<typeof meta>;

const Card = () => (
  <div className="flex flex-col gap-stack-sm">
    <div className="flex items-center gap-inline-sm">
      <span className="flex size-icon-lg items-center justify-center rounded-pill bg-action-primary-bg-default text-caption font-semibold text-fg-on-accent">양</span>
      <div className="flex flex-col"><span className="text-body font-semibold leading-ui">양희윤</span><span className="text-caption text-fg-muted">HRS개발팀 · 디자이너</span></div>
    </div>
    <p className="text-caption leading-normal text-fg-muted">담당 이슈 12건 · 이번 주 완료 4건</p>
  </div>
);

export const 링크호버: Story = {
  render: () => (
    <p className="text-body">
      이 이슈는 <PreviewCard><PreviewCardTrigger href="#">@양희윤</PreviewCardTrigger><PreviewCardContent><Card /></PreviewCardContent></PreviewCard> 님이 담당합니다.
    </p>
  ),
};

export const 열린상태: Story = {
  render: () => (
    <PreviewCard open>
      <PreviewCardTrigger href="#">@양희윤</PreviewCardTrigger>
      <PreviewCardContent><Card /></PreviewCardContent>
    </PreviewCard>
  ),
};
