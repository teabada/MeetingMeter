import { describe, expect, it } from 'vitest'
import { compareCost, formatCount, formatTimeToGo } from './compare'

describe('formatCount', () => {
  it('10개 이상은 정수로 내림', () => {
    expect(formatCount(36.71)).toBe('36')
    expect(formatCount(10)).toBe('10')
  })

  it('10개 미만은 소수 한 자리까지 내림, .0은 뗀다', () => {
    expect(formatCount(7.509)).toBe('7.5')
    expect(formatCount(0.592)).toBe('0.5')
    expect(formatCount(0.99)).toBe('0.9')
    expect(formatCount(3)).toBe('3')
    expect(formatCount(0)).toBe('0')
  })

  it('딱 나누어떨어지는 값은 오차로 내려가지 않는다', () => {
    expect(formatCount(6_600 / 22_000)).toBe('0.3')
    expect(formatCount(0.7)).toBe('0.7')
  })
})

describe('formatTimeToGo', () => {
  it('1시간 이상은 시간 단위 반올림', () => {
    // 분당 3,500원 → 시간당 21만 원
    expect(formatTimeToGo(4_834_800, 3_500)).toBe('23시간 더')
  })

  it('1시간 미만은 분 단위 올림', () => {
    expect(formatTimeToGo(3_501, 3_500)).toBe('2분 더')
    expect(formatTimeToGo(100, 3_500)).toBe('1분 더')
  })
})

describe('compareCost', () => {
  it('디자인 예시: ₩165,200, 분당 ₩3,500', () => {
    const c = compareCost(165_200, 3_500)
    expect(c.headline.item.name).toBe('치킨')
    expect(c.headline.count).toBe('7.5')
    expect(c.rows).toEqual([
      { label: '아메리카노', value: '36잔' },
      { label: '치킨', value: '7.5마리' },
      { label: '무선 이어폰', value: '0.5개' },
      { label: '중고 경차까지', value: '23시간 더', goal: true },
    ])
  })

  it('헤드라인은 1개 이상 살 수 있는 품목 중 가장 비싼 것', () => {
    expect(compareCost(22_000, 1_000).headline.item.name).toBe('치킨')
    expect(compareCost(21_999, 1_000).headline.item.name).toBe('아메리카노')
  })

  it('아무것도 못 사면 가장 싼 품목을 소수로 보여준다', () => {
    const c = compareCost(600, 1_000)
    expect(c.headline.item.name).toBe('삼각김밥')
    expect(c.headline.count).toBe('0.4')
    expect(c.rows.map(r => r.label)).toEqual(['삼각김밥', '아메리카노', '치킨까지'])
  })

  it('0원이어도 깨지지 않는다', () => {
    const c = compareCost(0, 1_000)
    expect(c.headline.count).toBe('0')
    expect(c.rows.map(r => r.label)).toEqual(['삼각김밥', '치킨까지'])
  })

  it('0개로 보이는 품목 행은 뺀다', () => {
    // 무선 이어폰 22,000 / 279,000 = 0.07개
    const c = compareCost(22_000, 1_000)
    expect(c.rows.map(r => r.label)).toEqual(['아메리카노', '치킨', '중고 경차까지'])
  })

  it('가장 비싼 품목을 넘으면 목표 행이 없다', () => {
    const c = compareCost(50_000_000, 10_000)
    expect(c.headline.item.name).toBe('새 SUV')
    expect(c.rows.map(r => r.label)).toEqual(['중고 경차', '새 SUV'])
  })

  it('목표 바로 전 단계면 바로 위 품목까지만', () => {
    const c = compareCost(6_000_000, 10_000)
    expect(c.rows.map(r => r.label)).toEqual(['무선 이어폰', '중고 경차', '새 SUV'])
  })
})
