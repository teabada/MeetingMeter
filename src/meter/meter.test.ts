import { describe, expect, it } from 'vitest'
import {
  changePeople,
  clampPeople,
  costAt,
  dozingCount,
  elapsedMs,
  endMeeting,
  formatElapsed,
  formatWon,
  hourlyRateOf,
  perMinuteCost,
  startMeeting,
} from './meter'

const T0 = Date.UTC(2026, 9, 24, 1, 0, 0)
const sec = (n: number) => n * 1000
const min = (n: number) => n * 60 * 1000

describe('hourlyRateOf', () => {
  it('회의 성격별 1인 시간당 단가', () => {
    expect(hourlyRateOf('work')).toBe(20_000)
    expect(hourlyRateOf('lead')).toBe(30_000)
    expect(hourlyRateOf('exec')).toBe(50_000)
  })
})

describe('clampPeople', () => {
  it('1~30명 사이로 맞춘다', () => {
    expect(clampPeople(0)).toBe(1)
    expect(clampPeople(-3)).toBe(1)
    expect(clampPeople(31)).toBe(30)
    expect(clampPeople(7)).toBe(7)
  })
})

describe('costAt', () => {
  it('시작 직후는 0원', () => {
    const m = startMeeting('lead', 7, T0)
    expect(costAt(m, T0)).toBe(0)
  })

  it('디자인 예시: 팀장과 함께 7명, 47분 12초 → ₩165,200', () => {
    const m = startMeeting('lead', 7, T0)
    expect(costAt(m, T0 + min(47) + sec(12))).toBe(165_200)
  })

  it('실무 1명 1시간 → 2만 원, C레벨 1명 1시간 → 5만 원', () => {
    expect(costAt(startMeeting('work', 1, T0), T0 + min(60))).toBe(20_000)
    expect(costAt(startMeeting('exec', 1, T0), T0 + min(60))).toBe(50_000)
  })

  it('원 단위 아래는 내림', () => {
    // 1명 × 2만 원/시간 = 초당 5.55…원
    const m = startMeeting('work', 1, T0)
    expect(costAt(m, T0 + sec(1))).toBe(5)
  })

  it('구간마다 내림하지 않고 합친 뒤 한 번 내림한다', () => {
    // 1초씩 바뀌는 구간 3개: 구간별 내림이면 5+11+5=21, 합산 후 내림이면 22
    let m = startMeeting('work', 1, T0)
    m = changePeople(m, 2, T0 + sec(1))
    m = changePeople(m, 1, T0 + sec(2))
    expect(costAt(m, T0 + sec(3))).toBe(22)
  })

  it('중간 입장: 그 시점부터 요금 속도가 바뀐다', () => {
    // 실무 2명 30분(2만 원) + 4명 30분(4만 원)
    let m = startMeeting('work', 2, T0)
    m = changePeople(m, 4, T0 + min(30))
    expect(costAt(m, T0 + min(30))).toBe(20_000)
    expect(costAt(m, T0 + min(60))).toBe(60_000)
  })

  it('중간 퇴장도 반영된다', () => {
    // 팀장과 함께 6명 20분(6만 원) + 3명 20분(3만 원)
    let m = startMeeting('lead', 6, T0)
    m = changePeople(m, 3, T0 + min(20))
    expect(costAt(m, T0 + min(40))).toBe(90_000)
  })

  it('과거 시점을 물어보면 그때까지 요금만 센다', () => {
    let m = startMeeting('work', 2, T0)
    m = changePeople(m, 4, T0 + min(30))
    expect(costAt(m, T0 + min(15))).toBe(10_000)
    expect(costAt(m, T0 - min(5))).toBe(0)
  })

  it('종료 후에는 요금이 더 오르지 않는다', () => {
    let m = startMeeting('lead', 7, T0)
    m = endMeeting(m, T0 + min(10))
    expect(costAt(m, T0 + min(10))).toBe(35_000)
    expect(costAt(m, T0 + min(90))).toBe(35_000)
    expect(elapsedMs(m, T0 + min(90))).toBe(min(10))
  })

  it('타이머 누적이 아니라 시각 차이로 계산해서 오래 지나도 정확하다', () => {
    const m = startMeeting('exec', 30, T0)
    expect(costAt(m, T0 + min(8 * 60))).toBe(30 * 50_000 * 8)
  })
})

