import { useEffect, useState } from 'react'
import { MeterPanel } from '../components/MeterPanel'
import { copyText } from '../copyText'
import { formatElapsed, formatWon } from '../meter/meter'
import type { Receipt } from '../meter/receipt'

interface Props {
  receipt: Receipt
  onRestart: () => void
}

type CopyState = 'idle' | 'copied' | 'failed'

export function ReceiptScreen({ receipt, onRestart }: Props) {
  const [copy, setCopy] = useState<CopyState>('idle')
  const { item, count } = receipt.comparison.headline

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

      <p className="share-preview">{receipt.shareText}</p>

      <div className="spacer" />
      <div className="receipt-actions">
        <button
          type="button"
          className="primary-button"
          onClick={async () => setCopy((await copyText(receipt.shareText)) ? 'copied' : 'failed')}
        >
          {copy === 'copied' ? '복사했어요' : copy === 'failed' ? '복사하지 못했어요' : '결과 복사해서 공유'}
        </button>
        <button type="button" className="secondary-button" onClick={onRestart}>
          다시 측정
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {copy === 'copied' ? '결과를 클립보드에 복사했어요' : copy === 'failed' ? '복사하지 못했어요' : ''}
      </p>
      <p className="footnote">비교 품목 가격은 재미로 잡은 대략적인 값이에요</p>
    </main>
  )
}
