# reverse-destiny

질문으로 운세 명식을 역으로 맞추는 보드게임

> Source code is publicly available for portfolio and review purposes.
>
> Unless otherwise stated, no license is granted to copy, modify, redistribute, or commercially use this project.
> 
> Copyright © 2026 <copyright holder>. All rights reserved.

- 포트폴리오를 목적으로 합니다.

## 개발 환경

Bun과 Vite 기반의 React + TypeScript 프로젝트입니다.

로컬 API 개발은 [별도 API 서버와 Vite 프록시를 사용하는 방식](docs/ADR/2026-09-08-003-local-api-vite-proxy.md)으로 진행합니다. 현재는 방식만 결정했으며, API 서버와 프록시 설정은 아직 구현하지 않았습니다.

## 설치 및 실행

Bun이 설치된 환경에서 실행합니다.

```bash
bun install
bun run dev
```

## 빌드 및 검사

```bash
bun run build
bun run lint
```

빌드 결과는 `dist/`에 생성됩니다. `bun run preview`로 빌드 결과를 로컬에서 확인할 수 있습니다.
