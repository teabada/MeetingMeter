import { useEffect, useState } from 'react'
import { MeterPanel } from '../components/MeterPanel'
import { formatElapsed, formatWon } from '../meter/meter'
import type { Receipt } from '../meter/receipt'
import { copyReceipt, type CopyResult } from '../share/copyReceipt'
import { CARD_HEIGHT, CARD_WIDTH, renderReceiptCard } from '../share/receiptCard'

interface Props {
  receipt: Receipt
  onRestart: () => void
}

const COPY_LABEL: Record<CopyResult | 'idle', string> = {
  idle: '결과 복사해서 공유',
  image: '이미지 복사했어요',
  text: '글로 복사했어요',
  failed: '복사하지 못했어요',
}

const COPY_ANNOUNCE: Record<CopyResult | 'idle', string> = {
  idle: '',
  image: '결과 카드 이미지를 클립보드에 복사했어요',
  text: '이 브라우저는 이미지 복사를 지원하지 않아 결과를 글로 복사했어요',
  failed: '복사하지 못했어요',
}

export function ReceiptScreen({ receipt, onRestart }: Props) {
  const [copy, setCopy] = useState<CopyResult | 'idle'>('idle')
  // 끝난 회의의 영수증은 바뀌지 않으므로 화면에 들어올 때 한 번만 그린다.
  const [card] = useState(() => renderReceiptCard(receipt))
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { item, count } = receipt.comparison.headline

  useEffect(() => {
    let url: string | null = null
    let cancelled = false
    card.then(
      blob => {
        if (cancelled) return
        url = URL.createObjectURL(blob)
        setPreviewUrl(url)
      },
      () => {
        // 카드를 못 그리면 미리보기 없이 글 복사로 동작한다.
      },
    )
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [card])

  useEffect(() => {
    if (copy === 'idle') return
    const id = setTimeout(() => setCopy('idle'), 2000)
    return () => clearTimeout(id)
  }, [copy])

  return (
    <main className="screen screen-receipt">
      <header className="screen-header">
        <h1>회의 미터기</h1>
        <span className="screen-status">회의 끝</span>
      </header>

      <MeterPanel
        elapsed={formatElapsed(receipt.elapsedMs)}
        cost={formatWon(receipt.cost)}
        stage="지불"
        lamp="paid"
        compact
        aside={
          <span>
            {receipt.people}명 · {receipt.kindLabel}
          </span>
        }
      />

      <section className="card receipt-card">
        <span className="receipt-lead">오늘 회의 값은</span>
        <p className="receipt-headline">
          {item.name} <span className="mono">{count}</span>
          {item.unit}
        </p>
        <dl className="receipt-rows">
          {receipt.comparison.rows.map(row => (
            <div key={row.label} className={row.goal ? 'receipt-row receipt-row-goal' : 'receipt-row'}>
              <dt>{row.label}</dt>
              <dd className="mono">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <figure className="share-preview">
        {previewUrl ? (
          <img src={previewUrl} width={CARD_WIDTH} height={CARD_HEIGHT} alt={receipt.shareText} />
        ) : (
          <div className="share-preview-placeholder" />
        )}
      </figure>

      <div className="spacer" />
      <div className="receipt-actions">
        <button
          type="button"
          className="primary-button"
          onClick={async () => setCopy(await copyReceipt(card, receipt.shareText))}
        >
          {COPY_LABEL[copy]}
        </button>
        <button type="button" className="secondary-button" onClick={onRestart}>
          다시 측정
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {COPY_ANNOUNCE[copy]}
      </p>
      <p className="footnote">비교 품목 가격은 재미로 잡은 대략적인 값이에요</p>
    </main>
  )
}
