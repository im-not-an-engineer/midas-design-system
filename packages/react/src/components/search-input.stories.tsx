import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchInput } from './search-input';

const meta = {
  title: '컴포넌트/입력/SearchInput',
  component: SearchInput,
  args: { placeholder: '이름·팀으로 검색' },
} satisfies Meta<typeof SearchInput>;
export default meta;
type Story = StoryObj<typeof meta>;

/** 글자를 넣으면 오른쪽에 지우기 버튼이 뜬다. */
export const 기본: Story = { render: (args) => <SearchInput {...args} className="w-[280px]" /> };

/** 제어 컴포넌트 — 값과 지우기를 쓰는 쪽이 들고 있다. */
export const 제어: Story = {
  render: (args) => {
    const [q, setQ] = React.useState('김민수');
    return (
      <div className="flex w-[280px] flex-col gap-stack-sm">
        <SearchInput {...args} value={q} onChange={(e) => setQ(e.currentTarget.value)} onClear={() => setQ('')} />
        <span className="text-caption text-fg-muted">검색어: {q || '(없음)'}</span>
      </div>
    );
  },
};

export const 비활성: Story = { render: (args) => <SearchInput {...args} className="w-[280px]" disabled /> };
