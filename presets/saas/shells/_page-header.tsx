import * as React from 'react';

/** 셸들이 같이 쓰는 제목 줄. 왼쪽 = 제목·설명, 오른쪽 = 화면 전체에 대한 동작. */
export function PageHeader({ title, description, actions, aside }: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** 제목 옆 보조 정보 (진행 상황 등) */
  aside?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-inline-lg">
      <div className="flex min-w-0 flex-col gap-stack-sm">
        <div className="flex items-center gap-inline-md">
          <h1 className="text-heading-md font-semibold leading-tight tracking-heading text-fg-default">{title}</h1>
          {aside}
        </div>
        {description && <p className="text-body leading-normal text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-inline-md">{actions}</div>}
    </header>
  );
}

/** 바닥 면 위에 놓이는 흰 면. 셸들이 같이 쓴다. */
export const SURFACE = 'rounded-surface border-width-default border-solid border-border-default bg-surface-base';

/** 뒤로 가기 한 줄 (상세·폼 위) */
export function BackLink({ children }: { children: React.ReactNode }) {
  return <div className="text-body text-fg-muted">{children}</div>;
}
