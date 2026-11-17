// Sunrise and sunset. Named heuristic: Paris, mid-month local clock times
// (daylight saving included), interpolated by day. Close enough for France;
// elsewhere the sky follows Paris's day length.
const SUN_BY_MONTH: readonly (readonly [number, number])[] = [
  [8 * 60 + 40, 17 * 60 + 15], // January
  [8 * 60 + 5, 18 * 60 + 5],
  [7 * 60 + 10, 18 * 60 + 50],
  [7 * 60 + 5, 20 * 60 + 35],
  [6 * 60 + 15, 21 * 60 + 15],
  [5 * 60 + 50, 21 * 60 + 55],
  [6 * 60 + 5, 21 * 60 + 50],
  [6 * 60 + 45, 21 * 60 + 5],
  [7 * 60 + 30, 20 * 60 + 0],
  [8 * 60 + 15, 19 * 60 + 0],
  [8 * 60 + 0, 17 * 60 + 15],
  [8 * 60 + 35, 16 * 60 + 55], // December
]

export function sunFor(month: number, day: number): { rise: number; set: number } {
  // month 1..12, day 1..31; each table row stands for the 15th.
  const here = month - 1
  const toward = day >= 15 ? (here + 1) % 12 : (here + 11) % 12
  const t = Math.min(1, Math.abs(day - 15) / 30)
  const a = SUN_BY_MONTH[here]!
  const b = SUN_BY_MONTH[toward]!

  return { rise: Math.round(a[0] + (b[0] - a[0]) * t), set: Math.round(a[1] + (b[1] - a[1]) * t) }
}
