import * as React from 'react';
import { AxTheme } from '@/lib/ax/theme';
import { ToastProvider } from '@/components/ui/toast';
import { AppFrame } from './app-frame';
import type { SideNavGroup } from './side-nav';

/**
 * 시험용 앱 진입점. `src/screens/<id>/index.tsx` 를 모두 찾아 `#/<id>` 주소로 전환한다.
 * 샌드박스의 `src/App.tsx` 는 이 파일을 다시 내보내기만 한다.
 */
const screens = import.meta.glob('../../screens/*/index.tsx', { eager: true }) as Record<string, { default: React.ComponentType }>;

function useHash() {
  const [hash, setHash] = React.useState(() => window.location.hash);
  React.useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash;
}

export default function KitApp() {
  const hash = useHash();
  const list = Object.entries(screens)
    .map(([file, mod]) => ({ id: file.split('/').at(-2) ?? file, Screen: mod.default }))
    .sort((a, b) => a.id.localeCompare(b.id));
  const current = list.find((s) => `#/${s.id}` === hash) ?? list[0];
  const nav: SideNavGroup[] = [
    { label: '시험 화면', items: list.map((s) => ({ label: s.id, href: `#/${s.id}`, current: s === current })) },
  ];
  return (
    <AxTheme archetype="saas" brand="default" mode="light">
      <ToastProvider position="bottom-right">
        <AppFrame product="시험 제품" user={{ name: '김디자' }} nav={nav}>
          {current ? <current.Screen key={current.id} /> : <p className="text-body text-fg-muted">src/screens 에 화면이 없습니다.</p>}
        </AppFrame>
      </ToastProvider>
    </AxTheme>
  );
}
