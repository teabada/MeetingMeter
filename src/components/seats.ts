// 테이블 둘레에 참석자 도넛을 고르게 앉힌다. 좌표는 350×210 viewBox 기준.

export const TABLE_VIEW = { width: 350, height: 210 }
export const TABLE_RECT = { x: 95, y: 62, width: 160, height: 86, radius: 16 }

const SEAT_COLORS = ['#7152f3', '#7fcff7', '#f5cf63', '#9bd88a', '#f0a8c6', '#ef9a6c', '#b4ece4', '#c9b6f7']

// 도넛 중심이 지나가는 둘레 사각형
const X0 = 80
const X1 = 290
const Y0 = 32
const Y1 = 178

export interface Seat {
  cx: number
  cy: number
  /** 바깥 반지름 */
  r: number
  /** 링 두께 */
  thickness: number
  color: string
}

export function seatLayout(people: number): Seat[] {
  const w = X1 - X0
  const h = Y1 - Y0
  const perimeter = 2 * (w + h)
  const crowded = people > 14
  const r = crowded ? 11 : 18
  const thickness = crowded ? 6 : 10

  return Array.from({ length: people }, (_, i) => {
    // 위쪽 변 가운데에서 시작해 시계 방향으로 돈다.
    let d = (((i + 0.5) / people) * perimeter + w * 0.5) % perimeter
    let cx: number
    let cy: number
    if (d < w) {
      cx = X0 + d
      cy = Y0
    } else if ((d -= w) < h) {
      cx = X1
      cy = Y0 + d
    } else if ((d -= h) < w) {
      cx = X1 - d
      cy = Y1
    } else {
      d -= w
      cx = X0
      cy = Y1 - d
    }
    return { cx, cy, r, thickness, color: SEAT_COLORS[i % SEAT_COLORS.length] }
  })
}

/**
 * 졸고 있는 `dozing`명의 자리 번호. 인원이 그대로면 이미 조는 사람은 계속 졸고,
 * 새로 조는 사람은 테이블 여기저기로 흩어지도록 황금비 간격 순서로 고른다.
 */
export function dozingSeats(people: number, dozing: number): number[] {
  const order = Array.from({ length: people }, (_, i) => i).sort(
    (a, b) => ((a * 0.618034) % 1) - ((b * 0.618034) % 1),
  )
  return order.slice(0, Math.max(0, Math.min(people, dozing)))
}
