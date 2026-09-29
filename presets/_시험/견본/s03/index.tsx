import * as React from 'react';
import { FormShell } from '@/kit/shells/form/shell';
import { useShellState } from '@/kit/shells/_slot';
import { Fieldset } from '@/components/ui/fieldset';
import { Field, FieldLabel, FieldDescription, FieldError, Input, Textarea } from '@/components/ui/field';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogConfirmFooter } from '@/components/ui/alert-dialog';
import { useToastManager } from '@/components/ui/toast';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { PARTNERS, EMAIL, wait } from './data';

const EMPTY = { name: '', partner: 'hanbit', amount: '', start: '', end: '', renew: false, email: '', memo: '' };

export default function Screen() {
  const toast = useToastManager();
  const [v, setV] = React.useState(EMPTY);
  const [saved, setSaved] = React.useState(EMPTY);
  const [emailTouched, setEmailTouched] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [asking, setAsking] = React.useState(false);
  const [left, setLeft] = React.useState(false);
  const state = useShellState('ready');

  const dirty = JSON.stringify(v) !== JSON.stringify(saved);
  const emailOk = v.email === '' || EMAIL.test(v.email);
  const set = <K extends keyof typeof v>(k: K, x: (typeof v)[K]) => setV((s) => ({ ...s, [k]: x }));

  const save = async () => {
    setEmailTouched(true);
    if (!v.name.trim() || !emailOk) return;
    setSaving(true);
    await wait(700);
    setSaving(false);
    setSaved(v);
    toast.add({ title: `‘${v.name}’ 계약을 저장했습니다`, type: 'success' });
  };
  const leave = () => (dirty ? setAsking(true) : setLeft(true));

  if (left) {
    return (
      <section data-shell="_이동" className="flex flex-col items-start gap-stack-lg">
        <h1 className="text-heading-md font-semibold">계약 목록</h1>
        <p className="text-body text-fg-muted">(견본: 목록 화면으로 이동했다고 칩니다)</p>
        <Button onClick={() => setLeft(false)}>새 계약 등록으로</Button>
      </section>
    );
  }

  return (
    <>
      <FormShell
        state={state}
        back={<Button intent="ghost" size="sm" onClick={leave}>‹ 계약 목록</Button>}
        title="새 계약 등록"
        description="계약명은 꼭 적어야 합니다. 나머지는 나중에 채워도 됩니다."
        sections={
          <>
            <Fieldset legend="기본 정보">
              <Field required><FieldLabel>계약명</FieldLabel><Input value={v.name} onChange={(e) => set('name', e.target.value)} placeholder="예: 2026 유지보수 계약" /></Field>
              <Field><FieldLabel>거래처</FieldLabel><Select items={PARTNERS} value={v.partner} onValueChange={(x) => set('partner', (x as string) ?? 'hanbit')} /></Field>
              <Field><FieldLabel>계약 금액</FieldLabel><Input inputMode="numeric" value={v.amount} onChange={(e) => set('amount', e.target.value)} placeholder="원" /></Field>
            </Fieldset>
            <Fieldset legend="기간">
              <div className="flex gap-inline-lg">
                <Field className="flex-1"><FieldLabel>시작일</FieldLabel><Input type="date" value={v.start} onChange={(e) => set('start', e.target.value)} /></Field>
                <Field className="flex-1"><FieldLabel>종료일</FieldLabel><Input type="date" value={v.end} onChange={(e) => set('end', e.target.value)} /></Field>
              </div>
              <Checkbox label="만료 30일 전에 자동 갱신" checked={v.renew} onCheckedChange={(c) => set('renew', c)} />
            </Fieldset>
            <Fieldset legend="담당">
              <Field invalid={emailTouched && !emailOk}>
                <FieldLabel>담당자 이메일</FieldLabel>
                <Input value={v.email} onChange={(e) => set('email', e.target.value)} onBlur={() => setEmailTouched(true)} placeholder="name@corp.kr" />
                <FieldError match={emailTouched && !emailOk}>이메일 형식이 아닙니다 — 예: name@corp.kr</FieldError>
              </Field>
              <Field><FieldLabel>메모</FieldLabel><Textarea value={v.memo} onChange={(e) => set('memo', e.target.value)} /><FieldDescription>계약 담당자만 볼 수 있습니다.</FieldDescription></Field>
            </Fieldset>
          </>
        }
        aside={
          <Card>
            <CardHeader><CardTitle>입력 안내</CardTitle></CardHeader>
            <CardContent><p className="text-caption leading-normal text-fg-muted">저장하기 전에 떠나면 입력한 내용이 사라집니다. 금액은 부가세 포함입니다.</p></CardContent>
          </Card>
        }
        footer={
          <>
            {!dirty && <span className="text-caption text-fg-muted">바뀐 내용이 없습니다</span>}
            <Button onClick={leave}>취소</Button>
            <Button intent="primary" loading={saving} disabled={!dirty} onClick={save}>저장</Button>
          </>
        }
        empty={{ 없음: '새로 만들기라 빈 폼이 곧 시작 상태' }}
        error={<Alert status="danger" title="계약을 불러오지 못했습니다" action={<Button size="sm">다시 시도</Button>}>잠시 뒤 다시 시도하세요.</Alert>}
        loading={<div className="flex justify-center py-section-sm"><Spinner label="불러오는 중" /></div>}
      />
      <AlertDialog open={asking} onOpenChange={setAsking}>
        <AlertDialogContent>
          <AlertDialogTitle>저장하지 않은 내용이 있습니다</AlertDialogTitle>
          <AlertDialogDescription>지금 나가면 입력한 내용이 사라집니다.</AlertDialogDescription>
          <AlertDialogConfirmFooter cancelLabel="계속 작성" confirmLabel="나가기" onConfirm={() => { setAsking(false); setV(saved); setLeft(true); }} />
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
