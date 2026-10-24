// 회의 미터기 요금 계산.
// 모든 시각은 epoch ms(Date.now())로 받는다. 경과 시간을 타이머로 누적하지 않고
// 시작 시각과의 차이로 계산해서, 탭이 백그라운드로 가거나 화면이 꺼져도 밀리지 않는다.

export type MeetingKind = 'work' | 'lead' | 'exec'

export const MEETING_KINDS: ReadonlyArray<{ id: MeetingKind; label: string; hourlyRate: number }> = [
  { id: 'work', label: '실무 회의', hourlyRate: 20_000 },
  { id: 'lead', label: '팀장과 함께 회의', hourlyRate: 30_000 },
  { id: 'exec', label: 'C레벨과 함께 회의', hourlyRate: 50_000 },
]

export const MIN_PEOPLE = 1
export const MAX_PEOPLE = 30
/** 이 시간마다 한 명씩 졸기 시작한다. */
export const DOZE_INTERVAL_MS = 15 * 60 * 1000

const MS_PER_HOUR = 60 * 60 * 1000

/** `from` 시각부터 다음 구간 전까지 `people`명이 참석. */
export interface Segment {
  from: number
  people: number
}

export interface Meeting {
  kind: MeetingKind
  /** 시간순. 첫 구간의 `from`이 회의 시작 시각. */
  segments: Segment[]
  endedAt: number | null
}

export function hourlyRateOf(kind: MeetingKind): number {
  const found = MEETING_KINDS.find(k => k.id === kind)
  if (!found) throw new Error(`Unknown meeting kind: ${kind}`)
  return found.hourlyRate
}

export function clampPeople(people: number): number {
  return Math.min(MAX_PEOPLE, Math.max(MIN_PEOPLE, Math.round(people)))
}

export function startMeeting(kind: MeetingKind, people: number, now: number): Meeting {
  return { kind, segments: [{ from: now, people: clampPeople(people) }], endedAt: null }
}

/** 회의 중 입·퇴장. 그 시점부터 요금 속도가 바뀐다. 끝난 회의나 같은 인원이면 그대로 돌려준다. */
export function changePeople(meeting: Meeting, people: number, now: number): Meeting {
  const next = clampPeople(people)
  const last = meeting.segments[meeting.segments.length - 1]
  if (meeting.endedAt !== null || next === last.people) return meeting
  // 시계가 뒤로 가도 구간 순서가 꼬이지 않게 마지막 구간 시작 이후로 맞춘다.
  const from = Math.max(now, last.from)
  if (from === last.from) {
    return { ...meeting, segments: [...meeting.segments.slice(0, -1), { from, people: next }] }
  }
  return { ...meeting, segments: [...meeting.segments, { from, people: next }] }
}

export function endMeeting(meeting: Meeting, now: number): Meeting {
  if (meeting.endedAt !== null) return meeting
  const last = meeting.segments[meeting.segments.length - 1]
  return { ...meeting, endedAt: Math.max(now, last.from) }
}

function stopTime(meeting: Meeting, now: number): number {
  return meeting.endedAt ?? now
}

export function startedAt(meeting: Meeting): number {
  return meeting.segments[0].from
}

export function currentPeople(meeting: Meeting): number {
  return meeting.segments[meeting.segments.length - 1].people
}

export function elapsedMs(meeting: Meeting, now: number): number {
  return Math.max(0, stopTime(meeting, now) - startedAt(meeting))
}

/** 지금까지 쌓인 요금(원, 내림). 구간마다 내림하지 않고 합친 뒤 한 번만 내림한다. */
export function costAt(meeting: Meeting, now: number): number {
  const rate = hourlyRateOf(meeting.kind)
  const stop = stopTime(meeting, now)
  let personMs = 0
  meeting.segments.forEach((seg, i) => {
    const end = Math.min(meeting.segments[i + 1]?.from ?? stop, stop)
    if (end > seg.from) personMs += seg.people * (end - seg.from)
  })
  return Math.floor((personMs * rate) / MS_PER_HOUR)
}

/** 현재 인원 기준 분당 요금(원). 회의 시작 후 화면에 보여주는 값. */
export function perMinuteCost(meeting: Meeting): number {
  return Math.round((currentPeople(meeting) * hourlyRateOf(meeting.kind)) / 60)
}

/** 졸고 있는 사람 수: 15분마다 한 명씩, 참석 인원을 넘지 않는다. */
export function dozingCount(meeting: Meeting, now: number): number {
  return Math.min(currentPeople(meeting), Math.floor(elapsedMs(meeting, now) / DOZE_INTERVAL_MS))
}

/** 47:12 처럼 분:초. 한 시간을 넘으면 1:02:03. */
export function formatElapsed(ms: number): string {
  const total = Math.floor(Math.max(0, ms) / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export function formatWon(won: number): string {
  return `₩${Math.floor(won).toLocaleString('ko-KR')}`
}
