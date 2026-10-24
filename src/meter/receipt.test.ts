import { describe, expect, it } from 'vitest'
import { changePeople, endMeeting, startMeeting } from './meter'
import { buildReceipt, formatDuration } from './receipt'

const T0 = Date.UTC(2026, 9, 24, 1, 0, 0)
const min = (n: number) => n * 60 * 1000

describe('formatDuration', () => {
  it('분, 시간+분, 1분 미만은 초', () => {
    expect(formatDuration(min(47) + 12_000)).toBe('47분')
    expect(formatDuration(min(62))).toBe('1시간 2분')
    expect(formatDuration(min(120))).toBe('2시간')
    expect(formatDuration(42_000)).toBe('42초')
    expect(formatDuration(0)).toBe('0초')
  })
})

describe('buildReceipt', () => {
  it('디자인 예시의 공유 문구', () => {
    const m = endMeeting(startMeeting('lead', 7, T0), T0 + min(47) + 12_000)
    const r = buildReceipt(m, T0 + min(500))
    expect(r.cost).toBe(165_200)
    expect(r.people).toBe(7)
    expect(r.kindLabel).toBe('팀장과 함께 회의')
    expect(r.shareText).toBe(
      ['오늘 회의 47분, 7명 (팀장과 함께 회의)', '요금 ₩165,200', '= 치킨 7.5마리', '(회의 미터기로 측정)'].join('\n'),
    )
  })

  it('끝난 회의는 나중에 봐도 같은 영수증', () => {
    const m = endMeeting(startMeeting('work', 3, T0), T0 + min(30))
    expect(buildReceipt(m, T0 + min(31))).toEqual(buildReceipt(m, T0 + min(600)))
  })

  it('인원은 종료 시점 인원, 요금은 구간별 합산', () => {
    let m = startMeeting('work', 2, T0)
    m = changePeople(m, 4, T0 + min(30))
    m = endMeeting(m, T0 + min(60))
    const r = buildReceipt(m, T0 + min(60))
    expect(r.people).toBe(4)
    expect(r.cost).toBe(60_000)
  })
})
