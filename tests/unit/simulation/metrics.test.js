import { describe, it, expect } from 'vitest'
import { createPipeline } from '../../../src/lib/simulation/createPipeline.js'
import { calculateMetrics } from '../../../src/lib/simulation/metrics.js'

describe('calculateMetrics', () => {
  const defaultSteps = [
    { name: 'Development', processTime: 2 },
    { name: 'Testing', processTime: 1 },
  ]

  it('returns zero metrics for an empty pipeline', () => {
    const pipeline = createPipeline({ steps: defaultSteps })
    const metrics = calculateMetrics(pipeline)

    expect(metrics.wipCount).toBe(0)
    expect(metrics.avgLeadTime).toBe(0)
    expect(metrics.throughput).toBe(0)
    expect(metrics.itemsCompleted).toBe(0)
    expect(metrics.flowEfficiency).toBe(0)
  })

  it('counts all in-progress items as WIP', () => {
    const pipeline = createPipeline({ steps: defaultSteps })
    pipeline.addWorkItem({ id: 'item-1' })
    pipeline.addWorkItem({ id: 'item-2' })
    pipeline.addWorkItem({ id: 'item-3' })
    pipeline.tick()

    const metrics = calculateMetrics(pipeline)
    expect(metrics.wipCount).toBe(3)
  })

  it('calculates average lead time from completed items', () => {
    const pipeline = createPipeline({ steps: defaultSteps })
    pipeline.addWorkItem({ id: 'item-1' })
    // Dev: 2 ticks + Testing: 1 tick = 3 ticks lead time
    pipeline.tick() // tick 1: enters Dev
    pipeline.tick() // tick 2
    pipeline.tick() // tick 3: enters Testing
    pipeline.tick() // tick 4: completed

    const metrics = calculateMetrics(pipeline)
    expect(metrics.avgLeadTime).toBe(3) // ticks 1-4 = 3 ticks
    expect(metrics.itemsCompleted).toBe(1)
  })

  it('calculates throughput as items completed per tick', () => {
    const pipeline = createPipeline({ steps: defaultSteps })
    pipeline.addWorkItem({ id: 'item-1' })
    pipeline.tick()
    pipeline.tick()
    pipeline.tick()
    pipeline.tick() // 1 item completed in 4 ticks

    const metrics = calculateMetrics(pipeline)
    expect(metrics.throughput).toBeCloseTo(0.25, 2)
  })

  it('calculates queue depth per step', () => {
    const pipeline = createPipeline({ steps: defaultSteps, workerCount: 1 })
    pipeline.addWorkItem({ id: 'item-1' })
    pipeline.addWorkItem({ id: 'item-2' })
    pipeline.addWorkItem({ id: 'item-3' })
    pipeline.tick()

    const metrics = calculateMetrics(pipeline)
    expect(metrics.queueDepths).toHaveLength(2)
    expect(metrics.queueDepths[0]).toEqual({
      name: 'Development',
      depth: 2,
    })
  })

  it('calculates flow efficiency as process time / lead time', () => {
    const pipeline = createPipeline({ steps: defaultSteps })
    pipeline.addWorkItem({ id: 'item-1' })
    pipeline.tick()
    pipeline.tick()
    pipeline.tick()
    pipeline.tick()

    const metrics = calculateMetrics(pipeline)
    // Total process time = 2 + 1 = 3, lead time = 3
    // flow efficiency = 3/3 = 1.0 (100%) when no waiting
    expect(metrics.flowEfficiency).toBeGreaterThan(0)
    expect(metrics.flowEfficiency).toBeLessThanOrEqual(1)
  })
})
