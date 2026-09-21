import * as React from 'react';
import type { Archetype, Brand, Mode } from '@ax/tokens';

export interface ThemeProps {
  /**
   * 문법 아키타입. 제품이 한 번 고르고 끝난다.
   * 밀도·간격·모서리·글자 크기가 통째로 따라온다.
   */
  archetype?: Archetype;
  /** 브랜드. 색과 글꼴만 바꾼다. */
  brand?: Brand;
  /**
   * 라이트/다크. 이건 제품이 고르는 게 아니라 런타임에 바뀐다.
   * 생략하면 사용자 OS 설정을 따른다.
   */
  mode?: Mode;
}

interface ThemeContextValue extends ThemeProps {
  /**
   * 포털(다이얼로그·메뉴·툴팁)이 렌더링될 DOM 노드.
   *
   * 왜 필요한가: Radix의 Portal은 기본적으로 document.body에 붙는다. 그러면 테마
   * 어트리뷰트가 달린 div '바깥'이라 CSS 변수를 못 받고, 페이지는 다크인데
   * 다이얼로그만 라이트로 뜬다. 아키타입·브랜드도 똑같이 새어나간다.
   * 그래서 AxTheme가 자기 노드를 여기에 등록하고, 오버레이는 그 안으로 들어간다.
   */
  portalContainer: HTMLElement | null;
}

const ThemeContext = React.createContext<ThemeContextValue>({ portalContainer: null });

export const useTheme = () => React.useContext(ThemeContext);

/** 오버레이 컴포넌트가 포털 컨테이너를 얻을 때 쓴다. null이면 Radix 기본값(body). */
export const usePortalContainer = () => React.useContext(ThemeContext).portalContainer;

/**
 * 테마를 DOM 어트리뷰트로 내려보낸다. 재렌더링 없이 CSS만 바뀐다.
 *
 * 보통은 앱 최상단에 한 번 두지만, 중첩해서 화면 일부만 다른 아키타입으로
 * 둘 수도 있다 (예: consumer 앱 안의 관리자 패널만 workbench).
 */
export function AxTheme({
  archetype,
  brand,
  mode,
  children,
  ...rest
}: ThemeProps & { children?: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  const parent = useTheme();
  // ref가 아니라 state로 잡는다 — 첫 렌더에서 노드가 없으면 포털이 body로 새기 때문에,
  // 노드가 붙은 뒤 한 번 더 렌더링되어야 한다.
  const [node, setNode] = React.useState<HTMLDivElement | null>(null);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      archetype: archetype ?? parent.archetype,
      brand: brand ?? parent.brand,
      mode: mode ?? parent.mode,
      portalContainer: node,
    }),
    [archetype, brand, mode, node, parent.archetype, parent.brand, parent.mode],
  );

  return (
    <ThemeContext.Provider value={value}>
      <div
        ref={setNode}
        data-archetype={value.archetype}
        data-brand={value.brand}
        data-mode={value.mode}
        {...rest}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

/**
 * <html>에 직접 어트리뷰트를 붙이고 싶을 때 쓰는 헬퍼.
 * SSR에서 첫 페인트 깜빡임을 막고, 페이지 여백·오버스크롤 영역까지 테마를 입힌다.
 */
export function themeAttributes({ archetype, brand, mode }: ThemeProps) {
  return {
    ...(archetype ? { 'data-archetype': archetype } : {}),
    ...(brand ? { 'data-brand': brand } : {}),
    ...(mode ? { 'data-mode': mode } : {}),
  };
}
