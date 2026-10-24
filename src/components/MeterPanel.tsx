import type { CSSProperties, ReactNode } from 'react'
import { RunningCat } from './RunningCat'

interface Props {
  elapsed: string
  cost: string
  /** 하단 램프 단계 이름: 회의 준비 / 회의 중 / 지불 */
  stage: string
  /** off: 회의 준비, running: 램프가 켜지고 고양이가 달린다, paid: 노란 램프 */
  lamp?: 'off' | 'running' | 'paid'
  /** 영수증용 작은 미터기 */
  compact?: boolean
  /** 램프 오른쪽 (분당 요금 등) */
  aside?: ReactNode
}

export function MeterPanel({ elapsed, cost, stage, lamp = 'off', compact = false, aside }: Props) {
  return (
    // 두 숫자의 글자 수로 크기를 정해서, 금액이 길어져도 한 줄에 다 보이게 한다.
    <section
      className={compact ? 'meter meter-compact' : 'meter'}
      aria-label="미터기"
      style={{ '--meter-chars': elapsed.length + cost.length } as CSSProperties}
    >
      <span className="meter-label">경과</span>
      <span className="meter-label">요금</span>
      <span className="meter-value">{elapsed}</span>
      <span className="meter-value meter-cost">{cost}</span>
      <div className="meter-lamp">
        <span className={`meter-stage meter-stage-${lamp}`}>
          <span className="lamp-dot" />
          {stage}
          {lamp === 'running' && <RunningCat />}
        </span>
        {aside}
      </div>
    </section>
  )
}
