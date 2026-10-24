import { afterEach, describe, expect, it, vi } from 'vitest'
import { copyReceipt } from './copyReceipt'

class FakeClipboardItem {
  items: Record<string, unknown>
  constructor(items: Record<string, unknown>) {
    this.items = items
  }
}

const card = () => Promise.resolve(new Blob(['png'], { type: 'image/png' }))

function stubClipboard(clipboard: Partial<Clipboard>, withItem = true) {
  vi.stubGlobal('navigator', { clipboard })
  if (withItem) vi.stubGlobal('ClipboardItem', FakeClipboardItem)
  else vi.stubGlobal('ClipboardItem', undefined)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('copyReceipt', () => {
  it('이미지와 문구를 한 항목으로 복사한다', async () => {
    const write = vi.fn().mockResolvedValue(undefined)
    const writeText = vi.fn()
    stubClipboard({ write, writeText })

    expect(await copyReceipt(card(), '문구')).toBe('image')
    const [[items]] = write.mock.calls
    expect(Object.keys((items[0] as FakeClipboardItem).items)).toEqual(['image/png', 'text/plain'])
    expect(writeText).not.toHaveBeenCalled()
  })

  it('이미지 복사가 거절되면 문구만 복사한다', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    stubClipboard({ write: vi.fn().mockRejectedValue(new Error('NotAllowedError')), writeText })

    expect(await copyReceipt(card(), '문구')).toBe('text')
    expect(writeText).toHaveBeenCalledWith('문구')
  })

  it('ClipboardItem이 없는 브라우저는 문구만 복사한다', async () => {
    const write = vi.fn()
    const writeText = vi.fn().mockResolvedValue(undefined)
    stubClipboard({ write, writeText }, false)

    expect(await copyReceipt(card(), '문구')).toBe('text')
    expect(write).not.toHaveBeenCalled()
  })

  it('카드를 못 그렸으면 문구로 복사한다', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    // 실제 브라우저처럼, 넘긴 Promise가 실패하면 write도 실패한다.
    const write = vi.fn(async (items: FakeClipboardItem[]) => {
      await items[0].items['image/png']
    })
    stubClipboard({ write: write as unknown as Clipboard['write'], writeText })

    expect(await copyReceipt(Promise.reject(new Error('canvas')), '문구')).toBe('text')
  })
})
