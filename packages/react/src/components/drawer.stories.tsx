import type { Meta, StoryObj } from '@storybook/react-vite';
import { Drawer, DrawerTrigger, DrawerContent, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose, DrawerCloseButton } from './drawer';
import { Button } from './button';
import { Field, FieldLabel, Input, Textarea } from './field';

const meta = {
  title: '컴포넌트/오버레이/Drawer',
  component: Drawer,
  args: { side: 'right' },
  argTypes: { side: { control: 'radio', options: ['right', 'left', 'bottom'] } },
} satisfies Meta<typeof Drawer>;
export default meta;
type Story = StoryObj<typeof meta>;

const Body = () => (
  <>
    <div className="flex items-start justify-between gap-inline-md">
      <div className="flex flex-col gap-stack-xs"><DrawerTitle>ISSUE-241</DrawerTitle><DrawerDescription>토큰 계약 위반 린트 추가</DrawerDescription></div>
      <DrawerCloseButton />
    </div>
    <Field><FieldLabel>담당자</FieldLabel><Input defaultValue="양희윤" /></Field>
    <Field><FieldLabel>메모</FieldLabel><Textarea rows={6} placeholder="진행 상황" /></Field>
    <DrawerFooter>
      <DrawerClose render={<Button intent="secondary" />}>닫기</DrawerClose>
      <Button intent="primary">저장</Button>
    </DrawerFooter>
  </>
);

export const 기본: Story = {
  render: (args) => (
    <Drawer {...args}>
      <DrawerTrigger render={<Button />}>상세 열기</DrawerTrigger>
      <DrawerContent><Body /></DrawerContent>
    </Drawer>
  ),
};

export const 열린상태_오른쪽: Story = { render: () => <Drawer side="right" open><DrawerContent><Body /></DrawerContent></Drawer> };
export const 열린상태_아래: Story = { render: () => <Drawer side="bottom" open><DrawerContent><Body /></DrawerContent></Drawer> };
