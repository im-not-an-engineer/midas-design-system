import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastProvider, useToastManager, type ToastType } from './toast';
import { Button } from './button';

const meta = {
  title: '컴포넌트/오버레이/Toast',
  component: ToastProvider,
  decorators: [(Story) => <ToastProvider><Story /></ToastProvider>],
} satisfies Meta<typeof ToastProvider>;
export default meta;
type Story = StoryObj<typeof meta>;

function Buttons() {
  const toast = useToastManager();
  const fire = (type: ToastType, title: string, description?: string) => () => toast.add({ type, title, description });
  return (
    <div className="flex flex-wrap gap-inline-md">
      <Button onClick={fire('info', '동기화 중', '변경 사항을 서버에 반영하고 있습니다.')}>info</Button>
      <Button onClick={fire('success', '저장됨')}>success</Button>
      <Button onClick={fire('warning', '연결이 느립니다', '자동 저장이 지연될 수 있습니다.')}>warning</Button>
      <Button intent="destructive" onClick={fire('danger', '저장 실패', '네트워크 오류. 다시 시도하세요.')}>danger</Button>
      <Button intent="ghost" onClick={() => toast.add({ title: '이슈 3건 보관됨', description: '실수였다면 되돌릴 수 있습니다.', actionProps: { children: '되돌리기', onClick: () => {} } })}>액션 포함</Button>
    </div>
  );
}

export const 기본: Story = { render: () => <Buttons /> };
