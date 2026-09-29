import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatComposer, type ChatAttachment } from './chat-composer';

const meta = {
  title: '컴포넌트/입력/ChatComposer',
  component: ChatComposer,
  args: { onSend: () => {} },
} satisfies Meta<typeof ChatComposer>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Enter 보내기 · Shift+Enter 줄바꿈. 글이 길어지면 8줄까지 자란다. */
export const 기본: Story = {
  render: (args) => {
    const [sent, setSent] = React.useState<string[]>([]);
    return (
      <div className="flex w-[640px] flex-col gap-stack-md">
        <ChatComposer {...args} onSend={(t) => setSent((s) => [...s, t])} />
        <span className="text-caption text-fg-muted">보낸 것: {sent.length ? sent.join(' / ') : '(없음)'}</span>
      </div>
    );
  },
};

/** 첨부·멈춤까지 다 켠 모양. 답변 중에는 보내기가 멈춤으로 바뀐다. */
export const 전부: Story = {
  render: (args) => {
    const [files, setFiles] = React.useState<ChatAttachment[]>([{ id: '1', name: '2026_출장비_정산.xlsx' }]);
    const [busy, setBusy] = React.useState(false);
    return (
      <div className="w-[640px]">
        <ChatComposer
          {...args}
          generating={busy}
          onStop={() => setBusy(false)}
          onSend={() => setBusy(true)}
          onAttach={(fs) => setFiles((f) => [...f, ...fs.map((x, i) => ({ id: `${Date.now()}-${i}`, name: x.name }))])}
          attachments={files}
          onRemoveAttachment={(id) => setFiles((f) => f.filter((x) => x.id !== id))}
        />
      </div>
    );
  },
};

export const 비활성: Story = {
  render: (args) => <div className="w-[640px]"><ChatComposer {...args} disabled placeholder="대화가 끝났습니다" /></div>,
};