describe('changePeople', () => {
  it('같은 인원이면 구간을 늘리지 않는다', () => {
    const m = startMeeting('work', 3, T0)
    expect(changePeople(m, 3, T0 + min(5))).toBe(m)
  })

  it('원래 회의 객체를 바꾸지 않는다', () => {
    const m = startMeeting('work', 3, T0)
    changePeople(m, 5, T0 + min(5))
    expect(m.segments).toEqual([{ from: T0, people: 3 }])
  })

  it('끝난 회의는 바뀌지 않는다', () => {
    const m = endMeeting(startMeeting('work', 3, T0), T0 + min(5))
    expect(changePeople(m, 5, T0 + min(6))).toBe(m)
  })

  it('같은 시각에 여러 번 바꾸면 마지막 값으로 덮어쓴다', () => {
    let m = startMeeting('work', 3, T0)
    m = changePeople(m, 4, T0 + min(5))
    m = changePeople(m, 6, T0 + min(5))
    expect(m.segments).toEqual([
      { from: T0, people: 3 },
      { from: T0 + min(5), people: 6 },
    ])
  })

  it('시계가 뒤로 가도 구간 순서가 꼬이지 않는다', () => {
    let m = startMeeting('work', 3, T0)
    m = changePeople(m, 4, T0 + min(5))
    m = changePeople(m, 2, T0 + min(1))
    expect(m.segments.map(s => s.from)).toEqual([T0, T0 + min(5)])
    expect(m.segments[1].people).toBe(2)
  })

  it('범위를 벗어난 인원은 1~30명으로 맞춘다', () => {
    const m = changePeople(startMeeting('work', 3, T0), 0, T0 + min(1))
    expect(m.segments[1].people).toBe(1)
  })
})

describe('endMeeting', () => {
  it('두 번 종료해도 첫 종료 시각을 유지한다', () => {
    const once = endMeeting(startMeeting('work', 3, T0), T0 + min(5))
    expect(endMeeting(once, T0 + min(9))).toBe(once)
  })
})

describe('perMinuteCost', () => {
  it('디자인 예시: 팀장과 함께 7명 → 분당 ₩3,500', () => {
    expect(perMinuteCost(startMeeting('lead', 7, T0))).toBe(3_500)
  })

  it('현재 인원 기준으로 바뀐다', () => {
    const m = changePeople(startMeeting('lead', 7, T0), 2, T0 + min(1))
    expect(perMinuteCost(m)).toBe(1_000)
  })
})

describe('dozingCount', () => {
  it('15분마다 한 명씩 존다', () => {
    const m = startMeeting('lead', 7, T0)
    expect(dozingCount(m, T0 + min(14) + sec(59))).toBe(0)
    expect(dozingCount(m, T0 + min(15))).toBe(1)
    expect(dozingCount(m, T0 + min(47))).toBe(3)
  })

  it('참석 인원보다 많이 졸 수는 없다', () => {
    const m = startMeeting('work', 2, T0)
    expect(dozingCount(m, T0 + min(120))).toBe(2)
  })
})

describe('formatElapsed', () => {
  it('분:초', () => {
    expect(formatElapsed(0)).toBe('00:00')
    expect(formatElapsed(min(47) + sec(12))).toBe('47:12')
    expect(formatElapsed(sec(59) + 999)).toBe('00:59')
  })

  it('한 시간 넘으면 시:분:초', () => {
    expect(formatElapsed(min(62) + sec(3))).toBe('1:02:03')
  })
})

describe('formatWon', () => {
  it('천 단위 콤마', () => {
    expect(formatWon(0)).toBe('₩0')
    expect(formatWon(165_200)).toBe('₩165,200')
  })
})
