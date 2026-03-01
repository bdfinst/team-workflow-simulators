import { describe, it, expect, vi } from 'vitest'
import { createPipeline } from '../../../src/lib/simulation/createPipeline.js'

describe('rework mechanics', () => {
  const twoStepPipeline = [
    { name: 'Development', processTime: 2 },
    { name: 'Code Review', processTime: 1 },
  ]

  it('assigns retriesRemaining to work items when rework is configured', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const pipeline = createPipeline({
      steps: twoStepPipeline,
      rework: { fromStep: 1, toStep: 0, maxRetries: 2 },
    })
    pipeline.addWorkItem({ id: 'item-1' })
    pipeline.tick()

    const item = pipeline.getSteps()[0].active[0]
    expect(item.retriesRemaining).toBeDefined()
    expect(item.retriesRemaining).toBeGreaterThanOrEqual(0)
    expect(item.retriesRemaining).toBeLessThanOrEqual(2)
    vi.restoreAllMocks()
  })

  it('does not assign retriesRemaining when rework is not configured', () => {
    const pipeline = createPipeline({ steps: twoStepPipeline })
    pipeline.addWorkItem({ id: 'item-1' })
    pipeline.tick()

    const item = pipeline.getSteps()[0].active[0]
    expect(item.retriesRemaining).toBeUndefined()
  })

  it('sends item back to target step when retries remain', () => {
    // Force max retries so item always loops back
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const pipeline = createPipeline({
      steps: twoStepPipeline,
      rework: { fromStep: 1, toStep: 0, maxRetries: 2 },
    })
    pipeline.addWorkItem({ id: 'item-1' })

    // Dev: processTime=2
    pipeline.tick() // enters Dev
    pipeline.tick() // Dev remaining=1
    pipeline.tick() // Dev done, enters Review queue; pulled into active
    // Review: processTime=1
    pipeline.tick() // Review done, should loop back to Dev

    const steps = pipeline.getSteps()
    const devItems = steps[0].queue.length + steps[0].active.length
    expect(devItems).toBe(1)
    expect(pipeline.getCompleted()).toHaveLength(0)

    vi.restoreAllMocks()
  })

  it('lets item proceed when retries are zero', () => {
    // Force 0 retries
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const pipeline = createPipeline({
      steps: [
        { name: 'Development', processTime: 1 },
        { name: 'Code Review', processTime: 1 },
      ],
      rework: { fromStep: 1, toStep: 0, maxRetries: 2 },
    })
    pipeline.addWorkItem({ id: 'item-1' })

    pipeline.tick() // enters Dev
    pipeline.tick() // Dev done, enters Review
    pipeline.tick() // Review done, should complete (0 retries)

    expect(pipeline.getCompleted()).toHaveLength(1)
    expect(pipeline.getCompleted()[0].id).toBe('item-1')

    vi.restoreAllMocks()
  })

  it('decrements retriesRemaining on each rework loop', () => {
    // Force max retries = 1
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const pipeline = createPipeline({
      steps: [
        { name: 'Development', processTime: 1 },
        { name: 'Code Review', processTime: 1 },
      ],
      rework: { fromStep: 1, toStep: 0, maxRetries: 1 },
    })
    pipeline.addWorkItem({ id: 'item-1' })

    pipeline.tick() // enters Dev
    pipeline.tick() // Dev done → Review
    pipeline.tick() // Review done → rework back to Dev (retries: 1→0)
    pipeline.tick() // Dev again
    pipeline.tick() // Dev done → Review
    pipeline.tick() // Review done → completes (retries: 0)

    expect(pipeline.getCompleted()).toHaveLength(1)

    vi.restoreAllMocks()
  })

  it('supports rework to same step (pair programming)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const pipeline = createPipeline({
      steps: [
        { name: 'Develop & Review', processTime: 2 },
        { name: 'Testing', processTime: 1 },
      ],
      rework: { fromStep: 0, toStep: 0, maxRetries: 1 },
    })
    pipeline.addWorkItem({ id: 'item-1' })

    pipeline.tick() // enters Develop & Review
    pipeline.tick() // remaining=1
    pipeline.tick() // done, rework back to same step queue (retries: 1→0)

    const steps = pipeline.getSteps()
    const step0items = steps[0].queue.length + steps[0].active.length
    expect(step0items).toBe(1)

    // Complete the rework + rest of pipeline
    pipeline.tick() // re-enters Develop & Review active
    pipeline.tick() // remaining=1
    pipeline.tick() // done, no retries left → Testing queue
    pipeline.tick() // Testing done → completed

    expect(pipeline.getCompleted()).toHaveLength(1)

    vi.restoreAllMocks()
  })

  it('rework items bypass WIP limits', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const pipeline = createPipeline({
      steps: [
        { name: 'Development', processTime: 2 },
        { name: 'Code Review', processTime: 1 },
      ],
      wipLimit: 1,
      workerCount: 1,
      rework: { fromStep: 1, toStep: 0, maxRetries: 1 },
    })
    pipeline.addWorkItem({ id: 'item-1' })
    pipeline.addWorkItem({ id: 'item-2' })

    pipeline.tick() // item-1 enters Dev; item-2 held (WIP=1)
    pipeline.tick() // item-1 Dev remaining=1
    pipeline.tick() // item-1 Dev done → Review; item-2 enters Dev
    pipeline.tick() // item-1 Review done → rework to Dev queue; item-2 still in Dev

    const steps = pipeline.getSteps()
    // Dev should have item-2 active + item-1 in queue (rework bypassed WIP=1)
    const devTotal = steps[0].queue.length + steps[0].active.length
    expect(devTotal).toBe(2)

    vi.restoreAllMocks()
  })
})
