import * as React from 'react';
import {
  Button, Field, FieldLabel, FieldDescription, FieldError, Input, Textarea,
  Checkbox, CheckboxGroup, Radio, RadioGroup, Switch, Select, Combobox, Autocomplete, NumberField, Slider, OTPField, Fieldset,
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogConfirmFooter,
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogConfirmFooter,
  Drawer, DrawerTrigger, DrawerContent, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose,
  ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator,
  Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription,
  Tooltip, TooltipProvider, PreviewCard, PreviewCardTrigger, PreviewCardContent,
  Menu, MenuTrigger, MenuContent, MenuGroup, MenuItem, MenuSeparator,
  Tabs, TabsList, Tab, TabsPanel, Accordion, AccordionItem, Collapsible, CollapsibleTrigger, CollapsiblePanel,
  Menubar, MenubarTrigger, Toolbar, ToolbarGroup, ToolbarButton, ToolbarSeparator, Toggle, ToggleGroup,
  ScrollArea, Separator, Avatar, AvatarGroup, Progress, Meter,
  Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell,
} from '@ax/react';

/**
 * 테마 랩의 왼쪽 — 전 컴포넌트를 한 화면에.
 *
 * 목적은 데모가 아니라 '한꺼번에 보기'다. 색을 하나 바꿨을 때 어디가 같이 움직이고
 * 어디가 안 움직이는지, 대비가 깨지는 곳은 없는지를 스크롤 한 번으로 판단한다.
 * 그래서 상태(비활성·검증실패·선택됨)와 위계(주·보조·파괴적)를 일부러 촘촘히 깔았다.
 */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-stack-sm">
      <h3 className="text-caption font-semibold tracking-heading text-fg-subtle">{title}</h3>
      <div className="flex flex-wrap items-start gap-inline-lg gap-y-stack-md">{children}</div>
    </section>
  );
}

const STATUS = [
  { value: 'todo', label: '대기' }, { value: 'doing', label: '진행' },
  { value: 'done', label: '완료' }, { value: 'hold', label: '보류', disabled: true },
];
const PEOPLE = ['양희윤', '김민준', '이서연', '박도윤'].map((n, i) => ({ value: `u${i}`, label: n }));

/** 클래스를 보간으로 만들면 Tailwind가 생성하지 못한다 — 이 저장소의 규약대로 룩업 맵으로 적는다. */
const BADGE = {
  info: 'bg-status-info-subtle text-status-info-fg border-status-info-border',
  success: 'bg-status-success-subtle text-status-success-fg border-status-success-border',
  warning: 'bg-status-warning-subtle text-status-warning-fg border-status-warning-border',
  danger: 'bg-status-danger-subtle text-status-danger-fg border-status-danger-border',
};

