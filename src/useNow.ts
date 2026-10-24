import { useEffect, useState } from 'react'

/** 화면 갱신용 현재 시각. 값 계산은 meter 로직이 시각 차이로 하므로 주기는 표시 품질만 좌우한다. */
export function useNow(enabled: boolean, intervalMs = 250): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!enabled) return
    // 첫 틱 전까지는 이전 값이 남지만, meter 로직이 시작 전 시각을 0으로 처리한다.
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [enabled, intervalMs])
  return now
}
