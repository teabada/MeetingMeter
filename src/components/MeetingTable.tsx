import { TABLE_RECT, TABLE_VIEW, dozingSeats, seatLayout } from './seats'

export function MeetingTable({ people, dozing = 0 }: { people: number; dozing?: number }) {
  const seats = seatLayout(people)
  const sleepers = dozingSeats(people, dozing)
  return (
    <svg
      className="meeting-table"
      viewBox={`0 0 ${TABLE_VIEW.width} ${TABLE_VIEW.height}`}
      aria-hidden="true"
    >
      <rect
        x={TABLE_RECT.x}
        y={TABLE_RECT.y}
        width={TABLE_RECT.width}
        height={TABLE_RECT.height}
        rx={TABLE_RECT.radius}
        fill="var(--table)"
      />
      {seats.map((s, i) => (
        <circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r={s.r - s.thickness / 2}
          fill="none"
          stroke={s.color}
          strokeWidth={s.thickness}
        />
      ))}
      {sleepers.map(i => (
        <text
          key={i}
          className="zzz"
          x={seats[i].cx + seats[i].r}
          y={seats[i].cy - seats[i].r + 4}
          fontSize={Math.round(seats[i].r * 0.72)}
        >
          zzz
        </text>
      ))}
    </svg>
  )
}
