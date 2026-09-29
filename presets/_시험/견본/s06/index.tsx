import * as React from 'react';
import { FormShell } from '@/kit/shells/form/shell';
import { useShellState } from '@/kit/shells/_slot';
import { Fieldset } from '@/components/ui/fieldset';
import { Field, FieldLabel, Input, Textarea } from '@/components/ui/field';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { useToastManager } from '@/components/ui/toast';
import { KEY, AUDIENCES, clock } from './data';

type Draft = { title: string; audience: string; body: string };
const load = (): Draft => { try { return JSON.parse(localStorage.getItem(KEY) ?? '') as Draft; } catch { return { title: '', audience: 'all', body: '' }; } };

export default function Screen() {
  const toast = useToastManager();
  const [d, setD] = React.useState<Draft>(load);
  const [savedAt, setSavedAt] = React.useState<string | null>(() => (localStorage.getItem(KEY) ? '이전' : null));
  const first = React.useRef(true);
  const state = useShellState('ready');

  React.useEffect(() => {
    if (first.current) { first.current = false; return; }
    const t = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} setSavedAt(clock()); }, 1200);
    return () => clearTimeout(t);
  }, [d]);

  const publish = () => {
    if (!d.title.trim() || !d.body.trim()) return;
    try { localStorage.removeItem(KEY); } catch {}
    toast.add({ title: `‘${d.title}’ 공지를 게시했습니다`, type: 'success' });
    setD({ title: '', audience: 'all', body: '' });
    setSavedAt(null);
  };

  return (
    <FormShell
      state={state}
      title="공지 작성"
      description="쓰는 동안 자동으로 임시 저장됩니다. 창을 닫아도 이어 쓸 수 있습니다."
      sections={
        <Fieldset legend="공지">
          <Field required><FieldLabel>제목</FieldLabel><Input value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} /></Field>
          <Field className="w-[200px]"><FieldLabel>대상</FieldLabel><Select items={AUDIENCES} value={d.audience} onValueChange={(v) => setD({ ...d, audience: (v as string) ?? 'all' })} /></Field>
          <Field required><FieldLabel>본문</FieldLabel><Textarea rows={10} value={d.body} onChange={(e) => setD({ ...d, body: e.target.value })} /></Field>
        </Fieldset>
      }
      footer={
        <>
          <span role="status" className="mr-auto text-caption text-fg-muted">{savedAt ? `임시 저장됨 · ${savedAt}` : '아직 저장한 내용이 없습니다'}</span>
          <Button intent="primary" disabled={!d.title.trim() || !d.body.trim()} onClick={publish}>게시</Button>
        </>
      }
      empty={{ 없음: '새 글' }}
      error={<Alert status="danger" title="공지를 불러오지 못했습니다" action={<Button size="sm">다시 시도</Button>}>잠시 뒤 다시 시도하세요.</Alert>}
      loading={<div className="flex justify-center py-section-sm"><Spinner label="불러오는 중" /></div>}
    />
  );
}
