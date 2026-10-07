import { describe, expect, it } from 'vitest'
import {
  formatDecimalOdds,
  formatSastDateTime,
  impliedProbability,
  isoToSastLocalInput,
  sastLocalInputToIso,
} from '@/lib/format'

describe('SAST formatting', () => {
  it('shows UTC instants in South African time', () => {
    expect(formatSastDateTime('2026-10-07T22:30:00Z')).toBe('08 Oct 2026, 00:30 SAST')
  })

  it('round-trips datetime-local values', () => {
    const iso = sastLocalInputToIso('2026-10-07T09:15')!
    expect(iso).toBe('2026-10-07T07:15:00.000Z')
    expect(isoToSastLocalInput(iso)).toBe('2026-10-07T09:15')
  })

  it('rejects malformed input', () => {
    expect(sastLocalInputToIso('07/10/2026 09:15')).toBeNull()
  })
})

describe('decimal odds', () => {
  it('formats with two decimals and implied probability', () => {
    expect(formatDecimalOdds(2.1)).toBe('2.10')
    expect(impliedProbability(2.5)).toBe('40%')
  })
})
