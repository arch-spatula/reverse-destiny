import rooms from '../api/rooms.ts'

const server = Bun.serve({
  hostname: '127.0.0.1',
  port: 3001,
  fetch(request) {
    if (new URL(request.url).pathname === '/api/rooms') {
      return rooms.fetch(request)
    }

    return Response.json({ error: 'API를 찾을 수 없습니다.' }, { status: 404 })
  },
})

console.log(`로컬 API 서버: ${server.url}`)
