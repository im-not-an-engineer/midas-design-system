import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableHeaderMenu, TableCell, TableEmpty } from './table';
import { MenuGroup, MenuRadioGroup, MenuRadioItem, MenuCheckboxItem, MenuSeparator } from './menu';
import { Button } from './button';

const ROWS = [
  { id: 'ISSUE-241', title: '토큰 계약 위반 린트 추가', owner: '양희윤', status: '진행', n: 12 },
  { id: 'ISSUE-238', title: '다이얼로그 포커스 복귀 버그', owner: '미정', status: '대기', n: 3 },
  { id: 'ISSUE-233', title: 'workbench 아키타입 행 높이 검토', owner: '양희윤', status: '완료', n: 48 },
];

const meta = {
  title: '컴포넌트/Table',
  component: Table,
  args: { size: 'lg', divided: true },
  argTypes: { size: { control: 'radio', options: ['sm', 'md', 'lg'] } },
} satisfies Meta<typeof Table>;
export default meta;
type Story = StoryObj<typeof meta>;

const Head = () => (
  <TableHead>
    <TableRow>
      <TableHeaderCell>ID</TableHeaderCell>
      <TableHeaderCell>제목</TableHeaderCell>
      <TableHeaderCell>담당</TableHeaderCell>
      <TableHeaderCell>상태</TableHeaderCell>
      <TableHeaderCell>댓글</TableHeaderCell>
    </TableRow>
  </TableHead>
);

/** 행 높이는 --spacing-row-{size}. 아키타입의 얼굴. */
export const 기본: Story = {
  render: (args) => (
    <Table {...args}>
      <Head />
      <TableBody>
        {ROWS.map((r, i) => (
          <TableRow key={r.id} interactive selected={i === 1}>
            <TableCell className="font-semibold">{r.id}</TableCell>
            <TableCell>{r.title}</TableCell>
            <TableCell>{r.owner}</TableCell>
            <TableCell>{r.status}</TableCell>
            <TableCell>{r.n}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/** 에이전트 산출물이 가장 자주 빠뜨리는 상태. */
export const 빈상태: Story = {
  render: (args) => (
    <Table {...args}>
      <Head />
      <TableBody>
        <TableEmpty colSpan={5} action={<Button size="sm" intent="primary">이슈 만들기</Button>}>
          조건에 맞는 이슈가 없습니다
        </TableEmpty>
      </TableBody>
    </Table>
  ),
};

/** 정렬·필터. 머리 칸에 TableHeaderMenu 를 넣으면 열 이름 옆에 ▾가 붙고, 누르면 메뉴가 열린다. */
export const 정렬과필터: Story = {
  render: (args) => {
    const [sort, setSort] = React.useState('none');
    return (
      <Table {...args}>
        <TableHead>
          <TableRow>
            <TableHeaderCell>ID</TableHeaderCell>
            <TableHeaderCell aria-sort={sort === 'none' ? undefined : sort === 'asc' ? 'ascending' : 'descending'}>
              <TableHeaderMenu label="제목">
                <MenuGroup label="정렬">
                  <MenuRadioGroup value={sort} onValueChange={(v) => setSort(v as string)}>
                    <MenuRadioItem value="none">기본 순서</MenuRadioItem>
                    <MenuRadioItem value="asc">오름차순</MenuRadioItem>
                    <MenuRadioItem value="desc">내림차순</MenuRadioItem>
                  </MenuRadioGroup>
                </MenuGroup>
              </TableHeaderMenu>
            </TableHeaderCell>
            <TableHeaderCell>
              <TableHeaderMenu label="상태">
                <MenuGroup label="필터">
                  <MenuCheckboxItem defaultChecked>진행</MenuCheckboxItem>
                  <MenuCheckboxItem defaultChecked>대기</MenuCheckboxItem>
                  <MenuSeparator />
                  <MenuCheckboxItem>완료</MenuCheckboxItem>
                </MenuGroup>
              </TableHeaderMenu>
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ROWS.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-semibold">{r.id}</TableCell>
              <TableCell>{r.title}</TableCell>
              <TableCell>{r.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  },
};
