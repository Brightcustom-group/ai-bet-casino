import { site } from './site'

const sastDate = new Intl.DateTimeFormat(site.locale, {
  timeZone: site.timeZone,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const sastDateTime = new Intl.DateTimeFormat(site.locale, {
  timeZone: site.timeZone,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** "7 Oct 2026" in South African time. */
export function formatSastDate(value: string | Date): string {
  return sastDate.format(new Date(value))
}

/** "7 Oct 2026, 14:30 SAST". */
export function formatSastDateTime(value: string | Date): string {
  return `${sastDateTime.format(new Date(value))} SAST`
}

/**
 * Converts a SAST wall-clock value from <input type="datetime-local"> ("2026-10-07T14:30")
 * to an ISO timestamp. South Africa has no daylight saving, so the offset is fixed.
 */
export function sastLocalInputToIso(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null
  const date = new Date(`${value}:00+02:00`)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

/** Inverse of sastLocalInputToIso, for pre-filling the form. */
export function isoToSastLocalInput(value: string): string {
  const shifted = new Date(new Date(value).getTime() + 2 * 60 * 60 * 1000)
  return shifted.toISOString().slice(0, 16)
}

/** Decimal odds are always shown with two decimals, e.g. 2.10. */
export function formatDecimalOdds(odds: number): string {
  return odds.toFixed(2)
}

/** Implied probability of decimal odds as a whole percentage, e.g. 2.50 → "40%". */
export function impliedProbability(odds: number): string {
  return `${Math.round((1 / odds) * 100)}%`
}
