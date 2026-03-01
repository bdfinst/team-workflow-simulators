import { describe, it, expect } from 'vitest'
import { applyVariability } from '../../../src/lib/simulation/processTime.js'

describe('applyVariability', () => {
  it('returns base time when spread is 0', () => {
    const result = applyVariability(10, 0)
    expect(result).toBe(10)
  })

  it('returns a value within the spread range', () => {
    for (let i = 0; i < 100; i++) {
      const result = applyVariability(10, 0.3)
      expect(result).toBeGreaterThanOrEqual(7)
      expect(result).toBeLessThanOrEqual(13)
    }
  })

  it('always returns at least 1', () => {
    const result = applyVariability(1, 1.0)
    expect(result).toBeGreaterThanOrEqual(1)
  })

  it('returns an integer', () => {
    for (let i = 0; i < 50; i++) {
      const result = applyVariability(10, 0.5)
      expect(Number.isInteger(result)).toBe(true)
    }
  })
})
