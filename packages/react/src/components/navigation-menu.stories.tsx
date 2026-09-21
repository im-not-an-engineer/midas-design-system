import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavigationMenu, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, NavigationMenuLinkCard } from './navigation-menu';

const meta = { title: '컴포넌트/내비/NavigationMenu', component: NavigationMenu } satisfies Meta<typeof NavigationMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 상단내비: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuItem>
        <NavigationMenuTrigger>제품</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="grid w-[420px] grid-cols-2 gap-inline-xs">
            <li><NavigationMenuLinkCard href="#" title="이슈 트래커" description="일을 쪼개고 배정하고 추적합니다." /></li>
            <li><NavigationMenuLinkCard href="#" title="로드맵" description="분기 단위 계획을 한 화면에." /></li>
            <li><NavigationMenuLinkCard href="#" title="문서" description="팀 지식을 이슈 옆에 둡니다." /></li>
            <li><NavigationMenuLinkCard href="#" title="자동화" description="반복 작업을 규칙으로." /></li>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuTrigger>자료</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="flex w-[280px] flex-col gap-inline-xs">
            <li><NavigationMenuLinkCard href="#" title="가이드" description="처음 시작하기" /></li>
            <li><NavigationMenuLinkCard href="#" title="API" description="개발자 문서" /></li>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem><NavigationMenuLink href="#">가격</NavigationMenuLink></NavigationMenuItem>
    </NavigationMenu>
  ),
};
