// 진행 중이거나 막 끝난 회의를 localStorage에 둔다. 새로고침하거나 탭을 닫았다 열어도 미터가 이어진다.
// 저장소가 막혀 있으면(사생활 보호 모드 등) 조용히 저장 없이 동작한다.

import { MEETING_KINDS, type Meeting, type MeetingKind } from './meter'

const KEY = 'meeting-meter/meeting'

function isKind(value: unknown): value is MeetingKind {
  return MEETING_KINDS.some(k => k.id === value)
}

/** 저장된 문자열을 회의로 되살린다. 형식이 맞지 않으면 null. */
export function parseMeeting(raw: string | null): Meeting | null {
  if (!raw) return null
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return null
  }
  if (typeof data !== 'object' || data === null) return null
  const { kind, segments, endedAt } = data as Record<string, unknown>
  if (!isKind(kind) || !Array.isArray(segments) || segments.length === 0) return null
  if (endedAt !== null && !Number.isFinite(endedAt)) return null

  let prev = -Infinity
  for (const seg of segments) {
    if (typeof seg !== 'object' || seg === null) return null
    const { from, people } = seg as Record<string, unknown>
    if (!Number.isFinite(from) || !Number.isInteger(people) || (people as number) < 1) return null
    if ((from as number) < prev) return null
    prev = from as number
  }
  return {
    kind,
    segments: segments.map(s => ({ from: s.from as number, people: s.people as number })),
    endedAt: endedAt as number | null,
  }
}

export function loadMeeting(): Meeting | null {
  try {
    return parseMeeting(localStorage.getItem(KEY))
  } catch {
    return null
  }
}

export function saveMeeting(meeting: Meeting | null): void {
  try {
    if (meeting) localStorage.setItem(KEY, JSON.stringify(meeting))
    else localStorage.removeItem(KEY)
  } catch {
    // 저장 못 해도 현재 탭에서는 계속 동작한다.
  }
}
