import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogConfirmFooter } from './alert-dialog';
import { Button } from './button';

const meta = { title: '컴포넌트/오버레이/AlertDialog', component: AlertDialogContent } satisfies Meta<typeof AlertDialogContent>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 삭제확인: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button intent="destructive" />}>프로젝트 삭제</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>프로젝트를 삭제할까요?</AlertDialogTitle>
        <AlertDialogDescription>이슈 128건과 댓글이 모두 사라지며 되돌릴 수 없습니다. 바깥을 눌러도 닫히지 않습니다.</AlertDialogDescription>
        <AlertDialogConfirmFooter confirmLabel="영구 삭제" />
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const 열린상태: Story = {
  render: () => (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogTitle>저장하지 않은 변경 사항</AlertDialogTitle>
        <AlertDialogDescription>이 화면을 떠나면 편집한 내용이 사라집니다.</AlertDialogDescription>
        <AlertDialogConfirmFooter cancelLabel="계속 편집" confirmLabel="나가기" intent="primary" />
      </AlertDialogContent>
    </AlertDialog>
  ),
};
