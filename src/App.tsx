import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Route, Routes, useNavigate, useParams } from 'react-router'
import './App.css'

async function createRoom(playerCount: number): Promise<{ id: string; playerCount: number }> {
  const response = await fetch('/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerCount }),
  })
  if (!response.ok) {
    throw new Error('방을 만들지 못했습니다. 다시 시도해주세요.')
  }
  return response.json()
}

function StartScreen() {
  const [playerCount, setPlayerCount] = useState(4)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleCreateRoom() {
    if (isCreating) return
    setIsCreating(true)
    setError(null)
    try {
      const createdRoom = await createRoom(playerCount)
      navigate(`/rooms/${createdRoom.id}`)
    } catch {
      setError('방을 만들지 못했습니다. 다시 시도해주세요.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <main className="start-screen">
      <h1>운칠기삼</h1>
      <div role="group" aria-label="참여 인원 선택">
        <button
          type="button"
          aria-label="인원 줄이기"
          disabled={isCreating || playerCount === 4}
          onClick={() => setPlayerCount((count) => Math.max(4, count - 1))}
        >
          −
        </button>
        <output aria-live="polite">{playerCount}명</output>
        <button
          type="button"
          aria-label="인원 늘리기"
          disabled={isCreating || playerCount === 6}
          onClick={() => setPlayerCount((count) => Math.min(6, count + 1))}
        >
          +
        </button>
      </div>
      <button type="button" disabled={isCreating} onClick={handleCreateRoom}>
        {isCreating ? '생성 중…' : '방 만들기'}
      </button>
      {error && <p role="alert">{error}</p>}
    </main>
  )
}

function RoomScreen() {
  const { roomId } = useParams()
  const joinUrl = new URL(
    `/rooms/${encodeURIComponent(roomId!)}/join`,
    window.location.origin,
  ).href

  return (
    <main className="start-screen">
      <h1>방 입장 QR</h1>
      <QRCodeSVG
        value={joinUrl}
        size={256}
        marginSize={4}
        level="M"
        title="방 입장 QR 코드"
      />
      <a
        className="join-button"
        href={joinUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-describedby="join-hint"
      >
        입장
      </a>
      <p id="join-hint">새 탭으로 열립니다.</p>
    </main>
  )
}

function JoinScreen() {
  const [birthTimeUnknown, setBirthTimeUnknown] = useState(false)

  return (
    <main className="start-screen">
      <h1>입장 정보</h1>
      <form className="join-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          생년월일
          <input name="birthDate" type="date" required />
        </label>
        <label>
          태어난 시간
          <input
            name="birthTime"
            type="time"
            required={!birthTimeUnknown}
            disabled={birthTimeUnknown}
          />
        </label>
        <label>
          <input
            name="birthTimeUnknown"
            type="checkbox"
            checked={birthTimeUnknown}
            onChange={(event) => setBirthTimeUnknown(event.target.checked)}
          />
          모름
        </label>
        <label>
          태어난 도시
          <input name="birthCity" type="text" required />
        </label>
        <label>
          성별
          <select name="gender" defaultValue="" required>
            <option value="" disabled>선택해주세요</option>
            <option value="female">여성</option>
            <option value="male">남성</option>
          </select>
        </label>
      </form>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<StartScreen />} />
      <Route path="/rooms/:roomId" element={<RoomScreen />} />
      <Route path="/rooms/:roomId/join" element={<JoinScreen />} />
    </Routes>
  )
}

export default App
