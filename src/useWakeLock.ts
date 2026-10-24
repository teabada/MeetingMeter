import { useEffect } from 'react'

/**
 * `active`인 동안 화면이 꺼지지 않게 한다. 지원하지 않는 브라우저(또는 http)에서는 아무것도 하지 않는다.
 * 탭이 가려지면 브라우저가 잠금을 풀어버리므로, 다시 보일 때 새로 잡는다.
 */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return

    let lock: WakeLockSentinel | null = null
    let requesting = false
    let cancelled = false

    const acquire = async () => {
      if (document.visibilityState !== 'visible' || requesting || (lock && !lock.released)) return
      requesting = true
      try {
        const next = await navigator.wakeLock.request('screen')
        // 요청하는 사이에 회의가 끝났으면 바로 놓는다.
        if (cancelled) void next.release()
        else lock = next
      } catch {
        // 배터리 절약 모드 등으로 거절될 수 있다. 화면이 꺼질 뿐 미터는 시각 차이로 계속 맞게 계산된다.
      } finally {
        requesting = false
      }
    }

    void acquire()
    document.addEventListener('visibilitychange', acquire)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', acquire)
      void lock?.release()
    }
  }, [active])
}
