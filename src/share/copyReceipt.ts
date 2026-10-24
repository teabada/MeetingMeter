import { copyText } from '../copyText'

export type CopyResult = 'image' | 'text' | 'failed'

/**
 * 카드 이미지와 공유 문구를 한 번에 클립보드에 넣는다. 채팅 앱에 붙이면 이미지, 글 입력칸에 붙이면 문구가 들어간다.
 * 이미지 복사를 못 하는 브라우저에서는 문구만 복사한다.
 *
 * Safari는 클릭 이벤트 안에서 바로 clipboard.write를 불러야 하므로, 카드는 Promise 그대로 넘긴다.
 */
export async function copyReceipt(card: Promise<Blob>, text: string): Promise<CopyResult> {
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': card,
          'text/plain': new Blob([text], { type: 'text/plain' }),
        }),
      ])
      return 'image'
    } catch {
      // 권한 거절, 이미지 형식 미지원 등: 아래에서 문구만 복사한다.
    }
  }
  return (await copyText(text)) ? 'text' : 'failed'
}
