import * as React from 'react';
import { ListShell } from '@/kit/shells/list/shell';
import { useShellState } from '@/kit/shells/_slot';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, TableEmpty } from '@/components/ui/table';
import { Field, FieldLabel } from '@/components/ui/field';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { useToastManager } from '@/components/ui/toast';
import { SEED } from './data';

const KINDS = [{ value: 'all', label: '전체' }, { value: '지출', label: '지출' }, { value: '품의', label: '품의' }];

export default function Screen() {
  const toast = useToastManager();
  const [docs, setDocs] = React.useState(SEED);
  const [kind, setKind] = React.useState('all');
  const state = useShellState(docs.length === 0 ? 'empty' : 'ready');
  const visible = docs.filter((d) => kind === 'all' || d.kind === kind);
  const approve = (id: string) => {
    const d = docs.find((x) => x.id === id)!;
    setDocs((xs) => xs.map((x) => (x.id === id ? { ...x, state: 'approved' } : x)));
    toast.add({ title: `‘${d.title}’을 승인했습니다`, type: 'success' });
  };
  return (
    <ListShell
      state={state}
      title="결재할 문서"
      description="내 차례인 문서입니다. 행에서 바로 승인할 수 있습니다."
      filters={<Field className="w-[160px]"><FieldLabel>종류</FieldLabel><Select items={KINDS} value={kind} onValueChange={(v) => setKind((v as string) ?? 'all')} /></Field>}
      body={
        <Table aria-label="결재할 문서">
          <TableHead><TableRow><TableHeaderCell>제목</TableHeaderCell><TableHeaderCell>기안자</TableHeaderCell><TableHeaderCell>종류</TableHeaderCell><TableHeaderCell>기안일</TableHeaderCell><TableHeaderCell>상태</TableHeaderCell><TableHeaderCell className="w-[96px]"><span className="sr-only">동작</span></TableHeaderCell></TableRow></TableHead>
          <TableBody>
            {visible.length === 0 ? <TableEmpty colSpan={6}>이 종류의 문서가 없습니다</TableEmpty> : visible.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.title}</TableCell><TableCell>{d.drafter}</TableCell><TableCell>{d.kind}</TableCell><TableCell>{d.date}</TableCell>
                <TableCell>{d.state === 'approved' ? <Badge status="success">승인</Badge> : <Badge status="info">대기</Badge>}</TableCell>
                <TableCell>{d.state === 'pending' && <Button size="sm" onClick={() => approve(d.id)}>승인</Button>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      }
      footer={<span className="text-caption text-fg-muted">총 {visible.length}건</span>}
      empty={<p className="py-section-sm text-center text-body text-fg-muted">결재할 문서가 없습니다</p>}
      error={<Alert status="danger" title="문서를 불러오지 못했습니다" action={<Button size="sm">다시 시도</Button>}>잠시 뒤 다시 시도하세요.</Alert>}
      loading={<div className="flex justify-center py-section-sm"><Spinner label="불러오는 중" /></div>}
    />
  );
}
