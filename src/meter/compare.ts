// 회의 요금을 "치킨 7.5마리" 같은 물건 값으로 바꿔 보여준다. 가격은 재미로 잡은 대략치.

export interface CompareItem {
  name: string
  unit: string
  price: number
}

/** 가격 오름차순 */
export const COMPARE_ITEMS: readonly CompareItem[] = [
  { name: '삼각김밥', unit: '개', price: 1_500 },
  { name: '아메리카노', unit: '잔', price: 4_500 },
  { name: '치킨', unit: '마리', price: 22_000 },
  { name: '무선 이어폰', unit: '개', price: 279_000 },
  { name: '중고 경차', unit: '대', price: 5_000_000 },
  { name: '새 SUV', unit: '대', price: 45_000_000 },
]

export interface CompareRow {
  label: string
  value: string
  /** 아직 못 사는 목표 품목 (흐리게 표시) */
  goal?: boolean
}

export interface Comparison {
  headline: { item: CompareItem; count: string }
  rows: CompareRow[]
}

/** 살 수 있는 개수. 10개 이상은 정수, 그 아래는 소수 한 자리까지 내림. */
export function formatCount(count: number): string {
  // 0.3 * 10 = 2.9999… 같은 부동소수점 오차로 한 칸 더 내려가지 않게 아주 작은 값을 더한다.
  if (count >= 10) return String(Math.floor(count + 1e-9))
  const tenth = Math.floor(count * 10 + 1e-9) / 10
  return Number.isInteger(tenth) ? String(tenth) : tenth.toFixed(1)
}

/** 남은 금액을 지금 속도로 채우는 데 걸리는 시간. 1시간 이상은 시간, 그 아래는 분(올림). */
export function formatTimeToGo(remainingWon: number, perMinute: number): string {
  const minutes = Math.ceil(remainingWon / perMinute)
  if (minutes >= 60) return `${Math.round(minutes / 60).toLocaleString('ko-KR')}시간 더`
  return `${minutes}분 더`
}

/**
 * 헤드라인 = 1개 이상 살 수 있는 품목 중 가장 비싼 것 (하나도 못 사면 가장 싼 것).
 * 목록 = 헤드라인 바로 아래 품목, 헤드라인, 바로 위 품목(1개 미만), 그 다음 품목까지 남은 시간.
 */
export function compareCost(cost: number, perMinute: number): Comparison {
  const affordable = COMPARE_ITEMS.filter(item => cost >= item.price)
  const index = Math.max(0, affordable.length - 1)
  const count = (item: CompareItem) => `${formatCount(cost / item.price)}${item.unit}`

  const rows: CompareRow[] = []
  for (const item of COMPARE_ITEMS.slice(Math.max(0, index - 1), index + 2)) {
    // "0개"로 보이는 품목은 의미가 없으니 뺀다. 헤드라인은 0원이어도 남긴다.
    if (item !== COMPARE_ITEMS[index] && formatCount(cost / item.price) === '0') continue
    rows.push({ label: item.name, value: count(item) })
  }
  const goal = COMPARE_ITEMS[index + 2]
  if (goal && perMinute > 0) {
    rows.push({ label: `${goal.name}까지`, value: formatTimeToGo(goal.price - cost, perMinute), goal: true })
  }

  const headline = COMPARE_ITEMS[index]
  return { headline: { item: headline, count: formatCount(cost / headline.price) }, rows }
}
