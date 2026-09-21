import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, TabsList, Tab, TabsPanel } from './tabs';

const meta = { title: '컴포넌트/내비/Tabs', component: Tabs, decorators: [(Story) => <div className="w-[480px]"><Story /></div>] } satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 기본: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <TabsList>
        <Tab value="overview">개요</Tab>
        <Tab value="issues">이슈 <span className="rounded-pill bg-surface-sunken px-inset-xs text-caption text-fg-muted">12</span></Tab>
        <Tab value="settings">설정</Tab>
        <Tab value="billing" disabled>결제</Tab>
      </TabsList>
      <TabsPanel value="overview">프로젝트 요약이 여기 들어갑니다.</TabsPanel>
      <TabsPanel value="issues">이슈 목록.</TabsPanel>
      <TabsPanel value="settings">설정 폼.</TabsPanel>
    </Tabs>
  ),
};

export const 세로: Story = {
  render: () => (
    <Tabs defaultValue="a" orientation="vertical" className="flex gap-inline-lg">
      <TabsList>
        <Tab value="a">일반</Tab><Tab value="b">알림</Tab><Tab value="c">보안</Tab>
      </TabsList>
      <TabsPanel value="a" className="pt-0">일반 설정</TabsPanel>
      <TabsPanel value="b" className="pt-0">알림 설정</TabsPanel>
      <TabsPanel value="c" className="pt-0">보안 설정</TabsPanel>
    </Tabs>
  ),
};
