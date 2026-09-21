import type { Meta, StoryObj } from '@storybook/react-vite';
import { Menubar, MenubarTrigger } from './menubar';
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuCheckboxItem } from './menu';

const meta = { title: '컴포넌트/내비/Menubar', component: Menubar } satisfies Meta<typeof Menubar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 기본: Story = {
  render: () => (
    <Menubar>
      <Menu>
        <MenubarTrigger>파일</MenubarTrigger>
        <MenuContent align="start"><MenuItem>새 이슈</MenuItem><MenuItem>가져오기…</MenuItem><MenuSeparator /><MenuItem>내보내기</MenuItem></MenuContent>
      </Menu>
      <Menu>
        <MenubarTrigger>편집</MenubarTrigger>
        <MenuContent align="start"><MenuItem>실행 취소</MenuItem><MenuItem>다시 실행</MenuItem><MenuSeparator /><MenuItem>찾기</MenuItem></MenuContent>
      </Menu>
      <Menu>
        <MenubarTrigger>보기</MenubarTrigger>
        <MenuContent align="start"><MenuCheckboxItem defaultChecked>사이드바</MenuCheckboxItem><MenuCheckboxItem>미니맵</MenuCheckboxItem></MenuContent>
      </Menu>
    </Menubar>
  ),
};
