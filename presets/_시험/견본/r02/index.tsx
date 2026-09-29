import * as React from 'react';
import { ReviewQueueShell } from '@/kit/shells/review-queue/shell';
import { useShellState, useShellFail } from '@/kit/shells/_slot';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogConfirmFooter } from '@/components/ui/dialog';
import { Field, FieldLabel, FieldDescription, Textarea } from '@/components/ui/field';
import { useToastManager } from '@/components/ui/toast';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { SEED, won, type Claim } from './data';

export default function Screen() {
  const toast = useToastManager();
  const fails = useShellFail();
  const [failure, setFailure] = React.useState<string | null>(null);
  const [queue, setQueue] = React.useState<Claim[]>(SEED);
  const [done, setDone] = React.useState(0);
  const [rejecting, setRejecting] = React.useState(false);
  const [reason, setReason] = React.useState('');

  const state = useShellState(queue.length === 0 ? 'empty' : 'ready');
  const current = queue[0];

  const next = () => { setQueue((q) => q.slice(1)); setDone((d) => d + 1); };

  const approve = () => {
    if (!current) return;
    if (fails('approve')) { setFailure(`‘${current.title}’ 청구를 승인하지 못했습니다. 잠시 뒤 다시 시도하세요.`); return; }
    setFailure(null);
    next();
    toast.add({ title: `‘${current.title}’ 청구를 승인했습니다`, type: 'success' });
  };
  const reject = () => {
    if (!current || !reason.trim()) return;
    next();
    setRejecting(false);
    setReason('');
    toast.add({ title: `‘${current.title}’ 청구를 반려했습니다`, description: `사유: ${reason.trim()}`, type: 'info' });
  };
  // 휴지통에서 30일 동안 복구된다 → 묻지 않고 바로 지우고, 되돌리기를 준다.
  const remove = () => {
    if (!current) return;
    const at = 0;
    setQueue((q) => q.filter((c) => c.id !== current.id));
    toast.add({
      title: `‘${current.title}’ 청구를 휴지통으로 옮겼습니다`,
      description: '30일 동안 휴지통에서 복구할 수 있습니다.',
      actionProps: { children: '되돌리기', onClick: () => setQueue((q) => [...q.slice(0, at), current, ...q.slice(at)]) },
    });
  };

  const total = done + queue.length;

  return (
    <>
      <ReviewQueueShell
        state={state}
        title="경비 청구 검토"
        notice={failure && (
          <Alert status="danger" title="승인하지 못했습니다" onClose={() => setFailure(null)} action={<Button size="sm" onClick={approve}>다시 시도</Button>}>
            {failure}
          </Alert>
        )}
        progress={<span className="text-body text-fg-muted">{total}건 중 {done + 1}번째</span>}
        item={
          current && (
            <Card className="shadow-none border-none p-inset-xs">
              <CardHeader action={<Button intent="ghost" size="sm" onClick={remove}>청구 삭제</Button>}>
                <CardTitle>{current.title}</CardTitle>
                <CardDescription>{current.who} · {current.dept} · {current.date}</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-[auto_1fr] gap-x-inline-lg gap-y-stack-md">
                  <dt className="text-fg-muted">분류</dt>
                  <dd><Badge status="info">{current.category}</Badge></dd>
                  <dt className="text-fg-muted">금액</dt>
                  <dd className="text-heading-sm font-semibold">{won(current.amount)}</dd>
                  <dt className="text-fg-muted">메모</dt>
                  <dd>{current.memo}</dd>
                  <dt className="text-fg-muted">영수증</dt>
                  <dd className="text-fg-link">{current.receipt}</dd>
                </dl>
              </CardContent>
            </Card>
          )
        }
        decision={
          <>
            <Button onClick={() => setRejecting(true)}>반려</Button>
            <Button intent="primary" onClick={approve}>승인</Button>
          </>
        }
        side={
          <Card>
            <CardHeader>
              <CardTitle>대기 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <ul aria-label="대기 목록" className="flex flex-col gap-stack-xs">
                {queue.map((c, i) => (
                  <li
                    key={c.id}
                    aria-current={i === 0 ? 'true' : undefined}
                    className="flex items-center justify-between gap-inline-md rounded-control px-inset-sm py-inset-xs aria-[current=true]:bg-surface-selected"
                  >
                    <span className="min-w-0 truncate">{c.title}</span>
                    <span className="shrink-0 text-caption text-fg-muted">{won(c.amount)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        }
        empty={
          <div className="flex flex-col items-center gap-stack-md py-section-sm text-center">
            <span className="text-body-lg font-semibold">처리할 청구가 없습니다</span>
            <span className="text-body text-fg-muted">새 청구가 올라오면 여기에 차례로 나타납니다.</span>
          </div>
        }
        error={
          <Alert status="danger" title="청구를 불러오지 못했습니다" action={<Button size="sm">다시 시도</Button>}>
            네트워크 연결을 확인한 뒤 다시 시도하세요.
          </Alert>
        }
        loading={
          <div className="flex justify-center py-section-sm">
            <Spinner label="청구를 불러오는 중" />
          </div>
        }
      />

      <Dialog open={rejecting} onOpenChange={(o) => { setRejecting(o); if (!o) setReason(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>‘{current?.title}’ 청구를 반려할까요?</DialogTitle>
            <DialogDescription>반려 사유는 청구자에게 그대로 전달됩니다.</DialogDescription>
          </DialogHeader>
          <Field required>
            <FieldLabel>반려 사유</FieldLabel>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="예: 영수증 금액과 청구 금액이 다릅니다" />
            <FieldDescription>사유를 적어야 반려할 수 있습니다.</FieldDescription>
          </Field>
          <DialogConfirmFooter confirmLabel="반려" onConfirm={reject} confirmDisabled={!reason.trim()} />
        </DialogContent>
      </Dialog>
    </>
  );
}
