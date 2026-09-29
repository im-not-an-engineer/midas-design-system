import * as React from 'react';
import { ListShell } from '@/kit/shells/list/shell';
import { useShellState, useShellFail } from '@/kit/shells/_slot';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, TableEmpty } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Field, FieldLabel, Input } from '@/components/ui/field';
import { Select } from '@/components/ui/select';
import { Menu, MenuTrigger, MenuContent, MenuItem } from '@/components/ui/menu';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogConfirmFooter } from '@/components/ui/alert-dialog';
import { useToastManager } from '@/components/ui/toast';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Ellipsis } from '@/lib/ax/icons';

import { SEED, DEPTS, STATUSES, type Account } from './data';

export default function Screen() {
  const toast = useToastManager();
  const fails = useShellFail();
  const [failure, setFailure] = React.useState<string | null>(null);
  const [accounts, setAccounts] = React.useState(SEED);
  const [query, setQuery] = React.useState('');
  const [dept, setDept] = React.useState('all');
  const [status, setStatus] = React.useState('all');
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [target, setTarget] = React.useState<Account | null>(null);
  const lastTarget = React.useRef<Account | null>(null);
  if (target) lastTarget.current = target;

  const state = useShellState(accounts.length === 0 ? 'empty' : 'ready');

  const visible = accounts.filter(
    (a) =>
      (query === '' || a.name.includes(query) || a.email.includes(query)) &&
      (dept === 'all' || a.dept === dept) &&
      (status === 'all' || (status === 'active') === a.active),
  );
  const allChecked = visible.length > 0 && visible.every((a) => selected.has(a.id));
  const someChecked = visible.some((a) => selected.has(a.id));

  const toggle = (id: string, on: boolean) =>
    setSelected((s) => { const n = new Set(s); if (on) n.add(id); else n.delete(id); return n; });
  const toggleAll = (on: boolean) => setSelected(on ? new Set(visible.map((a) => a.id)) : new Set());
  const resetFilters = () => { setQuery(''); setDept('all'); setStatus('all'); };

  const deactivate = (ids: string[]) => {
    if (fails('deactivate')) { setFailure(`${ids.length}개 계정을 비활성화하지 못했습니다. 잠시 뒤 다시 시도하세요.`); return; }
    setFailure(null);
    setAccounts((xs) => xs.map((a) => (ids.includes(a.id) ? { ...a, active: false } : a)));
    setSelected(new Set());
    toast.add({ title: `${ids.length}개 계정을 비활성화했습니다`, type: 'success' });
  };
  const remove = () => {
    if (!target) return;
    setAccounts((xs) => xs.filter((a) => a.id !== target.id));
    setSelected((s) => { const n = new Set(s); n.delete(target.id); return n; });
    toast.add({ title: `‘${target.name}’ 계정을 삭제했습니다`, type: 'success' });
    setTarget(null);
  };

  const invite = <Button intent="primary">계정 초대</Button>;

  return (
    <>
      <ListShell
        state={state}
        title="직원 계정"
        description="사내 계정을 찾고, 비활성화하거나 삭제합니다"
        actions={invite}
        notice={failure && (
          <Alert status="danger" title="비활성화하지 못했습니다" onClose={() => setFailure(null)} action={<Button size="sm" onClick={() => deactivate([...selected])}>다시 시도</Button>}>
            {failure}
          </Alert>
        )}
        filters={
          <>
            <Field className="w-[240px]">
              <FieldLabel>이름 검색</FieldLabel>
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="이름 또는 이메일" />
            </Field>
            <Field className="w-[160px]">
              <FieldLabel>부서</FieldLabel>
              <Select items={DEPTS} value={dept} onValueChange={(v) => setDept((v as string) ?? 'all')} />
            </Field>
            <Field className="w-[160px]">
              <FieldLabel>상태</FieldLabel>
              <Select items={STATUSES} value={status} onValueChange={(v) => setStatus((v as string) ?? 'all')} />
            </Field>
            <Button intent="ghost" onClick={resetFilters}>초기화</Button>
          </>
        }
        bulkBar={
          selected.size > 0 ? (
            <div role="toolbar" aria-label="일괄 작업" className="flex items-center gap-inline-md rounded-control bg-surface-selected px-inset-md py-inset-sm">
              <span className="text-body font-medium text-fg-default">{selected.size}개 선택됨</span>
              <Button size="sm" onClick={() => deactivate([...selected])}>비활성화</Button>
              <Button size="sm" intent="ghost" onClick={() => setSelected(new Set())}>선택 해제</Button>
            </div>
          ) : undefined
        }
        body={
          <Table aria-label="직원 계정">
            <TableHead>
              <TableRow>
                <TableHeaderCell className="w-[40px]">
                  <Checkbox aria-label="전체 선택" checked={allChecked} indeterminate={!allChecked && someChecked} onCheckedChange={toggleAll} />
                </TableHeaderCell>
                <TableHeaderCell>이름</TableHeaderCell>
                <TableHeaderCell>부서</TableHeaderCell>
                <TableHeaderCell>역할</TableHeaderCell>
                <TableHeaderCell>상태</TableHeaderCell>
                <TableHeaderCell>최근 접속</TableHeaderCell>
                <TableHeaderCell className="w-[48px]"><span className="sr-only">동작</span></TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.length === 0 ? (
                <TableEmpty colSpan={7} action={<Button intent="ghost" onClick={resetFilters}>필터 초기화</Button>}>
                  조건에 맞는 계정이 없습니다
                </TableEmpty>
              ) : (
                visible.map((a) => (
                  <TableRow key={a.id} selected={selected.has(a.id)}>
                    <TableCell>
                      <Checkbox aria-label={`행 선택: ${a.name}`} checked={selected.has(a.id)} onCheckedChange={(c) => toggle(a.id, c)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{a.name}</span>
                        <span className="text-caption text-fg-muted">{a.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{a.dept}</TableCell>
                    <TableCell>{a.role}</TableCell>
                    <TableCell>{a.active ? <Badge status="success">사용 중</Badge> : <Badge>비활성</Badge>}</TableCell>
                    <TableCell>{a.lastSeen}</TableCell>
                    <TableCell>
                      <Menu>
                        <MenuTrigger render={<Button intent="ghost" size="sm" iconOnly aria-label="더보기" />}>
                          <Ellipsis aria-hidden />
                        </MenuTrigger>
                        <MenuContent align="end">
                          <MenuItem disabled={!a.active} onClick={() => deactivate([a.id])}>비활성화</MenuItem>
                          <MenuItem destructive onClick={() => setTarget(a)}>삭제</MenuItem>
                        </MenuContent>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        }
        footer={<span className="text-caption text-fg-muted">총 {visible.length}명</span>}
        empty={
          <div className="flex flex-col items-center gap-stack-lg py-section-sm">
            <span className="text-body text-fg-muted">등록된 계정이 없습니다</span>
            {invite}
          </div>
        }
        error={
          <Alert status="danger" title="계정 목록을 불러오지 못했습니다" action={<Button size="sm">다시 시도</Button>}>
            네트워크 연결을 확인한 뒤 다시 시도하세요.
          </Alert>
        }
        loading={
          <div className="flex justify-center py-section-sm">
            <Spinner label="계정을 불러오는 중" />
          </div>
        }
      />

      <AlertDialog open={target != null} onOpenChange={(open) => { if (!open) setTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogTitle>‘{lastTarget.current?.name}’ 계정을 삭제할까요?</AlertDialogTitle>
          <AlertDialogDescription>삭제하면 되돌릴 수 없습니다. 이 계정으로는 더 이상 로그인할 수 없습니다.</AlertDialogDescription>
          <AlertDialogConfirmFooter onConfirm={remove} />
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
