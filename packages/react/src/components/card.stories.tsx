import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Ellipsis } from '../lib/icons';

const meta = {
  title: '컴포넌트/표시/Card',
  component: Card,
  decorators: [(Story) => <div className="w-[360px]"><Story /></div>],
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 기본: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>이번 달 사용량</CardTitle>
        <CardDescription>9월 1일부터 오늘까지</CardDescription>
      </CardHeader>
      <CardContent>내려받기 1,284건 · 계산 412회</CardContent>
    </Card>
  ),
};

/** 제목 줄 오른쪽에 붙는 것은 CardHeader 의 action 으로 준다. 밖에서 감싸면 간격이 끊긴다. */
export const 제목_옆_동작: Story = {
  render: () => (
    <Card>
      <CardHeader action={<Button size="sm" iconOnly intent="ghost" aria-label="더보기"><Ellipsis aria-hidden /></Button>}>
        <CardTitle>모델 검토</CardTitle>
        <CardDescription>담당 양희윤 · 마감 10월 4일</CardDescription>
      </CardHeader>
      <CardContent>지하 2층 기둥 배근이 아직 확정되지 않았습니다.</CardContent>
      <CardFooter>
        <Button size="sm">나중에</Button>
        <Button size="sm" intent="primary">검토 시작</Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * 통째로 누르는 카드. `render` 로 반드시 <a> 나 <button> 을 준다 —
 * div 에 onClick 만 붙이면 탭 키로 닿지 않는다.
 */
export const 누르는_카드: Story = {
  render: () => (
    <div className="flex flex-col gap-stack-md">
      <Card interactive render={<a href="#issue-241" />}>
        <CardHeader action={<Badge size="sm" variant="solid">3</Badge>}>
          <CardTitle>ISSUE-241</CardTitle>
          <CardDescription>토큰 계약 위반 린트</CardDescription>
        </CardHeader>
      </Card>
      <Card interactive render={<button type="button" />}>
        <CardHeader action={<Badge status="success">완료</Badge>}>
          <CardTitle>ISSUE-238</CardTitle>
          <CardDescription>치수 사다리 순서 검사</CardDescription>
        </CardHeader>
      </Card>
    </div>
  ),
};
