import { useState } from 'react'
import './App.css'

function createRoom(playerCount: number) {
  return Promise.resolve({ playerCount })
}

function App() {
  const [playerCount, setPlayerCount] = useState(4)
  const [room, setRoom] = useState<{ playerCount: number } | null>(null)

  async function handleCreateRoom() {
    const createdRoom = await createRoom(playerCount)
    setRoom(createdRoom)
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
      {room && <div>QR임</div>}
    </main>
  )
}

export default App
