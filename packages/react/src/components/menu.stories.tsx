import type { Meta, StoryObj } from '@storybook/react-vite';
import { Menu, MenuTrigger, MenuContent, MenuGroup, MenuItem, MenuSeparator, MenuCheckboxItem, MenuRadioGroup, MenuRadioItem, MenuSub, MenuSubTrigger, MenuSubContent } from './menu';
import { Button } from './button';

const meta = {
  title: '컴포넌트/Menu',
  component: MenuContent,
} satisfies Meta<typeof MenuContent>;
export default meta;
type Story = StoryObj<typeof meta>;

/** 항목 높이가 --spacing-control-sm이라 아키타입을 바꾸면 메뉴도 같이 조여진다. */
export const 기본: Story = {
  render: () => (
    <Menu>
      <MenuTrigger render={<Button />}>메뉴 열기</MenuTrigger>
      <MenuContent align="start">
        <MenuGroup label="이슈">
          <MenuItem>이름 바꾸기</MenuItem>
          <MenuItem>복제</MenuItem>
          <MenuItem disabled>보관 (권한 없음)</MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuItem destructive>삭제</MenuItem>
      </MenuContent>
    </Menu>
  ),
};

export const 체크와라디오: Story = {
  render: () => (
    <Menu>
      <MenuTrigger render={<Button />}>보기 옵션</MenuTrigger>
      <MenuContent align="start">
        <MenuGroup label="표시">
          <MenuCheckboxItem defaultChecked>담당자</MenuCheckboxItem>
          <MenuCheckboxItem>마감일</MenuCheckboxItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup label="밀도">
          <MenuRadioGroup defaultValue="compact">
            <MenuRadioItem value="compact">촘촘하게</MenuRadioItem>
            <MenuRadioItem value="comfortable">넉넉하게</MenuRadioItem>
          </MenuRadioGroup>
        </MenuGroup>
      </MenuContent>
    </Menu>
  ),
};

export const 하위메뉴: Story = {
  render: () => (
    <Menu>
      <MenuTrigger render={<Button />}>이동</MenuTrigger>
      <MenuContent align="start">
        <MenuItem>내 이슈</MenuItem>
        <MenuSub>
          <MenuSubTrigger>프로젝트</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>디자인시스템</MenuItem>
            <MenuItem>AX 파이프라인</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </MenuContent>
    </Menu>
  ),
};
