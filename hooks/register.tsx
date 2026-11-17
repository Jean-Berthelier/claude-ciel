import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { SkyClock } from '../types'
import { skySvg } from './drawing'
import { skyAt } from './palette'
import { sunFor } from './sun'

// A sky behind the conversation whose gradient follows the local time: night,
// first light, sunrise, morning, midday, afternoon, golden hour, dusk.

const PLUGIN = 'ciel'
const SCENE = 'ciel'
const TICK_MS = 5 * 60 * 1000

const clock = atom({ plugin: 'ciel', key: 'clock' } as const, { minute: 720, rise: 450, set: 1050 })

async function readClock($: EngineInterface): Promise<SkyClock> {
  // The host's clock knows the local time zone; the module's own may not.
  try {
    const { exitCode, stdout } = await $.process.run(['date', '+%H %M %m %d'], { timeoutMs: 5000 })
    const parts = stdout.trim().split(/\s+/).map(Number)

    if (exitCode === 0 && parts.length === 4 && parts.every(n => Number.isFinite(n))) {
      const [hour, minute, month, day] = parts as [number, number, number, number]

      return { minute: hour * 60 + minute, ...sunFor(month, day) }
    }
  } catch {
    // Fall through to the module's clock.
  }
  const now = new Date(await $.clock.now())

  return { minute: now.getHours() * 60 + now.getMinutes(), ...sunFor(now.getMonth() + 1, now.getDate()) }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const now = await readClock($)
    await update($, clock, () => now)

    const set = await $.theme.set({ backdrop: { scene: SCENE, glass: { blur: 24, opacity: 0.55 } } })

    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }

    // Every five minutes, move the sky along.
    $.clock.every(TICK_MS, async () => {
      const later = await readClock($)
      await update($, clock, () => later)
    })

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    if (e.props.plugin !== PLUGIN || e.props.scene !== SCENE) {
      return next(e)
    }
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)
    const sky = skyAt(await read($, clock))

    return <Svg source={skySvg(sky)} alt="A sky whose colors follow the time of day" isInteractive />
  })
}
