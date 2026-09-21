import type { Meta, StoryObj } from '@storybook/react-vite';
import { Accordion, AccordionItem } from './accordion';

const meta = { title: '컴포넌트/내비/Accordion', component: Accordion, decorators: [(Story) => <div className="w-[480px]"><Story /></div>] } satisfies Meta<typeof Accordion>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 기본: Story = {
  render: () => (
    <Accordion defaultValue={['tokens']}>
      <AccordionItem value="tokens" title="토큰은 왜 3층인가요?">2층이 계약이라서입니다. 컴포넌트는 2층 이름만 보고, 브랜드는 램프만 갈아끼웁니다.</AccordionItem>
      <AccordionItem value="archetype" title="아키타입과 브랜드의 차이는?">아키타입은 치수(밀도·간격·모서리), 브랜드는 색입니다. 둘은 같은 키를 건드리지 않습니다.</AccordionItem>
      <AccordionItem value="lint" title="계약 린트는 무엇을 잡나요?">계약에 없는 Tailwind 클래스를. Tailwind는 모르는 클래스를 조용히 무시하므로 빌드에서 막습니다.</AccordionItem>
      <AccordionItem value="disabled" title="비활성 항목" disabled>열리지 않습니다.</AccordionItem>
    </Accordion>
  ),
};

export const 여러개열기: Story = {
  render: () => (
    <Accordion multiple defaultValue={['a', 'b']}>
      <AccordionItem value="a" title="첫째">동시에 여러 개가 열립니다.</AccordionItem>
      <AccordionItem value="b" title="둘째">multiple 옵션.</AccordionItem>
      <AccordionItem value="c" title="셋째">닫힌 상태로 시작.</AccordionItem>
    </Accordion>
  ),
};
