import { useEffect, useState } from 'react'
import {
  changePeople,
  clampPeople,
  currentPeople,
  endMeeting,
  startMeeting,
  type Meeting,
  type MeetingKind,
} from './meter/meter'
import { buildReceipt } from './meter/receipt'
import { loadMeeting, saveMeeting } from './meter/storage'
import { ReceiptScreen } from './screens/ReceiptScreen'
import { RunningScreen } from './screens/RunningScreen'
import { SetupScreen } from './screens/SetupScreen'
import { useNow } from './useNow'
import { useWakeLock } from './useWakeLock'
import './App.css'

function App() {
  const [meeting, setMeeting] = useState<Meeting | null>(loadMeeting)
  const [kind, setKind] = useState<MeetingKind>(() => meeting?.kind ?? 'lead')
  const [people, setPeople] = useState(() => (meeting ? currentPeople(meeting) : 7))
  const running = meeting !== null && meeting.endedAt === null
  const now = useNow(running)
  useWakeLock(running)

  useEffect(() => saveMeeting(meeting), [meeting])

  if (!meeting) {
    return (
      <SetupScreen
        kind={kind}
        people={people}
        onKindChange={setKind}
        onPeopleChange={n => setPeople(clampPeople(n))}
        onStart={() => setMeeting(startMeeting(kind, people, Date.now()))}
      />
    )
  }

  if (running) {
    return (
      <RunningScreen
        meeting={meeting}
        now={now}
        onPeopleChange={n => setMeeting(m => m && changePeople(m, n, Date.now()))}
        onEnd={() => setMeeting(m => m && endMeeting(m, Date.now()))}
      />
    )
  }

  return (
    <ReceiptScreen
      receipt={buildReceipt(meeting, now)}
      onRestart={() => {
        setPeople(currentPeople(meeting))
        setMeeting(null)
      }}
    />
  )
}

export default App
