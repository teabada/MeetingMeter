import { describe, expect, it } from 'vitest'
import { TABLE_VIEW, dozingSeats, seatLayout } from './seats'

describe('seatLayout', () => {
  it('인원 수만큼 자리를 만든다', () => {
    expect(seatLayout(1)).toHaveLength(1)
    expect(seatLayout(7)).toHaveLength(7)
    expect(seatLayout(30)).toHaveLength(30)
  })

  it('한 명이면 아래쪽 변 가운데에 앉는다', () => {
    const [s] = seatLayout(1)
    // 위쪽 변 가운데에서 출발해 둘레의 절반만큼 이동
    expect(s.cx).toBeCloseTo(185)
    expect(s.cy).toBe(178)
  })

  it('15명부터는 도넛을 작게 그린다', () => {
    expect(seatLayout(14)[0]).toMatchObject({ r: 18, thickness: 10 })
    expect(seatLayout(15)[0]).toMatchObject({ r: 11, thickness: 6 })
  })

  it('최대 인원에서도 도넛이 viewBox 안에 있다', () => {
    for (const s of seatLayout(30)) {
      expect(s.cx - s.r).toBeGreaterThanOrEqual(0)
      expect(s.cy - s.r).toBeGreaterThanOrEqual(0)
      expect(s.cx + s.r).toBeLessThanOrEqual(TABLE_VIEW.width)
      expect(s.cy + s.r).toBeLessThanOrEqual(TABLE_VIEW.height)
    }
  })
})

describe('dozingSeats', () => {
  it('조는 인원만큼, 서로 다른 자리를 고른다', () => {
    const s = dozingSeats(7, 3)
    expect(s).toHaveLength(3)
    expect(new Set(s).size).toBe(3)
    expect(s.every(i => i >= 0 && i < 7)).toBe(true)
  })

  it('시간이 지나도 이미 조는 사람은 그대로다', () => {
    expect(dozingSeats(7, 3).slice(0, 2)).toEqual(dozingSeats(7, 2))
  })

  it('0명 이하나 인원 초과도 안전하다', () => {
    expect(dozingSeats(7, 0)).toEqual([])
    expect(dozingSeats(7, -1)).toEqual([])
    expect(dozingSeats(2, 5)).toHaveLength(2)
  })

  it('zzz가 viewBox 오른쪽 밖으로 나가지 않는다', () => {
    // 글자 폭 약 30px
    for (const n of [1, 7, 14, 15, 30]) {
      for (const i of dozingSeats(n, n)) {
        const s = seatLayout(n)[i]
        expect(s.cx + s.r + 30).toBeLessThanOrEqual(TABLE_VIEW.width)
        expect(s.cy - s.r + 4 - 10).toBeGreaterThanOrEqual(0)
      }
    }
  })
})
