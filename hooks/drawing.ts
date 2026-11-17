import type { Sky } from './palette'

// Fixed star field: a small seeded generator, so the stars never jump.
const STARS = (() => {
  let seed = 7
  const next = () => {
    seed = (seed * 16807) % 2147483647

    return seed / 2147483647
  }

  return Array.from({ length: 70 }, (_, i) => ({
    x: Math.round(next() * 1600),
    y: Math.round(next() * 560),
    r: (0.6 + next() * 1.3).toFixed(2),
    delay: (next() * 6).toFixed(2),
    group: i % 3,
  }))
})()

const f = (n: number) => n.toFixed(1)

export function skySvg(sky: Sky): string {
  const stars =
    sky.stars > 0.01
      ? `<g opacity="${sky.stars.toFixed(3)}" fill="#ffffff">${STARS.map(
          s => `<circle class="tw tw${s.group}" style="animation-delay:-${s.delay}s" cx="${s.x}" cy="${s.y}" r="${s.r}"/>`,
        ).join('')}</g>`
      : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
<style>
.drift-a{animation:drift 70s ease-in-out infinite alternate}
.drift-b{animation:drift 95s ease-in-out infinite alternate-reverse}
.tw{animation:twinkle 5s ease-in-out infinite}
.tw1{animation-duration:7s}
.tw2{animation-duration:9s}
@keyframes drift{from{transform:translateX(-40px)}to{transform:translateX(40px)}}
@keyframes twinkle{0%,100%{opacity:1}50%{opacity:.35}}
@media (prefers-reduced-motion: reduce){.drift-a,.drift-b,.tw{animation:none}}
</style>
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="${sky.top}"/>
<stop offset="0.55" stop-color="${sky.mid}"/>
<stop offset="1" stop-color="${sky.low}"/>
</linearGradient>
<radialGradient id="glow">
<stop offset="0" stop-color="${sky.glow}" stop-opacity="${sky.glowOpacity.toFixed(3)}"/>
<stop offset="1" stop-color="${sky.glow}" stop-opacity="0"/>
</radialGradient>
<filter id="soft" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="46"/></filter>
</defs>
<rect width="1600" height="1000" fill="url(#sky)"/>
<circle cx="${f(sky.gx)}" cy="${f(sky.gy)}" r="${f(sky.gr)}" fill="url(#glow)"/>
${stars}
<g filter="url(#soft)" fill="${sky.haze}" opacity="${sky.hazeOpacity.toFixed(3)}">
<g class="drift-a"><ellipse cx="260" cy="930" rx="420" ry="90"/><ellipse cx="1180" cy="960" rx="520" ry="80"/></g>
<g class="drift-b"><ellipse cx="760" cy="1000" rx="560" ry="110"/><ellipse cx="1500" cy="880" rx="300" ry="60"/></g>
</g>
</svg>`
}
