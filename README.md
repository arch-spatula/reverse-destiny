# reverse-destiny

질문으로 운세 명식을 역으로 맞추는 보드게임

배포 사이트: [https://reverse-destiny.vercel.app/](https://reverse-destiny.vercel.app/)

> Source code is publicly available for portfolio and review purposes.
>
> Unless otherwise stated, no license is granted to copy, modify, redistribute, or commercially use this project.
> 
> Copyright © 2026 <copyright holder>. All rights reserved.

- 포트폴리오를 목적으로 합니다.

## 개발 환경

Bun과 Vite 기반의 React + TypeScript 프로젝트입니다.

로컬 API 개발은 [별도 API 서버와 Vite 프록시를 사용하는 방식](docs/ADR/2026-09-08-003-local-api-vite-proxy.md)으로 진행합니다. 방 ID 발급 API는 [서버 방 ID 발급 스펙](docs/spec/room-id-generation.md)을 따릅니다.

## 설치 및 실행

Bun이 설치된 환경에서 실행합니다.

```bash
bun install
bun run dev
```

별도 터미널에서 로컬 API 서버도 실행합니다.

```bash
bun run dev:api
```

Vite의 `/api` 요청은 `127.0.0.1:3001`의 Bun API 서버로 전달됩니다. 배포 환경에서는 같은 핸들러를 Vercel Functions의 Node.js 런타임에서 실행합니다. 현재는 방 ID만 발급하며 방 정보를 저장하거나 존재 여부를 확인하지 않습니다.

## 빌드 및 검사

```bash
bun test
bun run build
bun run lint
```

빌드 결과는 `dist/`에 생성됩니다. `bun run preview`로 빌드 결과를 로컬에서 확인할 수 있습니다.

## 협업 규칙

브랜치, 커밋, PR 및 병합 규칙은 [Git 컨벤션](docs/git-conventions.md)을 따릅니다.

## 에이전트 스킬

[software-factory](.agents/skills/software-factory/SKILL.md)는 스펙 기반 개발을 구현(A), QA(B), 테스트 타당성 검토(C) 에이전트와 오케스트레이터로 진행하는 저장소 스킬입니다. A가 개발을 계속하는 동안 변경사항별로 B가 테스트를 작성하고, C의 승인 후 QA를 실행합니다. 실패 원인에 따라 테스트나 구현을 수정하며, 촘촘한 작업 분해와 변경 내역 확인으로 요청 범위를 유지합니다.

Codex에서 대상 스펙과 작업 범위를 지정해 호출합니다.

```text
$software-factory docs/spec/room-creation.md의 방 생성 및 QR 표시를 구현해줘.
```

멀티 에이전트 도구를 사용할 수 있는 환경이 필요합니다. 설계 배경과 흐름은 [소프트웨어 팩토리 ADR](docs/ADR/2026-10-23-005-spec-driven-software-factory.md)을 참고합니다.
