import * as React from 'react';
import { FreeShell } from '@/kit/shells/free/shell';
import { useShellState } from '@/kit/shells/_slot';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogConfirmFooter } from '@/components/ui/dialog';
import { Field, FieldLabel, Input } from '@/components/ui/field';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { useToastManager } from '@/components/ui/toast';
import { DAYS, HOURS, ROOMS, SEED, type Booking } from './data';

export default function Screen() {
  const toast = useToastManager();
  const [room, setRoom] = React.useState('a');
  const [items, setItems] = React.useState(SEED);
  const [slot, setSlot] = React.useState<{ day: string; hour: number } | null>(null);
  const [title, setTitle] = React.useState('');
  const state = useShellState('ready');
  const at = (day: string, hour: number) => items.find((b) => b.day === day && b.hour === hour);
  const book = () => {
    if (!slot || !title.trim()) return;
    const b: Booking = { ...slot, title: title.trim(), who: '김디자' };
    setItems((xs) => [...xs, b]);
    setSlot(null);
    setTitle('');
    toast.add({ title: `${b.day} ${b.hour}시 ‘${b.title}’을 예약했습니다`, type: 'success' });
  };
  return (
    <>
      <FreeShell
        state={state}
        title="회의실 예약"
        description="빈 칸을 눌러 바로 예약합니다."
        lead={<Field className="w-[240px]"><FieldLabel>회의실</FieldLabel><Select items={ROOMS} value={room} onValueChange={(v) => setRoom((v as string) ?? 'a')} /></Field>}
        body={
          <Table aria-label="주간 시간표" divided>
            <TableHead><TableRow><TableHeaderCell className="w-[72px]">시간</TableHeaderCell>{DAYS.map((d) => <TableHeaderCell key={d}>{d}</TableHeaderCell>)}</TableRow></TableHead>
            <TableBody>
              {HOURS.map((h) => (
                <TableRow key={h}>
                  <TableCell className="text-fg-muted">{h}:00</TableCell>
                  {DAYS.map((d) => {
                    const b = at(d, h);
                    return (
                      <TableCell key={d}>
                        {b ? (
                          <span className="flex flex-col rounded-control bg-surface-selected px-inset-sm py-inset-xs"><span className="font-medium">{b.title}</span><span className="text-caption text-fg-muted">{b.who}</span></span>
                        ) : (
                          <Button intent="ghost" size="sm" fullWidth aria-label={`${d} ${h}시 예약`} onClick={() => setSlot({ day: d, hour: h })}>+</Button>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        }
        side={
          <Card>
            <CardHeader><CardTitle>이번 주 내 예약</CardTitle></CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-stack-sm">{items.filter((b) => b.who === '김디자').map((b) => <li key={`${b.day}${b.hour}`} className="text-body">{b.day} {b.hour}:00 · {b.title}</li>)}</ul>
              {!items.some((b) => b.who === '김디자') && <p className="text-caption text-fg-muted">아직 예약이 없습니다</p>}
            </CardContent>
          </Card>
        }
        empty={<p className="py-section-sm text-center text-body text-fg-muted">이번 주 예약이 없습니다</p>}
        error={<Alert status="danger" title="시간표를 불러오지 못했습니다" action={<Button size="sm">다시 시도</Button>}>잠시 뒤 다시 시도하세요.</Alert>}
        loading={<div className="flex justify-center py-section-sm"><Spinner label="시간표를 불러오는 중" /></div>}
      />
      <Dialog open={slot != null} onOpenChange={(o) => { if (!o) setSlot(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>회의실 예약 — {slot?.day} {slot?.hour}:00</DialogTitle></DialogHeader>
          <Field required><FieldLabel>제목</FieldLabel><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
          <DialogConfirmFooter confirmLabel="예약" confirmDisabled={!title.trim()} onConfirm={book} />
        </DialogContent>
      </Dialog>
    </>
  );
}
