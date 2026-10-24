import { describe, expect, it } from 'vitest'
import { changePeople, endMeeting, startMeeting } from './meter'
import { parseMeeting } from './storage'

const T0 = Date.UTC(2026, 9, 24, 1, 0, 0)

describe('parseMeeting', () => {
  it('저장한 회의를 그대로 되살린다', () => {
    let m = startMeeting('lead', 7, T0)
    m = changePeople(m, 5, T0 + 60_000)
    expect(parseMeeting(JSON.stringify(m))).toEqual(m)
    const ended = endMeeting(m, T0 + 120_000)
    expect(parseMeeting(JSON.stringify(ended))).toEqual(ended)
  })

  it('비어 있거나 JSON이 아니면 null', () => {
    expect(parseMeeting(null)).toBeNull()
    expect(parseMeeting('')).toBeNull()
    expect(parseMeeting('{')).toBeNull()
    expect(parseMeeting('42')).toBeNull()
  })

  it('형식이 맞지 않으면 null', () => {
    const ok = { kind: 'work', segments: [{ from: T0, people: 3 }], endedAt: null }
    const bad = (patch: object) => JSON.stringify({ ...ok, ...patch })
    expect(parseMeeting(bad({ kind: 'party' }))).toBeNull()
    expect(parseMeeting(bad({ segments: [] }))).toBeNull()
    expect(parseMeeting(bad({ segments: [{ from: 'x', people: 3 }] }))).toBeNull()
    expect(parseMeeting(bad({ segments: [{ from: T0, people: 0 }] }))).toBeNull()
    expect(parseMeeting(bad({ endedAt: 'soon' }))).toBeNull()
    expect(
      parseMeeting(
        bad({
          segments: [
            { from: T0 + 1000, people: 3 },
            { from: T0, people: 4 },
          ],
        }),
      ),
    ).toBeNull()
  })

  it('필요 없는 필드는 버린다', () => {
    const raw = JSON.stringify({
      kind: 'work',
      segments: [{ from: T0, people: 3, extra: true }],
      endedAt: null,
      junk: 1,
    })
    expect(parseMeeting(raw)).toEqual({ kind: 'work', segments: [{ from: T0, people: 3 }], endedAt: null })
  })
})
