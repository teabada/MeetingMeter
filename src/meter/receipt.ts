// 끝난 회의의 영수증 내용과 복사해서 공유할 텍스트.

import { compareCost, type Comparison } from './compare'
import { MEETING_KINDS, costAt, currentPeople, elapsedMs, formatWon, perMinuteCost, type Meeting } from './meter'

export interface Receipt {
  elapsedMs: number
  cost: number
  people: number
  kindLabel: string
  comparison: Comparison
  shareText: string
}

/** 공유 문구용 회의 길이: 47분, 1시간 2분, 1분 미만은 초. */
export function formatDuration(ms: number): string {
  const totalSec = Math.floor(Math.max(0, ms) / 1000)
  if (totalSec < 60) return `${totalSec}초`
  const totalMin = Math.floor(totalSec / 60)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m}분`
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`
}

/** 끝난 회의는 종료 시각 기준, 진행 중이면 `now` 기준. */
export function buildReceipt(meeting: Meeting, now: number): Receipt {
  const elapsed = elapsedMs(meeting, now)
  const cost = costAt(meeting, now)
  const people = currentPeople(meeting)
  const kindLabel = MEETING_KINDS.find(k => k.id === meeting.kind)?.label ?? ''
  const comparison = compareCost(cost, perMinuteCost(meeting))
  const { item, count } = comparison.headline

  const shareText = [
    `오늘 회의 ${formatDuration(elapsed)}, ${people}명 (${kindLabel})`,
    `요금 ${formatWon(cost)}`,
    `= ${item.name} ${count}${item.unit}`,
    '(회의 미터기로 측정)',
  ].join('\n')

  return { elapsedMs: elapsed, cost, people, kindLabel, comparison, shareText }
}
