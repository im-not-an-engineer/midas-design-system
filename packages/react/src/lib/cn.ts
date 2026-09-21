/* ax-lint-disable-file — 이 파일의 문자열은 클래스가 아니라 tailwind-merge 테마 키다 */
import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';
import { cssVars } from '@ax/tokens';

/**
 * tailwind-merge에게 우리 계약을 가르친다.
 *
 * 왜 필요한가: tailwind-merge는 "뒤에 온 클래스가 앞을 이긴다"를 구현하려고
 * 클래스를 그룹으로 나눈다. 기본 설정은 Tailwind 기본 테마를 기준으로 하므로
 * 우리가 만든 이름을 모른다. 그래서 `text-body`(글자 크기)와 `text-fg-default`(글자 색)를
 * 같은 그룹으로 오인해 앞의 것을 지워버린다.
 *
 * 이 실패는 린트로 잡을 수 없다. 두 클래스 다 유효하고, 사라지는 건 런타임이기 때문이다.
 * 계약에서 이름 목록을 직접 뽑아 넘기므로, 토큰을 추가해도 여기는 손댈 필요가 없다.
 */
const namesUnder = (prefix: string) =>
  cssVars.filter((v) => v.startsWith(prefix)).map((v) => v.slice(prefix.length));

const twMerge = extendTailwindMerge({
  override: {
    theme: {
      color: namesUnder('--color-'),
      spacing: namesUnder('--spacing-'),
      radius: namesUnder('--radius-'),
      text: namesUnder('--text-'),
      font: namesUnder('--font-').filter((n) => !n.startsWith('weight-')),
      'font-weight': namesUnder('--font-weight-'),
      leading: namesUnder('--leading-'),
      tracking: namesUnder('--tracking-'),
      shadow: namesUnder('--shadow-'),
      ease: namesUnder('--ease-'),
    },
  },
});

/** 클래스 합치기. 뒤에 온 것이 앞을 이긴다. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
