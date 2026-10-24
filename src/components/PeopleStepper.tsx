import { MAX_PEOPLE, MIN_PEOPLE } from '../meter/meter'

interface Props {
  people: number
  hint: string
  onChange: (people: number) => void
}

export function PeopleStepper({ people, hint, onChange }: Props) {
  return (
    <div className="people-row">
      <label htmlFor="people" className="field-label">
        참석 인원
        <span className="field-hint">{hint}</span>
      </label>
      <div className="stepper">
        <button
          type="button"
          aria-label="한 명 빼기"
          disabled={people <= MIN_PEOPLE}
          onClick={() => onChange(people - 1)}
        >
          −
        </button>
        <input id="people" value={people} readOnly aria-live="polite" />
        <button
          type="button"
          aria-label="한 명 추가"
          disabled={people >= MAX_PEOPLE}
          onClick={() => onChange(people + 1)}
        >
          +
        </button>
      </div>
    </div>
  )
}
