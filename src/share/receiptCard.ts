// 영수증을 공유용 PNG 카드(1200×630)로 그린다. 채팅 앱 미리보기에 맞는 가로형.

import { formatElapsed, formatWon } from '../meter/meter'
import type { Receipt } from '../meter/receipt'

export const CARD_WIDTH = 1200
export const CARD_HEIGHT = 630

const C = {
  bg: '#f6f5f1',
  ink: '#1d1c1a',
  muted: '#6f6b63',
  meterBg: '#0b0b0b',
  meterMuted: '#9a9a9a',
  meterLine: '#262626',
  cost: '#9ff2c8',
  paid: '#f5cf63',
}
const SANS = "'IBM Plex Sans KR', -apple-system, sans-serif"
const MONO = "'JetBrains Mono', Menlo, monospace"
const PAD = 56

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** 나란히 이어 그릴 글자 조각들. 전체 폭이 maxWidth를 넘으면 글자 크기를 줄인다. */
function drawRun(
  ctx: CanvasRenderingContext2D,
  parts: { text: string; font: string; color: string }[],
  x: number,
  y: number,
  size: number,
  maxWidth: number,
) {
  const fontAt = (font: string, px: number) => font.replace('{px}', `${px}px`)
  const widthAt = (px: number) =>
    parts.reduce((sum, p) => {
      ctx.font = fontAt(p.font, px)
      return sum + ctx.measureText(p.text).width
    }, 0)
  const px = Math.min(size, Math.floor((size * maxWidth) / Math.max(1, widthAt(size))))
  let cursor = x
  for (const p of parts) {
    ctx.font = fontAt(p.font, px)
    ctx.fillStyle = p.color
    ctx.fillText(p.text, cursor, y)
    cursor += ctx.measureText(p.text).width
  }
}

export function drawReceiptCard(ctx: CanvasRenderingContext2D, receipt: Receipt): void {
  const { item, count } = receipt.comparison.headline
  const inner = CARD_WIDTH - PAD * 2

  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)
  ctx.textBaseline = 'alphabetic'

  // 머리글
  ctx.fillStyle = C.ink
  ctx.font = `700 34px ${SANS}`
  ctx.fillText('회의 미터기', PAD, PAD + 30)
  ctx.fillStyle = C.muted
  ctx.font = `400 24px ${SANS}`
  ctx.textAlign = 'right'
  ctx.fillText('회의 끝', CARD_WIDTH - PAD, PAD + 30)
  ctx.textAlign = 'left'

  // 미터기
  const mx = PAD
  const my = 118
  const mw = inner
  const mh = 214
  const mp = 44
  ctx.fillStyle = C.meterBg
  roundedRect(ctx, mx, my, mw, mh, 32)
  ctx.fill()

  const elapsed = formatElapsed(receipt.elapsedMs)
  ctx.font = `800 72px ${MONO}`
  const elapsedWidth = ctx.measureText(elapsed).width
  const costX = mx + mp + elapsedWidth + 64

  ctx.fillStyle = C.meterMuted
  ctx.font = `400 22px ${SANS}`
  ctx.fillText('경과', mx + mp, my + 52)
  ctx.fillText('요금', costX, my + 52)
  drawRun(ctx, [{ text: elapsed, font: `800 {px} ${MONO}`, color: '#ffffff' }], mx + mp, my + 124, 72, elapsedWidth)
  drawRun(ctx, [{ text: formatWon(receipt.cost), font: `800 {px} ${MONO}`, color: C.cost }], costX, my + 124, 72, mx + mw - mp - costX)

  ctx.fillStyle = C.meterLine
  ctx.fillRect(mx + mp, my + 152, mw - mp * 2, 2)
  ctx.fillStyle = C.paid
  ctx.beginPath()
  ctx.arc(mx + mp + 7, my + 184, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = C.meterMuted
  ctx.font = `500 22px ${MONO}`
  ctx.fillText('지불', mx + mp + 26, my + 192)
  ctx.textAlign = 'right'
  ctx.fillText(`${receipt.people}명 · ${receipt.kindLabel}`, mx + mw - mp, my + 192)
  ctx.textAlign = 'left'

  // 헤드라인
  ctx.fillStyle = C.muted
  ctx.font = `400 26px ${SANS}`
  ctx.fillText('오늘 회의 값은', PAD, 404)
  drawRun(
    ctx,
    [
      { text: `${item.name} `, font: `700 {px} ${SANS}`, color: C.ink },
      { text: count, font: `700 {px} ${MONO}`, color: C.ink },
      { text: item.unit, font: `700 {px} ${SANS}`, color: C.ink },
    ],
    PAD,
    492,
    80,
    inner,
  )

  // 바닥글
  ctx.fillStyle = C.muted
  ctx.font = `400 20px ${SANS}`
  ctx.fillText('비교 품목 가격은 재미로 잡은 대략적인 값이에요', PAD, CARD_HEIGHT - PAD + 6)
}

/** 카드에 쓰는 글꼴을 먼저 받아 둔다. 안 받으면 캔버스가 기본 글꼴로 그린다. */
async function loadCardFonts(receipt: Receipt): Promise<void> {
  const { item, count } = receipt.comparison.headline
  const sansText = `회의 미터기 끝 경과 요금 오늘 값은 지불 명 · ${receipt.kindLabel} ${item.name}${item.unit} 비교 품목 가격은 재미로 잡은 대략적인 값이에요`
  const monoText = `0123456789:₩,.${count}`
  try {
    await Promise.all([
      document.fonts.load(`400 26px ${SANS}`, sansText),
      document.fonts.load(`700 80px ${SANS}`, sansText),
      document.fonts.load(`500 22px ${MONO}`, monoText),
      document.fonts.load(`800 72px ${MONO}`, monoText),
      document.fonts.load(`700 80px ${MONO}`, monoText),
    ])
  } catch {
    // 글꼴을 못 받아도 기본 글꼴로 그린다.
  }
}

export async function renderReceiptCard(receipt: Receipt): Promise<Blob> {
  await loadCardFonts(receipt)
  const canvas = document.createElement('canvas')
  canvas.width = CARD_WIDTH
  canvas.height = CARD_HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D is not available')
  drawReceiptCard(ctx, receipt)
  return new Promise((resolve, reject) =>
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('PNG encoding failed'))), 'image/png'),
  )
}
