import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toolbar, ToolbarGroup, ToolbarButton, ToolbarSeparator, ToolbarLink } from './toolbar';
import { Toggle, ToggleGroup } from './toggle';

const meta = { title: '컴포넌트/내비/Toolbar', component: Toolbar } satisfies Meta<typeof Toolbar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 서식도구: Story = {
  render: () => (
    <Toolbar aria-label="서식">
      <ToggleGroup defaultValue={['bold']} multiple aria-label="글자">
        <ToolbarButton render={<Toggle value="bold" size="sm" aria-label="굵게" />}><b>B</b></ToolbarButton>
        <ToolbarButton render={<Toggle value="italic" size="sm" aria-label="기울임" />}><i>I</i></ToolbarButton>
        <ToolbarButton render={<Toggle value="underline" size="sm" aria-label="밑줄" />}><u>U</u></ToolbarButton>
      </ToggleGroup>
      <ToolbarSeparator />
      <ToolbarGroup aria-label="정렬">
        <ToolbarButton aria-label="왼쪽">≡</ToolbarButton>
        <ToolbarButton aria-label="가운데">≡</ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarLink href="#">도움말</ToolbarLink>
    </Toolbar>
  ),
};
