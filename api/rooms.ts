export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return Response.json(
        { error: 'POST 요청만 허용합니다.' },
        { status: 405, headers: { Allow: 'POST' } },
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return Response.json({ error: '올바른 JSON을 보내주세요.' }, { status: 400 })
    }

    const playerCount =
      typeof body === 'object' && body !== null && 'playerCount' in body
        ? body.playerCount
        : undefined

    if (playerCount !== 4 && playerCount !== 5 && playerCount !== 6) {
      return Response.json({ error: '참여 인원은 4~6명이어야 합니다.' }, { status: 400 })
    }

    return Response.json({ id: crypto.randomUUID(), playerCount }, { status: 201 })
  },
}
