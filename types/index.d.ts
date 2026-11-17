// Where the day stands: the local minute of the day (0 to 1439), and today's
// sunrise and sunset as local minutes.
export type SkyClock = { minute: number; rise: number; set: number }

declare module 'claude-code' {
  interface PluginState {
    ciel: { clock: SkyClock }
  }
}
