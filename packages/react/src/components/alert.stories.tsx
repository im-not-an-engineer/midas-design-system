import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from './alert';
import { Button } from './button';

const meta = {
  title: '컴포넌트/표시/Alert',
  component: Alert,
  args: { status: 'info', title: '토큰 계약이 바뀌었습니다', children: '다음 배포부터 테두리 두께 유틸리티의 이름이 달라집니다.' },
  argTypes: { status: { control: 'radio', options: ['info', 'success', 'warning', 'danger'] } },
  decorators: [(Story) => <div className="w-[520px]"><Story /></div>],
} satisfies Meta<typeof Alert>;
export default meta;
type Story = StoryObj<typeof meta>;

export const 기본: Story = {};

export const 네가지: Story = {
  render: () => (
    <div className="flex flex-col gap-stack-lg">
      <Alert status="info" title="새 버전이 있습니다">1.4.0 부터 탭에 배지를 붙일 수 있습니다.</Alert>
      <Alert status="success" title="저장했습니다">방금 바꾼 값이 모든 화면에 반영됐습니다.</Alert>
      <Alert status="warning" title="저장 공간이 얼마 남지 않았습니다">96% 를 썼습니다. 오래된 결과 파일을 지우세요.</Alert>
      <Alert status="danger" title="불러오지 못했습니다">모델 파일이 손상됐습니다. 마지막 자동 저장본으로 여시겠어요?</Alert>
    </div>
  ),
};

/** 제목 없이 한 줄만. 짧은 안내에는 이쪽이 조용하다. */
export const 한줄: Story = {
  render: () => (
    <div className="flex flex-col gap-stack-lg">
      <Alert status="info">읽기 전용으로 열렸습니다. 편집하려면 잠금을 푸세요.</Alert>
      <Alert status="warning" icon={null}>그림 없이도 됩니다 — <code className="font-mono text-caption">icon={'{null}'}</code></Alert>
    </div>
  ),
};

/** 버튼은 action 으로 준다. 밖에서 감싸면 그림 너비만큼의 들여쓰기가 어긋난다. */
export const 동작포함: Story = {
  render: () => (
    <Alert
      status="danger"
      title="불러오지 못했습니다"
      action={<><Button size="sm" intent="primary">자동 저장본 열기</Button><Button size="sm">그냥 두기</Button></>}
    >
      모델 파일이 손상됐습니다.
    </Alert>
  ),
};

export const 닫기: Story = {
  render: function 닫기() {
    const [보임, 보이기] = React.useState(true);
    return boim(보임, 보이기);
  },
};

function boim(보임: boolean, 보이기: (v: boolean) => void) {
  if (!보임) return <Button size="sm" onClick={() => 보이기(true)}>다시 띄우기</Button>;
  return (
    <Alert status="success" title="내보내기가 끝났습니다" onClose={() => 보이기(false)}>
      results-2026-09-28.csv 를 내려받았습니다.
    </Alert>
  );
}
