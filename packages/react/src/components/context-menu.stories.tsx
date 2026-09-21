import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuGroup, ContextMenuSeparator, ContextMenuCheckboxItem, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent } from './context-menu';

const meta = { title: '컴포넌트/오버레이/ContextMenu', component: ContextMenuContent } satisfies Meta<typeof ContextMenuContent>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 영역우클릭: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[160px] w-[360px] items-center justify-center rounded-surface border border-dashed border-border-strong bg-surface-subtle text-caption text-fg-muted select-none">
        이 영역을 우클릭 (또는 길게 누르기)
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuGroup label="이슈">
          <ContextMenuItem>열기</ContextMenuItem>
          <ContextMenuItem>이름 바꾸기</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>이동</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>디자인시스템</ContextMenuItem>
              <ContextMenuItem>AX 파이프라인</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem defaultChecked>고정</ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuItem destructive>삭제</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};