export function Gallery() {
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-section-md">
        <Section title="Button — 위계와 상태">
          {(['primary', 'secondary', 'ghost', 'destructive'] as const).map((intent) => (
            <div key={intent} className="flex items-center gap-inline-sm">
              {(['sm', 'md', 'lg'] as const).map((size) => <Button key={size} intent={intent} size={size}>저장</Button>)}
              <Button intent={intent} disabled>비활성</Button>
            </div>
          ))}
        </Section>

        <Section title="선택 컨트롤">
          <div className="flex flex-col gap-stack-sm">
            <Checkbox label="체크" defaultChecked /><Checkbox label="일부" indeterminate /><Checkbox label="비활성" disabled />
          </div>
          <RadioGroup defaultValue="b" label="라디오">
            <Radio value="a" label="미선택" /><Radio value="b" label="선택" /><Radio value="c" label="비활성" disabled />
          </RadioGroup>
          <div className="flex flex-col gap-stack-sm">
            <Switch label="켜짐" defaultChecked /><Switch label="꺼짐" /><Switch label="비활성" disabled />
          </div>
          <ToggleGroup defaultValue={['list']} aria-label="보기">
            <Toggle value="list" size="sm">목록</Toggle><Toggle value="board" size="sm">보드</Toggle>
          </ToggleGroup>
          <Toggle defaultPressed>단독 토글</Toggle>
        </Section>

        <Section title="입력 — 정상 · 검증 실패 · 비활성">
          <Field className="w-[220px]" required><FieldLabel>제목</FieldLabel><Input placeholder="한 줄 요약" /><FieldDescription>목록에 그대로 보입니다.</FieldDescription></Field>
          <Field className="w-[220px]" invalid><FieldLabel>담당자</FieldLabel><Input defaultValue="없는사람" /><FieldError match>존재하지 않는 계정입니다.</FieldError></Field>
          <Field className="w-[220px]" disabled><FieldLabel>비활성</FieldLabel><Input defaultValue="수정 불가" /></Field>
          <div className="flex w-[220px] flex-col gap-stack-sm">
            <Select items={STATUS} defaultValue="doing" /><Combobox items={PEOPLE} defaultValue={PEOPLE[0]} /><Autocomplete items={['버그', '기능']} placeholder="태그" />
          </div>
          <div className="flex w-[220px] flex-col gap-stack-sm">
            <NumberField defaultValue={3} min={0} max={20} /><Slider defaultValue={40} showValue /><OTPField length={4} />
          </div>
          <Field className="w-[220px]"><FieldLabel>메모</FieldLabel><Textarea rows={2} placeholder="내용" /></Field>
        </Section>

        <Section title="오버레이">
          {/* 모달(Dialog·AlertDialog·Drawer)은 백드롭이 화면을 덮어 갤러리를 가린다.
              그래서 열어두지 않고 버튼으로 연다. 비모달(Menu·Popover·Tooltip·PreviewCard)은
              트리거 옆에 뜨므로 열어둔 채로 색을 조정할 수 있다. */}
          <Dialog>
            <DialogTrigger render={<Button />}>다이얼로그</DialogTrigger>
            <DialogContent width="sm">
              <DialogHeader><DialogTitle>저장할까요?</DialogTitle><DialogDescription>되돌릴 수 없습니다.</DialogDescription></DialogHeader>
              <DialogConfirmFooter confirmLabel="저장" />
            </DialogContent>
          </Dialog>
          <AlertDialog>
            <AlertDialogTrigger render={<Button intent="destructive" />}>경고 다이얼로그</AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>삭제할까요?</AlertDialogTitle><AlertDialogDescription>이슈 128건이 사라집니다.</AlertDialogDescription>
              <AlertDialogConfirmFooter confirmLabel="영구 삭제" />
            </AlertDialogContent>
          </AlertDialog>
          <Drawer side="right">
            <DrawerTrigger render={<Button />}>드로어</DrawerTrigger>
            <DrawerContent>
              <DrawerTitle>ISSUE-241</DrawerTitle>
              <DrawerDescription>토큰 계약 위반 린트 추가</DrawerDescription>
              <Field><FieldLabel>담당자</FieldLabel><Input defaultValue="양희윤" /></Field>
              <DrawerFooter><DrawerClose render={<Button intent="secondary" />}>닫기</DrawerClose><Button intent="primary">저장</Button></DrawerFooter>
            </DrawerContent>
          </Drawer>
          <ContextMenu>
            <ContextMenuTrigger className="flex h-control-lg items-center rounded-control border border-dashed border-border-strong px-inset-md text-caption text-fg-muted select-none">
              우클릭 영역
            </ContextMenuTrigger>
            <ContextMenuContent><ContextMenuItem>열기</ContextMenuItem><ContextMenuSeparator /><ContextMenuItem destructive>삭제</ContextMenuItem></ContextMenuContent>
          </ContextMenu>
        </Section>

        <Section title="오버레이 — 열어둔 채로 보는 것">
          {/* 팝업이 트리거 아래로 뜨므로 각자 자리를 확보해 서로 가리지 않게 한다.
              Menu는 modal 기본값이 true라 열어두면 바깥(편집 패널 포함)의 포인터 입력이
              전부 막힌다 — 여기서는 '보기용'으로 열어두는 것이므로 반드시 꺼야 한다. */}
          <div className="flex h-[160px] w-[200px] flex-col">
            <Menu open modal={false}><MenuTrigger render={<Button />}>메뉴</MenuTrigger>
              <MenuContent align="start"><MenuGroup label="이슈"><MenuItem>이름 바꾸기</MenuItem><MenuItem disabled>보관</MenuItem></MenuGroup><MenuSeparator /><MenuItem destructive>삭제</MenuItem></MenuContent>
            </Menu>
          </div>
          <div className="flex h-[160px] w-[240px] flex-col">
            <Popover open><PopoverTrigger render={<Button />}>팝오버</PopoverTrigger>
              <PopoverContent side="bottom" align="start"><PopoverTitle>필터</PopoverTitle><PopoverDescription>고른 상태만 보입니다.</PopoverDescription></PopoverContent>
            </Popover>
          </div>
          <div className="flex h-[160px] w-[200px] flex-col items-start justify-end">
            <Tooltip content="어두운 면 위의 글자" open><Button intent="ghost">툴팁</Button></Tooltip>
          </div>
          <div className="flex h-[160px] w-[280px] flex-col">
            <PreviewCard open><PreviewCardTrigger href="#">@양희윤</PreviewCardTrigger>
              <PreviewCardContent><div className="flex items-center gap-inline-sm"><Avatar size="sm" name="양희윤" /><span className="text-body">양희윤 · 디자이너</span></div></PreviewCardContent>
            </PreviewCard>
          </div>
        </Section>

        <Section title="내비 · 레이아웃">
          <Tabs defaultValue="a" className="w-[300px]">
            <TabsList><Tab value="a">개요</Tab><Tab value="b">이슈</Tab><Tab value="c" disabled>결제</Tab></TabsList>
            <TabsPanel value="a">탭 내용</TabsPanel>
          </Tabs>
          <Accordion defaultValue={['x']} className="w-[300px]">
            <AccordionItem value="x" title="펼쳐진 항목">내용이 보입니다.</AccordionItem>
            <AccordionItem value="y" title="접힌 항목">숨김</AccordionItem>
          </Accordion>
          <Collapsible defaultOpen><CollapsibleTrigger render={<Button intent="ghost" size="sm" />}>고급 옵션</CollapsibleTrigger><CollapsiblePanel><p className="text-body text-fg-muted">열린 패널</p></CollapsiblePanel></Collapsible>
          <Menubar><Menu><MenubarTrigger>파일</MenubarTrigger><MenuContent align="start"><MenuItem>새로</MenuItem></MenuContent></Menu><Menu><MenubarTrigger>편집</MenubarTrigger><MenuContent align="start"><MenuItem>실행 취소</MenuItem></MenuContent></Menu></Menubar>
          <Toolbar aria-label="도구"><ToolbarGroup><ToolbarButton><b>B</b></ToolbarButton><ToolbarButton><i>I</i></ToolbarButton></ToolbarGroup><ToolbarSeparator /><ToolbarButton>정렬</ToolbarButton></Toolbar>
          <ScrollArea className="h-[110px] w-[220px] rounded-surface border border-solid border-border-default">
            <ul className="flex flex-col p-inset-sm">{Array.from({ length: 10 }, (_, i) => <li key={i} className="flex h-row-sm items-center px-inset-sm text-body">ISSUE-{240 - i}</li>)}</ul>
          </ScrollArea>
          <div className="flex w-[220px] flex-col gap-stack-sm text-body"><span>위</span><Separator label="또는" /><span>아래</span></div>
        </Section>

        <Section title="표시 · 상태">
          <div className="flex items-center gap-inline-md">
            {(['xs', 'sm', 'md', 'lg'] as const).map((s) => <Avatar key={s} size={s} name="양희윤" />)}
            <AvatarGroup><Avatar size="sm" name="김민준" /><Avatar size="sm" name="이서연" /><Avatar size="sm">+4</Avatar></AvatarGroup>
          </div>
          <div className="flex w-[260px] flex-col gap-stack-md">
            <Progress value={62} label="내보내기" showValue />
            <Meter value={32} label="저장 공간" showValue />
            <Meter value={78} label="경고 임계" showValue status="warning" />
            <Meter value={96} label="위험 임계" showValue status="danger" />
            <Meter value={40} label="정상" showValue status="success" />
          </div>
          <div className="flex flex-wrap gap-inline-sm">
            {Object.entries(BADGE).map(([s, cls]) => (
              <span key={s} className={`inline-flex items-center rounded-pill border border-solid px-inset-sm py-inset-xs text-caption font-medium ${cls}`}>{s}</span>
            ))}
          </div>
        </Section>

        <Section title="데이터 테이블 — 밀도의 얼굴">
          <Table className="w-[560px]">
            <TableHead><TableRow><TableHeaderCell>ID</TableHeaderCell><TableHeaderCell>제목</TableHeaderCell><TableHeaderCell>담당</TableHeaderCell><TableHeaderCell numeric>댓글</TableHeaderCell></TableRow></TableHead>
            <TableBody>
              <TableRow interactive><TableCell className="text-fg-muted">ISSUE-241</TableCell><TableCell>토큰 계약 위반 린트</TableCell><TableCell>양희윤</TableCell><TableCell numeric>12</TableCell></TableRow>
              <TableRow interactive selected><TableCell className="text-fg-muted">ISSUE-238</TableCell><TableCell>선택된 행</TableCell><TableCell>미정</TableCell><TableCell numeric>3</TableCell></TableRow>
              <TableRow interactive><TableCell className="text-fg-muted">ISSUE-233</TableCell><TableCell>행 높이 검토</TableCell><TableCell>양희윤</TableCell><TableCell numeric>48</TableCell></TableRow>
            </TableBody>
          </Table>
          <Fieldset legend="폼 섹션" description="Fieldset + Field로 짓는 골격">
            <Field className="w-[240px]"><FieldLabel>이름</FieldLabel><Input defaultValue="디자인시스템" /></Field>
            <CheckboxGroup label="알림"><Checkbox value="a" label="배정될 때" defaultChecked /><Checkbox value="b" label="댓글" /></CheckboxGroup>
          </Fieldset>
        </Section>
      </div>
    </TooltipProvider>
  );
}
