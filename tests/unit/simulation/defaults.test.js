import { describe, it, expect } from 'vitest'
import { DEFAULTS } from '../../../src/lib/simulation/defaults.js'

describe('DEFAULTS', () => {
  it('exports all required default values', () => {
    expect(DEFAULTS.teamSize).toBe(8)
    expect(DEFAULTS.devTime).toBe(4)
    expect(DEFAULTS.reviewTime).toBe(2)
    expect(DEFAULTS.testTime).toBe(3)
    expect(DEFAULTS.deployTime).toBe(1)
    expect(DEFAULTS.processTimeSpread).toBe(0.3)
    expect(DEFAULTS.arrivalRate).toBe(1)
  })

  it('has only positive numeric values', () => {
    for (const value of Object.values(DEFAULTS)) {
      expect(typeof value).toBe('number')
      expect(value).toBeGreaterThan(0)
    }
  })
})
