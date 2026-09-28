import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, TabsList, Tab, TabsPanel } from './tabs';
import { Badge } from './badge';

const meta = { title: '컴포넌트/내비/Tabs', component: Tabs, decorators: [(Story) => <div className="w-[480px]"><Story /></div>] } satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 기본: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <TabsList>
        <Tab value="overview">개요</Tab>
        <Tab value="issues">이슈 <Badge size="sm" variant="solid">12</Badge></Tab>
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
      <TabsPanel value="a" className="pt-[calc(var(--spacing-inset-sm)-var(--spacing-inline-xs))]">일반 설정</TabsPanel>
      <TabsPanel value="b" className="pt-[calc(var(--spacing-inset-sm)-var(--spacing-inline-xs))]">알림 설정</TabsPanel>
      <TabsPanel value="c" className="pt-[calc(var(--spacing-inset-sm)-var(--spacing-inline-xs))]">보안 설정</TabsPanel>
    </Tabs>
  ),
};

const 항목 = [
  { value: 'list', label: '목록' },
  { value: 'board', label: '보드' },
  { value: 'calendar', label: '달력' },
];

/**
 * 생김새 셋. 동작은 셋 다 같고 클래스만 다르다.
 *
 * line 은 페이지 안의 주 구획, pill 은 같은 자료를 다른 방식으로 볼 때,
 * folder 는 탭이 곧 문서철일 때 쓴다.
 */
export const 변형: Story = {
  render: () => (
    <div className="flex flex-col gap-section-sm">
      {(['line', 'pill', 'folder'] as const).map((v) => (
        <div key={v} className="flex flex-col gap-stack-sm">
          <span className="text-caption text-fg-muted">{v}</span>
          <Tabs defaultValue="list">
            <TabsList variant={v}>
              {항목.map((t) => <Tab key={t.value} value={t.value}>{t.label}</Tab>)}
              <Tab value="off" disabled>비활성</Tab>
            </TabsList>
            <TabsPanel value="list">목록 화면</TabsPanel>
            <TabsPanel value="board">보드 화면</TabsPanel>
            <TabsPanel value="calendar">달력 화면</TabsPanel>
          </Tabs>
        </div>
      ))}
    </div>
  ),
};

/** 배지는 Tab 안에 그냥 넣는다. 숫자는 sm, 글자는 md 가 어울린다. */
export const 배지: Story = {
  render: () => (
    <div className="flex flex-col gap-section-sm">
      {(['line', 'pill'] as const).map((v) => (
        <Tabs key={v} defaultValue="issues">
          <TabsList variant={v}>
            <Tab value="issues">이슈 <Badge size="sm" variant="solid">12</Badge></Tab>
            <Tab value="prs">PR <Badge size="sm" variant="solid">3</Badge></Tab>
            <Tab value="done">완료 <Badge size="sm" status="success" variant="solid">99+</Badge></Tab>
          </TabsList>
          <TabsPanel value="issues">이슈 목록</TabsPanel>
          <TabsPanel value="prs">PR 목록</TabsPanel>
          <TabsPanel value="done">완료 목록</TabsPanel>
        </Tabs>
      ))}
    </div>
  ),
};
