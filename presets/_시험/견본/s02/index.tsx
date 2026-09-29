import * as React from 'react';
import { ListDetailShell } from '@/kit/shells/list-detail/shell';
import { useShellState } from '@/kit/shells/_slot';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Field, FieldLabel, Textarea } from '@/components/ui/field';
import { Select } from '@/components/ui/select';
import { Meter } from '@/components/ui/progress';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { useToastManager } from '@/components/ui/toast';
import { cn } from '@/lib/ax/cn';
import { SEED, PERIODS, STATUSES, LABEL, TONE, type Inquiry } from './data';

const STEP = 10;

export default function Screen() {
  const toast = useToastManager();
  const [items, setItems] = React.useState(SEED);
  const [draft, setDraft] = React.useState({ period: '30', status: 'all' });
  const [applied, setApplied] = React.useState(draft);
  const [shown, setShown] = React.useState(STEP);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [reply, setReply] = React.useState('');

  const state = useShellState(items.length === 0 ? 'empty' : 'ready');
  const matched = items.filter((q) => (applied.period === 'all' || q.days <= Number(applied.period)) && (applied.status === 'all' || q.status === applied.status));
  const visible = matched.slice(0, shown);
  const selected = items.find((q) => q.id === selectedId) ?? null;
  const changed = draft.period !== applied.period || draft.status !== applied.status;

  const send = (q: Inquiry) => {
    if (!reply.trim()) return;
    setItems((xs) => xs.map((x) => (x.id === q.id ? { ...x, status: 'answered' } : x)));
    setReply('');
    toast.add({ title: `‘${q.title}’에 답변을 보냈습니다`, type: 'success' });
  };

  return (
    <ListDetailShell
      state={state}
      title="고객 문의"
      description="문의를 골라 옆에서 읽고 답변합니다"
      listFilters={
        <>
          <div className="flex items-end gap-inline-sm">
            <Field className="flex-1"><FieldLabel>기간</FieldLabel><Select items={PERIODS} value={draft.period} onValueChange={(v) => setDraft({ ...draft, period: (v as string) ?? '30' })} /></Field>
            <Field className="flex-1"><FieldLabel>상태</FieldLabel><Select items={STATUSES} value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: (v as string) ?? 'all' })} /></Field>
            <Button intent="primary" onClick={() => { setApplied(draft); setShown(STEP); }}>조회</Button>
          </div>
          {changed && <span className="text-caption text-fg-muted">조건이 바뀌었습니다 — 조회를 누르세요</span>}
        </>
      }
      list={
        <div className="flex flex-col gap-stack-sm">
          <ul aria-label="문의 목록" className="flex flex-col gap-stack-xs">
            {visible.map((q) => (
              <li key={q.id}>
                <button
                  type="button"
                  aria-current={q.id === selectedId || undefined}
                  onClick={() => setSelectedId(q.id)}
                  className={cn('flex w-full flex-col gap-stack-xs rounded-control px-inset-sm py-inset-sm text-left ax-focus-ring hover:bg-surface-hover', q.id === selectedId && 'bg-surface-selected')}
                >
                  <span className="flex items-center justify-between gap-inline-sm">
                    <span className="truncate font-medium">{q.title}</span>
                    <Badge status={TONE[q.status]}>{LABEL[q.status]}</Badge>
                  </span>
                  <span className="text-caption text-fg-muted">{q.customer} · {q.channel} · {q.days}일 전</span>
                </button>
              </li>
            ))}
          </ul>
          {visible.length === 0 && <p className="py-inset-lg text-center text-body text-fg-muted">조건에 맞는 문의가 없습니다</p>}
          {matched.length > shown ? <Button intent="ghost" fullWidth onClick={() => setShown(shown + STEP)}>더 보기</Button>
            : visible.length > 0 && <p className="text-center text-caption text-fg-muted">모두 봤습니다</p>}
        </div>
      }
      detail={selected && (
        <section aria-label="문의 상세" className="flex flex-col gap-stack-lg">
          <header className="flex flex-col gap-stack-sm">
            <div className="flex items-center gap-inline-md">
              <h2 className="text-heading-sm font-semibold">{selected.title}</h2>
              <Badge status={TONE[selected.status]}>{LABEL[selected.status]}</Badge>
            </div>
            <span className="text-caption text-fg-muted">{selected.customer} · {selected.channel} · {selected.days}일 전</span>
          </header>
          <Meter label="SLA 경과" value={selected.sla} showValue status={selected.sla >= 90 ? 'danger' : selected.sla >= 70 ? 'warning' : undefined} />
          <p className="text-body leading-normal">{selected.body}</p>
          <Field>
            <FieldLabel>답변</FieldLabel>
            <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="고객에게 보낼 답변" />
          </Field>
          <div className="flex justify-end"><Button intent="primary" disabled={!reply.trim()} onClick={() => send(selected)}>답변 보내기</Button></div>
        </section>
      )}
      noSelection={<p className="py-section-sm text-center text-body text-fg-muted">왼쪽에서 문의를 고르세요</p>}
      empty={<p className="py-section-sm text-center text-body text-fg-muted">들어온 문의가 없습니다</p>}
      error={<Alert status="danger" title="문의를 불러오지 못했습니다" action={<Button size="sm">다시 시도</Button>}>잠시 뒤 다시 시도하세요.</Alert>}
      loading={<div className="flex justify-center py-section-sm"><Spinner label="문의를 불러오는 중" /></div>}
    />
  );
}
