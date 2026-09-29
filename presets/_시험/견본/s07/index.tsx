import * as React from 'react';
import { ImportShell, type ImportPhase } from '@/kit/shells/import/shell';
import { useShellState } from '@/kit/shells/_slot';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { useToastManager } from '@/components/ui/toast';
import { ROWS, tick } from './data';

export default function Screen() {
  const toast = useToastManager();
  const [phase, setPhase] = React.useState<ImportPhase>('upload');
  const [file, setFile] = React.useState<string | null>(null);
  const [done, setDone] = React.useState<number | null>(null);
  const state = useShellState('ready');
  const ok = ROWS.filter((r) => !r.error);
  const bad = ROWS.filter((r) => r.error);

  const register = async () => {
    for (let i = 0; i <= ok.length; i += 3) { setDone(i); await tick(120); }
    setDone(ok.length);
    await tick(150);
    setPhase('done');
    setDone(null);
    toast.add({ title: `${ok.length}명을 등록했습니다`, description: `오류 ${bad.length}행은 건너뛰었습니다.`, type: 'success' });
  };

  return (
    <ImportShell
      state={state}
      title="직원 일괄 등록"
      description="양식에 맞춘 엑셀 파일을 올리면 검증한 뒤 한꺼번에 등록합니다."
      phase={phase}
      upload={
        <div className="flex flex-col items-center gap-stack-lg rounded-surface border-width-default border-dashed border-border-strong p-inset-xl text-center">
          <p className="text-body">{file ? `고른 파일: ${file}` : '엑셀(.xlsx) 파일을 고르세요'}</p>
          <div className="flex gap-inline-md">
            <Button onClick={() => setFile('직원명단_2026-09.xlsx')}>파일 고르기</Button>
            <Button intent="ghost">양식 받기</Button>
          </div>
        </div>
      }
      review={
        <div className="flex flex-col gap-stack-lg">
          <p className="text-body"><strong>{ok.length}명</strong>은 등록할 수 있고, <strong>{bad.length}행</strong>은 고쳐야 합니다. 오류 행은 건너뜁니다.</p>
          {done != null && <Progress label="등록하는 중" value={done} max={ok.length} showValue />}
          <Table aria-label="검증 결과">
            <TableHead><TableRow><TableHeaderCell numeric>행</TableHeaderCell><TableHeaderCell>이름</TableHeaderCell><TableHeaderCell>이메일</TableHeaderCell><TableHeaderCell>부서</TableHeaderCell><TableHeaderCell>결과</TableHeaderCell></TableRow></TableHead>
            <TableBody>
              {[...bad, ...ok.slice(0, 5)].map((r) => (
                <TableRow key={r.line}>
                  <TableCell numeric>{r.line}</TableCell><TableCell>{r.name}</TableCell><TableCell>{r.email}</TableCell><TableCell>{r.dept || '—'}</TableCell>
                  <TableCell>{r.error ? <Badge status="danger">{r.error}</Badge> : <Badge status="success">정상</Badge>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-caption text-fg-muted">정상 행은 5개만 보입니다 (전체 {ok.length}개).</p>
        </div>
      }
      done={<div className="flex flex-col items-center gap-stack-lg py-section-sm text-center"><span className="text-body-lg font-semibold">등록을 마쳤습니다</span><Button onClick={() => { setPhase('upload'); setFile(null); }}>다른 파일 올리기</Button></div>}
      footer={
        phase === 'upload' ? <Button intent="primary" disabled={!file} onClick={() => setPhase('review')}>검증하기</Button>
        : phase === 'review' ? <><Button onClick={() => { setPhase('upload'); setFile(null); }}>다시 올리기</Button><Button intent="primary" loading={done != null} onClick={register}>{ok.length}명 등록</Button></>
        : undefined
      }
      empty={{ 없음: '올리기부터 시작' }}
      error={<Alert status="danger" title="파일을 읽지 못했습니다" action={<Button size="sm">다시 올리기</Button>}>양식에 맞는 .xlsx 파일인지 확인하세요.</Alert>}
      loading={<div className="flex justify-center py-section-sm"><Spinner label="파일을 검증하는 중" /></div>}
    />
  );
}
