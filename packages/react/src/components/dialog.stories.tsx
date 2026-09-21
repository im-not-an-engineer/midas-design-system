import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogConfirmFooter } from './dialog';
import { Button } from './button';

const meta = {
  title: '컴포넌트/Dialog',
  component: DialogContent,
  args: { width: 'md' },
  argTypes: { width: { control: 'radio', options: ['sm', 'md', 'lg'] } },
} satisfies Meta<typeof DialogContent>;
export default meta;
type Story = StoryObj<typeof meta>;

/** 포털이 테마 컨테이너 안으로 들어가므로 다크·아키타입을 그대로 따른다. 열어서 확인. */
export const 확인: Story = {
  render: (args) => (
    <Dialog>
      <DialogTrigger render={<Button />}>다이얼로그 열기</DialogTrigger>
      <DialogContent {...args}>
        <DialogHeader>
          <DialogTitle>변경 사항을 저장할까요?</DialogTitle>
          <DialogDescription>저장하지 않으면 이 화면에서 편집한 내용이 사라집니다.</DialogDescription>
        </DialogHeader>
        <DialogConfirmFooter confirmLabel="저장" />
      </DialogContent>
    </Dialog>
  ),
};

export const 파괴적: Story = {
  render: (args) => (
    <Dialog>
      <DialogTrigger render={<Button intent="destructive" />}>3건 삭제</DialogTrigger>
      <DialogContent {...args}>
        <DialogHeader>
          <DialogTitle>이슈 3건을 삭제할까요?</DialogTitle>
          <DialogDescription>되돌릴 수 없습니다. 연결된 댓글도 함께 삭제됩니다.</DialogDescription>
        </DialogHeader>
        <DialogConfirmFooter intent="destructive" confirmLabel="삭제" />
      </DialogContent>
    </Dialog>
  ),
};

export const 열린상태: Story = {
  render: (args) => (
    <Dialog open>
      <DialogContent {...args}>
        <DialogHeader>
          <DialogTitle>항상 열린 다이얼로그</DialogTitle>
          <DialogDescription>시각 회귀 스냅샷용. 툴바로 아키타입·브랜드·모드를 바꿔보세요.</DialogDescription>
        </DialogHeader>
        <DialogConfirmFooter />
      </DialogContent>
    </Dialog>
  ),
};
