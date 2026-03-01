import { describe, it, expect } from 'vitest'
import {
  WIP_GREEN_MAX,
  WIP_AMBER_MAX,
} from '../../../src/lib/simulation/thresholds.js'

describe('WIP thresholds', () => {
  it('green threshold is less than amber threshold', () => {
    expect(WIP_GREEN_MAX).toBeLessThan(WIP_AMBER_MAX)
  })

  it('exports expected values', () => {
    expect(WIP_GREEN_MAX).toBe(3)
    expect(WIP_AMBER_MAX).toBe(8)
  })
})
