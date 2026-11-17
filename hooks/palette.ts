import type { SkyClock } from '../types'

// The skies. Our own palette, one per moment of the day.
export type Sky = {
  top: string
  mid: string
  low: string
  glow: string
  gx: number
  gy: number
  gr: number
  glowOpacity: number
  stars: number
  haze: string
  hazeOpacity: number
}

const NIGHT: Sky = {
  top: '#0a0f24', mid: '#18204a', low: '#2a2d5c',
  glow: '#b9c6ff', gx: 1250, gy: 180, gr: 260, glowOpacity: 0.16,
  stars: 1, haze: '#3a3f75', hazeOpacity: 0.25,
}
const FIRST_LIGHT: Sky = {
  top: '#1a1e4a', mid: '#3f3b78', low: '#9a6f98',
  glow: '#ffb8a0', gx: 250, gy: 950, gr: 520, glowOpacity: 0.3,
  stars: 0.55, haze: '#b98aa8', hazeOpacity: 0.3,
}
const SUNRISE: Sky = {
  top: '#4e66ad', mid: '#d99aa8', low: '#ffd0a6',
  glow: '#ffe2b8', gx: 300, gy: 880, gr: 600, glowOpacity: 0.6,
  stars: 0, haze: '#ffe6d6', hazeOpacity: 0.45,
}
const MORNING: Sky = {
  top: '#6fa6e2', mid: '#aacdf0', low: '#f1e5dc',
  glow: '#fff3df', gx: 450, gy: 420, gr: 600, glowOpacity: 0.4,
  stars: 0, haze: '#ffffff', hazeOpacity: 0.55,
}
const MIDDAY: Sky = {
  top: '#4f95dc', mid: '#9fc7ee', low: '#e4f0fa',
  glow: '#ffffff', gx: 800, gy: 120, gr: 650, glowOpacity: 0.35,
  stars: 0, haze: '#ffffff', hazeOpacity: 0.6,
}
const AFTERNOON: Sky = {
  top: '#6a9cd6', mid: '#afcbe9', low: '#f1e2cd',
  glow: '#fff1d6', gx: 1150, gy: 380, gr: 600, glowOpacity: 0.4,
  stars: 0, haze: '#ffffff', hazeOpacity: 0.55,
}
const GOLDEN: Sky = {
  top: '#6577bd', mid: '#eeaf8c', low: '#ffd49a',
  glow: '#ffd38e', gx: 1300, gy: 820, gr: 620, glowOpacity: 0.6,
  stars: 0, haze: '#ffe4c4', hazeOpacity: 0.5,
}
const DUSK: Sky = {
  top: '#2b3270', mid: '#85599a', low: '#e48c7c',
  glow: '#ff9c80', gx: 1350, gy: 950, gr: 520, glowOpacity: 0.35,
  stars: 0.3, haze: '#b4789a', hazeOpacity: 0.35,
}

function keyframes(rise: number, set: number): readonly (readonly [number, Sky])[] {
  return [
    [rise - 80, NIGHT],
    [rise - 35, FIRST_LIGHT],
    [rise, SUNRISE],
    [rise + 100, MORNING],
    [Math.round((rise + set) / 2), MIDDAY],
    [set - 150, AFTERNOON],
    [set - 45, GOLDEN],
    [set + 15, DUSK],
    [set + 75, NIGHT],
  ]
}

function hex(color: string): [number, number, number] {
  const n = parseInt(color.slice(1), 16)

  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function mixColor(a: string, b: string, t: number): string {
  const x = hex(a)
  const y = hex(b)
  const out = x.map((v, i) => Math.round(v + (y[i]! - v) * t))

  return `#${out.map(v => v.toString(16).padStart(2, '0')).join('')}`
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// Smooth at both ends, so one sky melts into the next.
function ease(t: number): number {
  return t * t * (3 - 2 * t)
}

export function skyAt({ minute, rise, set }: SkyClock): Sky {
  const frames = keyframes(rise, set)
  const first = frames[0]!
  const last = frames[frames.length - 1]!

  if (minute <= first[0] || minute >= last[0]) {
    return NIGHT
  }
  for (let i = 0; i < frames.length - 1; i++) {
    const [from, a] = frames[i]!
    const [to, b] = frames[i + 1]!

    if (minute >= from && minute < to) {
      const t = ease((minute - from) / (to - from))

      return {
        top: mixColor(a.top, b.top, t),
        mid: mixColor(a.mid, b.mid, t),
        low: mixColor(a.low, b.low, t),
        glow: mixColor(a.glow, b.glow, t),
        gx: mix(a.gx, b.gx, t),
        gy: mix(a.gy, b.gy, t),
        gr: mix(a.gr, b.gr, t),
        glowOpacity: mix(a.glowOpacity, b.glowOpacity, t),
        stars: mix(a.stars, b.stars, t),
        haze: mixColor(a.haze, b.haze, t),
        hazeOpacity: mix(a.hazeOpacity, b.hazeOpacity, t),
      }
    }
  }

  return NIGHT
}
