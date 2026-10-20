import { describe, expect, test } from 'bun:test'
import rooms from '../api/rooms.ts'

function post(body: unknown) {
  return rooms.fetch(new Request('http://localhost/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }))
}

describe('POST /api/rooms', () => {
  test.each([4, 5, 6])('%i명 요청에 UUID와 인원수를 반환한다', async (playerCount) => {
    const response = await post({ playerCount })
    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({
      id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/),
      playerCount,
    })
  })

  test('서로 다른 요청에는 다른 ID를 발급한다', async () => {
    const first = await (await post({ playerCount: 4 })).json()
    const second = await (await post({ playerCount: 4 })).json()
    expect(first).not.toEqual(second)
  })

  test.each([{}, null, [], 4, { playerCount: '4' }, { playerCount: 4.5 }, { playerCount: 3 }, { playerCount: 7 }].map((body) => [body]))(
    '잘못된 인원수 또는 본문 %j를 거부한다',
    async (body) => {
      const response = await post(body)
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ error: '참여 인원은 4~6명이어야 합니다.' })
    },
  )

  test.each(['{', ''])('잘못된 JSON %j를 거부한다', async (body) => {
    const response = await rooms.fetch(new Request('http://localhost/api/rooms', {
      method: 'POST',
      body,
    }))
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: '올바른 JSON을 보내주세요.' })
  })

  test.each(['GET', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'])('%s 요청을 거부한다', async (method) => {
    const response = await rooms.fetch(new Request('http://localhost/api/rooms', { method }))
    expect(response.status).toBe(405)
    expect(response.headers.get('Allow')).toBe('POST')
    expect(await response.json()).toEqual({ error: 'POST 요청만 허용합니다.' })
  })
})
