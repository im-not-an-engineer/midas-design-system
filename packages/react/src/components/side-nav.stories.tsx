import type { Meta, StoryObj } from '@storybook/react-vite';
import { SideNav, SideNavGroup, SideNavItem } from './side-nav';
import { Archive } from '../lib/icons';

const meta = {
  title: '컴포넌트/내비/SideNav',
  component: SideNav,
} satisfies Meta<typeof SideNav>;
export default meta;
type Story = StoryObj<typeof meta>;

/** 화면 왼쪽 2뎁스 메뉴. 폭은 쓰는 쪽이 정한다(레이아웃 폭이라 토큰이 아니다). */
export const 기본: Story = {
  render: () => (
    <SideNav aria-label="전표" className="w-[240px]">
      <SideNavGroup label="범주명">
        <SideNavItem href="#" active>2뎁스 메뉴명</SideNavItem>
        <SideNavItem href="#">2뎁스 메뉴명</SideNavItem>
        <SideNavItem href="#">2뎁스 메뉴명</SideNavItem>
      </SideNavGroup>
      <SideNavGroup label="분류">
        <SideNavItem href="#"><Archive />보관함</SideNavItem>
        <SideNavItem href="#" disabled>권한 없는 메뉴</SideNavItem>
      </SideNavGroup>
    </SideNav>
  ),
};
