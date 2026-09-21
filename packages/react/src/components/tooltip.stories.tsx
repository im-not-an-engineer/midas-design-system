import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip, TooltipProvider } from './tooltip';
import { Button } from './button';

const meta: Meta<typeof Tooltip> = {
  title: '컴포넌트/오버레이/Tooltip',
  component: Tooltip,
  args: { content: '보조 설명', children: <Button>기준</Button> },
  decorators: [(Story) => <TooltipProvider><div className="flex items-center gap-inline-lg p-inset-xl"><Story /></div></TooltipProvider>],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const 기본: Story = {
  render: () => (
    <>
      <Tooltip content="이슈를 보관합니다. 목록에서 사라지지만 삭제되지 않습니다."><Button iconOnly aria-label="보관"><span aria-hidden>▤</span></Button></Tooltip>
      <Tooltip content="아래" side="bottom"><Button intent="ghost">아래</Button></Tooltip>
      <Tooltip content="오른쪽" side="right"><Button intent="ghost">오른쪽</Button></Tooltip>
    </>
  ),
};

/** 항상 열린 상태 — 스냅샷용. 다크에서 반전(밝은 면·어두운 글자)되는지 본다. */
export const 열린상태: Story = {
  render: () => (
    <Tooltip content="surface.inverse 위의 fg.onInverse" open>
      <Button>기준</Button>
    </Tooltip>
  ),
};
