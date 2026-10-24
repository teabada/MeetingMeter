import { MeetingTable } from '../components/MeetingTable'
import { MeterPanel } from '../components/MeterPanel'
import { PeopleStepper } from '../components/PeopleStepper'
import {
  MEETING_KINDS,
  costAt,
  currentPeople,
  dozingCount,
  elapsedMs,
  formatElapsed,
  formatWon,
  perMinuteCost,
  type Meeting,
} from '../meter/meter'

interface Props {
  meeting: Meeting
  now: number
  onPeopleChange: (people: number) => void
  onEnd: () => void
}

export function RunningScreen({ meeting, now, onPeopleChange, onEnd }: Props) {
  const people = currentPeople(meeting)
  const kindLabel = MEETING_KINDS.find(k => k.id === meeting.kind)?.label

  return (
    <main className="screen">
      <header className="screen-header">
        <h1>회의 미터기</h1>
        <span className="screen-status screen-status-live">회의 중</span>
      </header>

      <MeetingTable people={people} dozing={dozingCount(meeting, now)} />

      <MeterPanel
        elapsed={formatElapsed(elapsedMs(meeting, now))}
        cost={formatWon(costAt(meeting, now))}
        stage="회의 중"
        lamp="running"
        aside={<span>분당 {formatWon(perMinuteCost(meeting))}</span>}
      />

      <section className="card">
        {/* 회의 성격은 회의 중 잠금 */}
        <div className="locked-row">
          <span className="field-label">어떤 회의</span>
          <span>{kindLabel}</span>
        </div>

        <PeopleStepper people={people} hint="들어오거나 나가면 바로 조정" onChange={onPeopleChange} />
      </section>

      <div className="spacer" />
      <button type="button" className="primary-button danger-button" onClick={onEnd}>
        회의 종료
      </button>
    </main>
  )
}
