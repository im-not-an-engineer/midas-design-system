import * as React from 'react';
import { ListShell } from '@/kit/shells/list/shell';
import { useShellState } from '@/kit/shells/_slot';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, TableEmpty } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Field, FieldLabel, Input } from '@/components/ui/field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { SEED, ACTIVITY, LABEL, TONE } from './data';

export default function Screen() {
  const [q, setQ] = React.useState('');
  const state = useShellState('ready');
  const rows = SEED.filter((c) => c.name.includes(q) || c.partner.includes(q));
  const count = (s?: string) => SEED.filter((c) => !s || c.state === s).length;
  const kpi = (label: string, n: number) => (
    <Card><CardHeader><CardDescription>{label}</CardDescription><CardTitle>{n}건</CardTitle></CardHeader></Card>
  );
  return (
    <ListShell
      state={state}
      title="계약"
      description="진행 중인 계약을 찾고 만료를 챙깁니다"
      lead={<div className="grid grid-cols-4 gap-inline-lg">{kpi('전체', count())}{kpi('진행 중', count('active'))}{kpi('만료 임박', count('expiring'))}{kpi('종료', count('ended'))}</div>}
      side={
        <Card>
          <CardHeader><CardTitle>최근 활동</CardTitle></CardHeader>
          <CardContent><ul className="flex flex-col gap-stack-md">{ACTIVITY.map((a) => <li key={a} className="text-caption leading-normal text-fg-muted">{a}</li>)}</ul></CardContent>
        </Card>
      }
      filters={<><Field className="w-[240px]"><FieldLabel>계약명 검색</FieldLabel><Input value={q} onChange={(e) => setQ(e.target.value)} /></Field><Button intent="ghost" onClick={() => setQ('')}>초기화</Button></>}
      body={
        <Table aria-label="계약">
          <TableHead><TableRow><TableHeaderCell>계약명</TableHeaderCell><TableHeaderCell>거래처</TableHeaderCell><TableHeaderCell>만료일</TableHeaderCell><TableHeaderCell>상태</TableHeaderCell><TableHeaderCell numeric>금액(만 원)</TableHeaderCell></TableRow></TableHead>
          <TableBody>
            {rows.length === 0 ? <TableEmpty colSpan={5} action={<Button intent="ghost" onClick={() => setQ('')}>초기화</Button>}>조건에 맞는 계약이 없습니다</TableEmpty> : rows.map((c) => (
              <TableRow key={c.id}><TableCell className="font-medium">{c.name}</TableCell><TableCell>{c.partner}</TableCell><TableCell>{c.end}</TableCell><TableCell><Badge status={TONE[c.state]}>{LABEL[c.state]}</Badge></TableCell><TableCell numeric>{c.amount.toLocaleString()}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      }
      footer={<span className="text-caption text-fg-muted">총 {rows.length}건</span>}
      empty={<p className="py-section-sm text-center text-body text-fg-muted">계약이 없습니다</p>}
      error={<Alert status="danger" title="계약을 불러오지 못했습니다" action={<Button size="sm">다시 시도</Button>}>잠시 뒤 다시 시도하세요.</Alert>}
      loading={<div className="flex justify-center py-section-sm"><Spinner label="불러오는 중" /></div>}
    />
  );
}
