# 로컬 API 개발에 별도 서버와 Vite 프록시 사용

- 상태: 채택
- 작성일: 2026-09-08
- 구현 상태: 방 ID 발급 API와 로컬 서버·프록시 구현 완료. 상세 범위는 [서버 방 ID 발급 스펙](../spec/room-id-generation.md)을 따른다.

## 배경

React 화면에서 방 생성·입장 등의 HTTP API를 호출하며 개발할 로컬 실행 환경이 필요하다. Vercel CLI 도입을 검토했으나 의존성 보안 경고가 확인되어, 우선 별도 로컬 API 서버를 사용하는 방식으로 진행한다.

## 검토한 대안

- `vercel dev`로 Vercel Functions를 로컬에서 실행
- 별도 로컬 API 서버를 실행하고 Vite 개발 서버의 프록시로 연결

## 결정과 이유

- 로컬에서는 Vite가 React 화면을 제공하고, 별도 API 서버가 HTTP 요청을 처리한다.
- Vite의 `/api` 프록시를 통해 API 서버에 요청을 전달한다. 프런트엔드는 `fetch('/api/rooms')`처럼 상대 경로로 호출한다.
- 브라우저에서는 Vite 포트 하나로 화면과 API에 접근한다. 두 서버는 내부적으로 서로 다른 포트를 사용한다.
- 로컬 API 서버는 Bun.serve를 사용하며 `127.0.0.1:3001`에서 실행한다. 배포는 Vercel Node.js 런타임을 사용하고 동일한 Request·Response 핸들러를 호출한다.

```text
브라우저 → localhost:5173 (Vite)
              ├─ /       → React 화면
              └─ /api/*  → localhost:3001 (별도 API 서버)
```

## 결과 및 트레이드오프

- 이 구성에서 Vite는 API 요청을 전달하며, API 로직은 별도 서버에서 실행한다.
- 브라우저 기준으로 화면과 API가 같은 출처이므로 이 호출 경로에는 별도 CORS 설정이 필요하지 않다.
- 로컬 개발 시 Vite와 API 서버를 함께 실행해야 한다. `bun run dev`로 Vite를, 별도 터미널에서 `bun run dev:api`로 API 서버를 실행한다.
- 배포 환경은 기존 [Vercel Functions 결정](2026-09-07-002-vercel-functions-backend.md)을 유지한다. 로컬 API 서버는 Vercel의 실행 환경과 제한을 재현하지 않으므로 배포 환경에서 별도 검증이 필요하다.
- 데이터베이스와 실시간 통신 방식은 이번 결정에 포함하지 않는다.
