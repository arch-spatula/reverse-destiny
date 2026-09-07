# CLAUDE.md

Claude Code용 프로젝트 지침입니다.

## 행동 지침

공통 코딩 행동 지침은 @AGENTS.md 를 따릅니다. (가정 밝히기 / 단순함 우선 / 외과적 변경 / 목표 기반 실행)

## 프로젝트 개요

`reverse-destiny` — React 19 + TypeScript + Vite 기반 웹 게임.

- 기획: [docs/gdd.md](docs/gdd.md)
- 기술 결정 기록: [docs/ADR/](docs/ADR/)
- 명세: [docs/spec/](docs/spec/)

## 명령어

| 목적 | 명령 |
| --- | --- |
| 개발 서버 | `bun run dev` |
| 빌드 (타입 체크 포함) | `bun run build` |
| 린트 | `bun run lint` |
| 빌드 결과 미리보기 | `bun run preview` |

패키지 매니저는 bun입니다 (`bun.lock`). npm/yarn/pnpm으로 설치하지 마세요.

## 코드 규칙

- 소스는 [src/](src/) 아래에 둡니다.
- 린터는 oxlint이며 설정은 [.oxlintrc.json](.oxlintrc.json)에 있습니다.
- 타입 설정은 프로젝트 참조 구조입니다: [tsconfig.app.json](tsconfig.app.json) (앱), [tsconfig.node.json](tsconfig.node.json) (빌드 도구).
- 변경 후에는 `bun run lint`와 `bun run build`로 검증하세요.

## 커밋

- 한국어 Conventional Commits (`feat:`, `docs:`, `fix:` ...)를 사용합니다.
- 기술 선택 등 되돌리기 어려운 결정은 [docs/ADR/](docs/ADR/)에 기록합니다.
