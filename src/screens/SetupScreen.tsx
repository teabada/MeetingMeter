import { MeetingTable } from '../components/MeetingTable'
import { MeterPanel } from '../components/MeterPanel'
import { PeopleStepper } from '../components/PeopleStepper'
import { MEETING_KINDS, formatElapsed, formatWon, type MeetingKind } from '../meter/meter'

interface Props {
  kind: MeetingKind
  people: number
  onKindChange: (kind: MeetingKind) => void
  onPeopleChange: (people: number) => void
  onStart: () => void
}

export function SetupScreen({ kind, people, onKindChange, onPeopleChange, onStart }: Props) {
  return (
    <main className="screen">
      <header className="screen-header">
        <h1>회의 미터기</h1>
        <span className="screen-status">준비중</span>
      </header>

      <MeetingTable people={people} />

      {/* 분당 금액은 회의 시작 후부터 보여준다. */}
      <MeterPanel elapsed={formatElapsed(0)} cost={formatWon(0)} stage="회의 준비" />

      <section className="card">
        <fieldset className="kind-field">
          <legend className="field-label">어떤 회의예요?</legend>
          <div className="kind-chips">
            {MEETING_KINDS.map(k => (
              <button
                key={k.id}
                type="button"
                className="kind-chip"
                aria-pressed={k.id === kind}
                onClick={() => onKindChange(k.id)}
              >
                {k.label}
              </button>
            ))}
          </div>
        </fieldset>

        <PeopleStepper people={people} hint="회의 중에도 바꿀 수 있어요" onChange={onPeopleChange} />
      </section>

      <div className="spacer" />
      <button type="button" className="primary-button" onClick={onStart}>
        회의 시작
      </button>
    </main>
  )
}
