import * as React from 'react';
import { GalleryShell } from '@/kit/shells/gallery/shell';
import { DetailShell } from '@/kit/shells/detail/shell';
import { FormShell } from '@/kit/shells/form/shell';
import { useShellState } from '@/kit/shells/_slot';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, Tab, TabsPanel } from '@/components/ui/tabs';
import { Fieldset } from '@/components/ui/fieldset';
import { Field, FieldLabel, Input, Textarea } from '@/components/ui/field';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { useToastManager } from '@/components/ui/toast';
import { SEED, type Template } from './data';

type View = { kind: 'list' } | { kind: 'detail'; id: string } | { kind: 'new' };
const CATS = ['보고', '기록', '신청', '안내', '계획'].map((c) => ({ value: c, label: c }));

export default function Screen() {
  const toast = useToastManager();
  const [items, setItems] = React.useState(SEED);
  const [view, setView] = React.useState<View>({ kind: 'list' });
  const [draft, setDraft] = React.useState({ name: '', category: '보고', summary: '', owner: '', fields: '', note: '' });
  const state = useShellState(items.length === 0 ? 'empty' : 'ready');
  const error = <Alert status="danger" title="템플릿을 불러오지 못했습니다" action={<Button size="sm">다시 시도</Button>}>잠시 뒤 다시 시도하세요.</Alert>;
  const loading = <div className="flex justify-center py-section-sm"><Spinner label="불러오는 중" /></div>;

  if (view.kind === 'detail') {
    const t = items.find((x) => x.id === view.id)!;
    return (
      <DetailShell
        state="ready"
        back={<Button intent="ghost" size="sm" onClick={() => setView({ kind: 'list' })}>‹ 템플릿 목록</Button>}
        title={t.name}
        meta={<span className="flex items-center gap-inline-sm"><Badge status="info">{t.category}</Badge> 수정 {t.updated}</span>}
        actions={<Button intent="primary">이 템플릿으로 쓰기</Button>}
        main={
          <Tabs defaultValue="overview">
            <TabsList><Tab value="overview">개요</Tab><Tab value="history">사용 기록</Tab></TabsList>
            <TabsPanel value="overview"><p className="py-inset-md text-body leading-normal">{t.summary}</p></TabsPanel>
            <TabsPanel value="history"><p className="py-inset-md text-body text-fg-muted">최근 30일 동안 {t.uses}번 쓰였습니다.</p></TabsPanel>
          </Tabs>
        }
        aside={
          <Card><CardContent>
            <dl className="grid grid-cols-[auto_1fr] gap-x-inline-lg gap-y-stack-md text-body">
              <dt className="text-fg-muted">분류</dt><dd>{t.category}</dd>
              <dt className="text-fg-muted">사용</dt><dd>{t.uses}회</dd>
              <dt className="text-fg-muted">수정일</dt><dd>{t.updated}</dd>
            </dl>
          </CardContent></Card>
        }
        empty={<p className="text-body text-fg-muted">템플릿을 찾을 수 없습니다</p>}
        error={error}
        loading={loading}
      />
    );
  }

  if (view.kind === 'new') {
    const create = () => {
      if (!draft.name.trim()) return;
      const t: Template = { id: `n${Date.now()}`, name: draft.name, category: draft.category, uses: 0, updated: '2026-09-29', summary: draft.summary || '새 템플릿' };
      setItems((xs) => [t, ...xs]);
      setView({ kind: 'list' });
      toast.add({ title: `‘${t.name}’ 템플릿을 만들었습니다`, type: 'success' });
    };
    return (
      <FormShell
        state="ready"
        back={<Button intent="ghost" size="sm" onClick={() => setView({ kind: 'list' })}>‹ 템플릿 목록</Button>}
        title="새 템플릿 만들기"
        sections={
          <>
            <Fieldset legend="기본">
              <Field required><FieldLabel>이름</FieldLabel><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
              <Field><FieldLabel>분류</FieldLabel><Select items={CATS} value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: (v as string) ?? '보고' })} /></Field>
              <Field><FieldLabel>요약</FieldLabel><Input value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} /></Field>
            </Fieldset>
            <Fieldset legend="내용">
              <Field><FieldLabel>관리자</FieldLabel><Input value={draft.owner} onChange={(e) => setDraft({ ...draft, owner: e.target.value })} /></Field>
              <Field><FieldLabel>입력 칸 목록</FieldLabel><Textarea value={draft.fields} onChange={(e) => setDraft({ ...draft, fields: e.target.value })} placeholder="한 줄에 하나씩" /></Field>
              <Field><FieldLabel>작성 안내</FieldLabel><Textarea value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} /></Field>
            </Fieldset>
          </>
        }
        footer={<><Button onClick={() => setView({ kind: 'list' })}>취소</Button><Button intent="primary" disabled={!draft.name.trim()} onClick={create}>만들기</Button></>}
        empty={{ 없음: '새로 만들기' }}
        error={error}
        loading={loading}
      />
    );
  }

  return (
    <GalleryShell
      state={state}
      title="업무 템플릿 모음"
      description="자주 쓰는 문서 양식입니다. 눌러서 자세히 보세요."
      actions={<Button intent="primary" onClick={() => setView({ kind: 'new' })}>새 템플릿</Button>}
      items={items.map((t) => (
        <Card key={t.id} className="h-full">
          <CardHeader action={<Badge status="info">{t.category}</Badge>}>
            <CardTitle><a href="#" onClick={(e) => { e.preventDefault(); setView({ kind: 'detail', id: t.id }); }} className="hover:underline">{t.name}</a></CardTitle>
            <CardDescription>{t.summary}</CardDescription>
          </CardHeader>
          <CardFooter><span className="text-caption text-fg-muted">{t.uses}회 사용 · 수정 {t.updated}</span></CardFooter>
        </Card>
      ))}
      footer={<span className="text-caption text-fg-muted">총 {items.length}개</span>}
      empty={<div className="flex flex-col items-center gap-stack-lg py-section-sm"><span className="text-body text-fg-muted">템플릿이 없습니다</span><Button intent="primary" onClick={() => setView({ kind: 'new' })}>새 템플릿</Button></div>}
      error={error}
      loading={loading}
    />
  );
}
