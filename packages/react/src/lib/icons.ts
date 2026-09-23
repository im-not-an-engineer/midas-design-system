/**
 * 아이콘 진입점. 컴포넌트는 반드시 이 파일을 거친다 — `lucide-react`를 직접 import하지 않는다.
 *
 * 세트는 lucide 하나다. 컴포넌트가 직접 import하면 세트를 바꾸는 순간 전 파일을 찾아
 * 고쳐야 하고, 이름이 1:1로 대응하지 않는 아이콘에서 반드시 어긋난다. 그래서 이름을
 * 여기서 한 번만 잇는다.
 *
 * **프리셋별로 세트를 다르게 쓰게 되면 이 파일에서 매핑한다.** 예를 들어 consumer는
 * 굵은 세트, workbench는 가는 세트로 가기로 하면 여기서 고르고, 컴포넌트 쪽
 * `import { ChevronDown } from '../lib/icons'` 는 그대로 둔다.
 *
 * 굵기와 크기는 여기서 정하지 않는다. 굵기는 lucide 기본값(2)을 그대로 쓰고, 크기는
 * 쓰는 쪽에서 계약 클래스(`size-icon-sm/md/lg`)로 준다 — 컴포넌트가 `size` prop이나
 * width·height를 직접 주면 아키타입을 바꿔도 아이콘만 안 따라온다.
 */
// 한 줄로 쓴다 — 계약 린트는 한 줄짜리 import/export 만 걷어내므로, 여러 줄로 쪼개면
// 'lucide-react' 가 클래스 후보로 새어 들어가 빌드가 막힌다.
export { AlignCenter, AlignLeft, Archive, Check, ChevronDown, ChevronRight, CircleSmall, Ellipsis, Minus, Plus, X } from 'lucide-react';
