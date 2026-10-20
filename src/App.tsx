import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Route, Routes, useLocation, useNavigate } from 'react-router'
import './App.css'

function createRoom(playerCount: number) {
  return Promise.resolve({ id: `mock-${Date.now()}`, playerCount })
}

function StartScreen() {
  const [playerCount, setPlayerCount] = useState(4)
  const navigate = useNavigate()

  async function handleCreateRoom() {
    const createdRoom = await createRoom(playerCount)
    navigate(`/rooms/${createdRoom.id}`)
  }

  return (
    <main className="start-screen">
      <h1>운칠기삼</h1>
      <div role="group" aria-label="참여 인원 선택">
        <button
          type="button"
          aria-label="인원 줄이기"
          disabled={playerCount === 4}
          onClick={() => setPlayerCount((count) => Math.max(4, count - 1))}
        >
          −
        </button>
        <output aria-live="polite">{playerCount}명</output>
        <button
          type="button"
          aria-label="인원 늘리기"
          disabled={playerCount === 6}
          onClick={() => setPlayerCount((count) => Math.min(6, count + 1))}
        >
          +
        </button>
      </div>
      <button type="button" onClick={handleCreateRoom}>
        방 만들기
      </button>
    </main>
  )
}

function RoomScreen() {
  const { pathname } = useLocation()
  const roomUrl = new URL(pathname, window.location.origin).href

  return (
    <main className="start-screen">
      <h1>방 입장 QR</h1>
      <QRCodeSVG
        value={roomUrl}
        size={256}
        marginSize={4}
        level="M"
        title="방 입장 QR 코드"
      />
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<StartScreen />} />
      <Route path="/rooms/:roomId" element={<RoomScreen />} />
    </Routes>
  )
}

export default App
