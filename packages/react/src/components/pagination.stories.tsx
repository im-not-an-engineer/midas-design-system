import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pagination } from './pagination';

const meta = {
  title: '컴포넌트/내비/Pagination',
  component: Pagination,
  args: { page: 1, pageCount: 10, onPageChange: () => {}, size: 'md' },
  argTypes: { size: { control: 'radio', options: ['sm', 'md', 'lg'] } },
} satisfies Meta<typeof Pagination>;
export default meta;
type Story = StoryObj<typeof meta>;

/** 누르면 쪽이 옮겨 간다. 처음·끝 쪽은 늘 보이고, 멀리 떨어진 쪽은 … 로 접힌다. */
export const 기본: Story = {
  render: (args) => {
    const [page, setPage] = React.useState(5);
    return <Pagination {...args} page={page} pageCount={24} onPageChange={setPage} />;
  },
};

/** 쪽이 적으면 접지 않고 다 보인다. 한 쪽뿐이면 아무것도 그리지 않는다. */
export const 적은쪽: Story = {
  render: (args) => {
    const [page, setPage] = React.useState(1);
    return <Pagination {...args} page={page} pageCount={5} onPageChange={setPage} />;
  },
};
