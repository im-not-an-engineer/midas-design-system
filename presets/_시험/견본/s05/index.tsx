import * as React from 'react';
import { SettingsShell, SettingsSection } from '@/kit/shells/settings/shell';
import { useShellState } from '@/kit/shells/_slot';
import { Field, FieldLabel, FieldDescription, FieldError, Input } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { useToastManager } from '@/components/ui/toast';
import { SLUG, SESSIONS, INITIAL } from './data';

export default function Screen() {
  const toast = useToastManager();
  const [s, setS] = React.useState(INITIAL);
  const [slug, setSlug] = React.useState(INITIAL.slug);
  const state = useShellState('ready');
  const slugOk = SLUG.test(slug);

  const flip = (key: 'mail' | 'mention' | 'digest' | 'twoFactor', label: string) => (on: boolean) => {
    setS((x) => ({ ...x, [key]: on }));
    toast.add({ title: `${label}을 ${on ? '켰' : '껐'}습니다` });
  };
  const saveSlug = () => {
    if (!slugOk || slug === s.slug) return;
    setS((x) => ({ ...x, slug }));
    toast.add({ title: `주소를 ax.works/${slug} 로 바꿨습니다` });
  };

  return (
    <SettingsShell
      state={state}
      title="워크스페이스 설정"
      description="바꾸는 즉시 저장됩니다."
      nav={
        <ul className="flex flex-col gap-stack-xs">
          {[['general', '일반'], ['alerts', '알림'], ['security', '보안']].map(([id, label]) => (
            <li key={id}><a href={`#${id}`} onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }} className="flex h-control-md items-center rounded-control px-inset-sm text-body hover:bg-surface-hover">{label}</a></li>
          ))}
        </ul>
      }
      sections={
        <>
          <SettingsSection id="general" title="일반" description="워크스페이스 이름과 주소">
            <Field><FieldLabel>워크스페이스 이름</FieldLabel><Input value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} onBlur={() => toast.add({ title: '이름을 저장했습니다' })} /></Field>
            <Field invalid={!slugOk}>
              <FieldLabel>워크스페이스 주소</FieldLabel>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} onBlur={saveSlug} />
              <FieldDescription>영문 소문자 · 숫자 · 하이픈(-)만, 3~20자. 주소는 ax.works/{slug || '…'} 가 됩니다.</FieldDescription>
              <FieldError match={!slugOk}>규칙에 맞지 않습니다 — {slug.length < 3 || slug.length > 20 ? '3~20자여야 합니다' : '영문 소문자 · 숫자 · 하이픈만 쓸 수 있습니다'}</FieldError>
            </Field>
          </SettingsSection>
          <SettingsSection id="alerts" title="알림" description="어떤 일을 알려 줄지 고릅니다">
            <Switch label="메일 알림" description="나에게 배정된 일이 생기면 메일로 알립니다" checked={s.mail} onCheckedChange={flip('mail', '메일 알림')} />
            <Switch label="멘션 알림" description="누군가 나를 언급하면 알립니다" checked={s.mention} onCheckedChange={flip('mention', '멘션 알림')} />
            <Switch label="주간 요약 메일" checked={s.digest} onCheckedChange={flip('digest', '주간 요약 메일')} />
          </SettingsSection>
          <SettingsSection id="security" title="보안">
            <Switch label="2단계 인증 요구" description="모든 구성원이 로그인할 때 2단계 인증을 거칩니다" checked={s.twoFactor} onCheckedChange={flip('twoFactor', '2단계 인증 요구')} />
            <Field className="w-[200px]"><FieldLabel>세션 만료</FieldLabel><Select items={SESSIONS} value={s.session} onValueChange={(v) => { setS({ ...s, session: (v as string) ?? '8' }); toast.add({ title: '세션 만료를 바꿨습니다' }); }} /></Field>
          </SettingsSection>
        </>
      }
      empty={{ 없음: '설정은 늘 한 벌 있다' }}
      error={<Alert status="danger" title="설정을 불러오지 못했습니다" action={<Button size="sm">다시 시도</Button>}>잠시 뒤 다시 시도하세요.</Alert>}
      loading={<div className="flex justify-center py-section-sm"><Spinner label="불러오는 중" /></div>}
    />
  );
}
