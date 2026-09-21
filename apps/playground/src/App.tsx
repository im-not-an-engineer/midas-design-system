import { useState } from 'react';
import {
  AxTheme, Button, Field, FieldLabel, FieldDescription, FieldError, Input, Textarea,
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogConfirmFooter,
  Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator, MenuGroup,
  Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, TableEmpty,
  type ThemeProps,
} from '@ax/react';

/**
 * 이 화면의 목적은 예쁜 데모가 아니라 한 가지 질문에 답하는 것이다:
 * 위 스위치로 아키타입을 바꿨을 때, 아래 모든 부품이 같이 움직이는가?
 */

const ROWS = [
  { id: 'ISSUE-241', title: '토큰 계약 위반 린트 추가', owner: '양희윤', status: '진행', amount: 12 },
  { id: 'ISSUE-238', title: '다이얼로그 포커스 복귀 버그', owner: '미정', status: '대기', amount: 3 },
  { id: 'ISSUE-233', title: 'workbench 아키타입 행 높이 검토', owner: '양희윤', status: '완료', amount: 48 },
];

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-stack-sm">
      <h2 className="text-heading-sm font-semibold leading-tight tracking-heading text-fg-default">{title}</h2>
      {children}
    </section>
  );
}

export default function App() {
  const [theme, setTheme] = useState<ThemeProps>({ archetype: 'base', brand: 'default', mode: 'light' });
  const [selected, setSelected] = useState<string | null>('ISSUE-238');
  const [empty, setEmpty] = useState(false);
  const [value, setValue] = useState('');

  const Switcher = ({ label, options, current, onPick }: { label: string; options: string[]; current?: string; onPick: (v: string) => void }) => (
    <div className="flex items-center gap-inline-sm">
      <span className="text-caption text-fg-muted">{label}</span>
      {options.map((o) => (
        <Button key={o} size="sm" intent={current === o ? 'primary' : 'secondary'} onClick={() => onPick(o)}>
          {o}
        </Button>
      ))}
    </div>
  );

  return (
    <AxTheme {...theme} className="min-h-screen bg-surface-base text-fg-default font-sans">
      {/* 컨트롤 바 — 이것 자체도 같은 토큰을 쓴다 */}
      <div className="sticky top-0 z-sticky flex flex-wrap items-center gap-inline-lg border-b border-solid border-border-default bg-surface-raised px-inset-lg py-inset-sm">
        <Switcher label="아키타입" options={['base', 'workbench', 'consumer']} current={theme.archetype} onPick={(v) => setTheme((t) => ({ ...t, archetype: v as never }))} />
        <Switcher label="브랜드" options={['default', 'vivid', 'mono']} current={theme.brand} onPick={(v) => setTheme((t) => ({ ...t, brand: v as never }))} />
        <Switcher label="모드" options={['light', 'dark']} current={theme.mode} onPick={(v) => setTheme((t) => ({ ...t, mode: v as never }))} />
      </div>

      <main className="flex flex-col gap-section-md p-inset-xl">
        <Panel title="Button — intent × size">
          <div className="flex flex-col gap-stack-sm">
            {(['primary', 'secondary', 'ghost', 'destructive'] as const).map((intent) => (
              <div key={intent} className="flex flex-wrap items-center gap-inline-md">
                <span className="w-[88px] text-caption text-fg-muted">{intent}</span>
                {(['sm', 'md', 'lg'] as const).map((size) => (
                  <Button key={size} intent={intent} size={size}>저장</Button>
                ))}
                <Button intent={intent} disabled>비활성</Button>
                <Button intent={intent} iconOnly aria-label="더보기"><span>⋯</span></Button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Field — 레이블·설명·에러 연결까지 컴포넌트가 책임진다">
          <div className="flex flex-wrap gap-inline-lg">
            <Field className="w-[280px]" required>
              <FieldLabel>이슈 제목</FieldLabel>
              <Input placeholder="한 줄로 요약하세요" value={value} onChange={(e) => setValue(e.target.value)} />
              <FieldDescription>목록에 이 텍스트가 그대로 보입니다.</FieldDescription>
            </Field>
            <Field className="w-[280px]" invalid>
              <FieldLabel>담당자</FieldLabel>
              <Input defaultValue="없는사람" />
              <FieldError match>존재하지 않는 계정입니다.</FieldError>
            </Field>
            <Field className="w-[280px]" disabled>
              <FieldLabel>보관 사유</FieldLabel>
              <Textarea placeholder="보관된 이슈만 입력할 수 있습니다" />
            </Field>
          </div>
        </Panel>

        <Panel title="Dialog + Menu — 오버레이도 같은 밀도를 따른다">
          <div className="flex items-center gap-inline-md">
            <Dialog>
              <DialogTrigger render={<Button intent="secondary" />}>다이얼로그 열기</DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>이슈 3건을 삭제할까요?</DialogTitle>
                  <DialogDescription>되돌릴 수 없습니다. 연결된 댓글도 함께 삭제됩니다.</DialogDescription>
                </DialogHeader>
                <DialogConfirmFooter intent="destructive" confirmLabel="삭제" />
              </DialogContent>
            </Dialog>

            <Menu>
              <MenuTrigger render={<Button intent="secondary" />}>메뉴 열기</MenuTrigger>
              <MenuContent align="start">
                <MenuGroup label="이슈">
                  <MenuItem>이름 바꾸기</MenuItem>
                  <MenuItem>복제</MenuItem>
                  <MenuItem disabled>보관 (권한 없음)</MenuItem>
                </MenuGroup>
                <MenuSeparator />
                <MenuItem destructive>삭제</MenuItem>
              </MenuContent>
            </Menu>

            <Button intent="ghost" size="sm" onClick={() => setEmpty((v) => !v)}>
              {empty ? '데이터 채우기' : '빈 상태 보기'}
            </Button>
          </div>
        </Panel>

        <Panel title="Table — 행 높이가 아키타입의 얼굴">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>ID</TableHeaderCell>
                <TableHeaderCell>제목</TableHeaderCell>
                <TableHeaderCell>담당</TableHeaderCell>
                <TableHeaderCell>상태</TableHeaderCell>
                <TableHeaderCell numeric>댓글</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {empty ? (
                <TableEmpty colSpan={5} action={<Button size="sm" intent="primary">이슈 만들기</Button>}>
                  조건에 맞는 이슈가 없습니다
                </TableEmpty>
              ) : (
                ROWS.map((r) => (
                  <TableRow key={r.id} interactive selected={selected === r.id} onClick={() => setSelected(r.id)}>
                    <TableCell className="text-fg-muted">{r.id}</TableCell>
                    <TableCell>{r.title}</TableCell>
                    <TableCell>{r.owner}</TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell numeric>{r.amount}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Panel>
      </main>
    </AxTheme>
  );
}
