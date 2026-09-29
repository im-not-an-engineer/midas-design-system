import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatThread, ChatMessage } from './chat-message';
import { Button } from './button';
import { Copy, RefreshCw } from '../lib/icons';

const meta = {
  title: '컴포넌트/표시/ChatMessage',
  component: ChatMessage,
  args: { from: 'user', children: '말' },
} satisfies Meta<typeof ChatMessage>;
export default meta;
type Story = StoryObj<typeof meta>;

const Actions = () => (
  <>
    <Button intent="ghost" size="sm" iconOnly aria-label="복사"><Copy aria-hidden /></Button>
    <Button intent="ghost" size="sm" iconOnly aria-label="다시 쓰기"><RefreshCw aria-hidden /></Button>
  </>
);

/** 사용자 말은 오른쪽 말풍선, AI 답변은 말풍선 없이 넓게. */
export const 대화: Story = {
  render: () => (
    <ChatThread className="w-[640px]">
      <ChatMessage from="user">이번 달 출장비 정산 마감일이 언제야?</ChatMessage>
      <ChatMessage from="assistant" actions={<Actions />}>
        이번 달 출장비 정산 마감은 10월 5일(일)입니다. 영수증은 마감 3일 전까지 올려 주세요. 늦게 올린 건은 다음 달 정산으로 넘어갑니다.
      </ChatMessage>
      <ChatMessage from="user">{'영수증을 잃어버렸으면 어떻게 해?\n카드 명세서로 대신할 수 있어?'}</ChatMessage>
      <ChatMessage from="assistant" pending />
    </ChatThread>
  ),
};
