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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogConfirmFooter } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerCloseButton } from '@/components/ui/drawer';
import { useToastManager } from '@/components/ui/toast';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Pagination } from '@/components/ui/pagination';
import { Ellipsis } from '@/lib/ax/icons';
import { SEED, DEPTS, PAGE_SIZE, wait, type Account } from './data';

export default function Screen() {
  const toast = useToastManager();
  const fails = useShellFail();
  const [accounts, setAccounts] = React.useState(SEED);
  const [query, setQuery] = React.useState('');
  const [dept, setDept] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [allScope, setAllScope] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [failure, setFailure] = React.useState<string | null>(null);
  const [target, setTarget] = React.useState<Account | null>(null);
  const [typed, setTyped] = React.useState('');
  const [peek, setPeek] = React.useState<Account | null>(null);
  const [inviting, setInviting] = React.useState(false);
  const [draft, setDraft] = React.useState({ name: '', email: '' });

  const state = useShellState(accounts.length === 0 ? 'empty' : 'ready');

  const matched = accounts.filter((a) => (query === '' || a.name.includes(query) || a.email.includes(query)) && (dept === 'all' || a.dept === dept));
  const pages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const visible = matched.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const from = matched.length === 0 ? 0 : (cur - 1) * PAGE_SIZE + 1;
  const to = (cur - 1) * PAGE_SIZE + visible.length;

  const pageChecked = visible.length > 0 && visible.every((a) => selected.has(a.id));
  const count = allScope ? matched.length : selected.size;

  const clearSelection = () => { setSelected(new Set()); setAllScope(false); };
  const changeFilter = (fn: () => void) => { fn(); setPage(1); clearSelection(); };
  const reset = () => changeFilter(() => { setQuery(''); setDept('all'); });
  const toggle = (id: string, on: boolean) => { setAllScope(false); setSelected((s) => { const n = new Set(s); on ? n.add(id) : n.delete(id); return n; }); };
  const togglePage = (on: boolean) => { setAllScope(false); setSelected(on ? new Set(visible.map((a) => a.id)) : new Set()); };

  const deactivate = async () => {
    const ids = allScope ? matched.map((a) => a.id) : [...selected];
    setBusy(true);
    setFailure(null);
    await wait(800);
    setBusy(false);
    if (fails('deactivate')) { setFailure(`${ids.length}개 계정을 비활성화하지 못했습니다. 잠시 뒤 다시 시도하세요.`); return; }
    setAccounts((xs) => xs.map((a) => (ids.includes(a.id) ? { ...a, active: false } : a)));
    clearSelection();
    toast.add({ title: `${ids.length}개 계정을 비활성화했습니다`, type: 'success' });
  };
  const remove = () => {
    if (!target) return;
    setAccounts((xs) => xs.filter((a) => a.id !== target.id));
    toast.add({ title: `‘${target.name}’ 계정과 문서 ${target.docs}개를 삭제했습니다`, type: 'success' });
    setTarget(null);
    setTyped('');
  };
  const invite = () => {
    if (!draft.name.trim()) return;
    const a: Account = { id: `n${Date.now()}`, name: draft.name.trim(), email: draft.email || '-', dept: '미배정', role: '구성원', active: true, docs: 0 };
    setAccounts((xs) => [a, ...xs]);
    setPage(1);
    setInviting(false);
    setDraft({ name: '', email: '' });
    toast.add({ title: `‘${a.name}’님을 초대했습니다`, type: 'success' });
  };

  const inviteButton = <Button intent="primary" onClick={() => setInviting(true)}>계정 초대</Button>;

  return (
    <>
      <ListShell
        state={state}
        title="직원 계정"
        description="사내 계정을 찾고, 비활성화하거나 삭제합니다"
        actions={inviteButton}
        notice={failure && (
          <Alert status="danger" title="비활성화하지 못했습니다" onClose={() => setFailure(null)} action={<Button size="sm" onClick={deactivate}>다시 시도</Button>}>
            {failure}
          </Alert>
        )}
        filters={
          <>
            <Field className="w-[240px]">
              <FieldLabel>이름 검색</FieldLabel>
              <Input value={query} onChange={(e) => changeFilter(() => setQuery(e.target.value))} placeholder="이름 또는 이메일" />
            </Field>
            <Field className="w-[160px]">
              <FieldLabel>부서</FieldLabel>
              <Select items={DEPTS} value={dept} onValueChange={(v) => changeFilter(() => setDept((v as string) ?? 'all'))} />
            </Field>
            <Button intent="ghost" onClick={reset}>초기화</Button>
          </>
        }
        bulkBar={count > 0 ? (
          <div role="toolbar" aria-label="일괄 작업" className="flex flex-wrap items-center gap-inline-md rounded-control bg-surface-selected px-inset-md py-inset-sm">
            <span className="text-body font-medium">{allScope ? `조건에 맞는 ${matched.length}개를 모두 골랐습니다` : `${pageChecked ? '이 쪽 ' : ''}${selected.size}개를 골랐습니다`}</span>
            {pageChecked && !allScope && matched.length > visible.length && (
              <Button size="sm" intent="ghost" onClick={() => setAllScope(true)}>전체 {matched.length}개 모두 고르기</Button>
            )}
            <Button size="sm" loading={busy} onClick={deactivate}>비활성화</Button>
            <Button size="sm" intent="ghost" onClick={clearSelection}>선택 해제</Button>
          </div>
        ) : undefined}
        body={
          <Table aria-label="직원 계정">
            <TableHead>
              <TableRow>
                <TableHeaderCell className="w-[40px]"><Checkbox aria-label="전체 선택" checked={pageChecked || allScope} onCheckedChange={togglePage} /></TableHeaderCell>
                <TableHeaderCell>이름</TableHeaderCell>
                <TableHeaderCell>부서</TableHeaderCell>
                <TableHeaderCell>역할</TableHeaderCell>
                <TableHeaderCell>상태</TableHeaderCell>
                <TableHeaderCell numeric>소유 문서</TableHeaderCell>
                <TableHeaderCell className="w-[48px]"><span className="sr-only">동작</span></TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.length === 0 ? (
                <TableEmpty colSpan={7} action={<Button intent="ghost" onClick={reset}>조건 초기화</Button>}>조건에 맞는 계정이 없습니다</TableEmpty>
              ) : visible.map((a) => (
                <TableRow key={a.id} selected={allScope || selected.has(a.id)}>
                  <TableCell><Checkbox aria-label={`행 선택: ${a.name}`} checked={allScope || selected.has(a.id)} onCheckedChange={(c) => toggle(a.id, c)} /></TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <a href="#" onClick={(e) => { e.preventDefault(); setPeek(a); }} className="font-medium text-fg-default hover:underline">{a.name}</a>
                      <span className="text-caption text-fg-muted">{a.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{a.dept}</TableCell>
                  <TableCell>{a.role}</TableCell>
                  <TableCell>{a.active ? <Badge status="success">사용 중</Badge> : <Badge>비활성</Badge>}</TableCell>
                  <TableCell numeric>{a.docs}</TableCell>
                  <TableCell>
                    <Menu>
                      <MenuTrigger render={<Button intent="ghost" size="sm" iconOnly aria-label="더보기" />}><Ellipsis aria-hidden /></MenuTrigger>
                      <MenuContent align="end">
                        <MenuItem onClick={() => setPeek(a)}>속성 보기</MenuItem>
                        <MenuItem disabled={!a.active} onClick={() => { setSelected(new Set([a.id])); }}>비활성화 대상으로 고르기</MenuItem>
                        <MenuItem destructive onClick={() => { setTyped(''); setTarget(a); }}>삭제</MenuItem>
                      </MenuContent>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        }
        footer={
          <>
            <span className="text-caption text-fg-muted">{from}–{to} / {matched.length}</span>
            <Pagination page={cur} pageCount={pages} onPageChange={setPage} />
          </>
        }
        empty={<div className="flex flex-col items-center gap-stack-lg py-section-sm"><span className="text-body text-fg-muted">등록된 계정이 없습니다</span>{inviteButton}</div>}
        error={<Alert status="danger" title="계정 목록을 불러오지 못했습니다" action={<Button size="sm">다시 시도</Button>}>네트워크 연결을 확인한 뒤 다시 시도하세요.</Alert>}
        loading={<div className="flex justify-center py-section-sm"><Spinner label="계정을 불러오는 중" /></div>}
      />

      <AlertDialog open={target != null} onOpenChange={(o) => { if (!o) setTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogTitle>‘{target?.name}’ 계정을 삭제할까요?</AlertDialogTitle>
          <AlertDialogDescription>이 계정이 소유한 문서 {target?.docs}개가 함께 삭제되고 되돌릴 수 없습니다.</AlertDialogDescription>
          <Field>
            <FieldLabel>확인을 위해 ‘{target?.name}’을 입력하세요</FieldLabel>
            <Input value={typed} onChange={(e) => setTyped(e.target.value)} />
          </Field>
          {typed !== target?.name && <p className="text-caption text-fg-muted">이름을 똑같이 입력해야 삭제할 수 있습니다.</p>}
          <AlertDialogConfirmFooter confirmDisabled={typed !== target?.name} onConfirm={remove} />
        </AlertDialogContent>
      </AlertDialog>

      <Drawer open={peek != null} onOpenChange={(o) => { if (!o) setPeek(null); }}>
        <DrawerContent>
          <DrawerHeader action={<DrawerCloseButton />}>
            <DrawerTitle>{peek?.name}</DrawerTitle>
            <DrawerDescription>{peek?.email}</DrawerDescription>
          </DrawerHeader>
          <dl className="grid grid-cols-[auto_1fr] gap-x-inline-lg gap-y-stack-md p-inset-lg text-body">
            <dt className="text-fg-muted">부서</dt><dd>{peek?.dept}</dd>
            <dt className="text-fg-muted">역할</dt><dd>{peek?.role}</dd>
            <dt className="text-fg-muted">상태</dt><dd>{peek?.active ? '사용 중' : '비활성'}</dd>
            <dt className="text-fg-muted">소유 문서</dt><dd>{peek?.docs}개</dd>
          </dl>
        </DrawerContent>
      </Drawer>

      <Dialog open={inviting} onOpenChange={setInviting}>
        <DialogContent>
          <DialogHeader><DialogTitle>계정 초대</DialogTitle></DialogHeader>
          <Field required><FieldLabel>이름</FieldLabel><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
          <Field><FieldLabel>이메일</FieldLabel><Input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></Field>
          <DialogConfirmFooter confirmLabel="초대" confirmDisabled={!draft.name.trim()} onConfirm={invite} />
        </DialogContent>
      </Dialog>
    </>
  );
}
