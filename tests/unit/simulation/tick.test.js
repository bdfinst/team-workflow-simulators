import { describe, it, expect } from 'vitest'
import { createPipeline } from '../../../src/lib/simulation/createPipeline.js'

describe('pipeline tick processing', () => {
  const defaultSteps = [
    { name: 'Development', processTime: 2 },
    { name: 'Testing', processTime: 1 },
  ]

  it('advances the tick counter', () => {
    const pipeline = createPipeline({ steps: defaultSteps })
    pipeline.addWorkItem({ id: 'item-1' })
    pipeline.tick()

    expect(pipeline.getTick()).toBe(1)
  })

  it('moves a new work item into the first step', () => {
    const pipeline = createPipeline({ steps: defaultSteps })
    pipeline.addWorkItem({ id: 'item-1' })
    pipeline.tick()

    const steps = pipeline.getSteps()
    expect(steps[0].active).toHaveLength(1)
    expect(steps[0].active[0].id).toBe('item-1')
  })

  it('decrements remaining time on active items each tick', () => {
    const pipeline = createPipeline({ steps: defaultSteps })
    pipeline.addWorkItem({ id: 'item-1' })
    pipeline.tick() // item enters Development, remaining = 2
    pipeline.tick() // remaining = 1

    const steps = pipeline.getSteps()
    expect(steps[0].active[0].remaining).toBe(1)
  })

  it('moves item to next step queue when processing completes', () => {
    const pipeline = createPipeline({ steps: defaultSteps })
    pipeline.addWorkItem({ id: 'item-1' })
    pipeline.tick() // enters Dev, remaining = 2
    pipeline.tick() // remaining = 1
    pipeline.tick() // remaining = 0, moves to Testing queue

    const steps = pipeline.getSteps()
    expect(steps[0].active).toHaveLength(0)
    expect(steps[1].queue.length + steps[1].active.length).toBe(1)
  })

  it('completes item after passing through all steps', () => {
    const pipeline = createPipeline({ steps: defaultSteps })
    pipeline.addWorkItem({ id: 'item-1' })
    // Dev: 2 ticks, Testing: 1 tick
    pipeline.tick() // enters Dev
    pipeline.tick() // Dev remaining=1
    pipeline.tick() // Dev done, enters Testing
    pipeline.tick() // Testing done, completed

    expect(pipeline.getCompleted()).toHaveLength(1)
    expect(pipeline.getCompleted()[0].id).toBe('item-1')
  })

  it('records entry and completion ticks on work items', () => {
    const pipeline = createPipeline({ steps: defaultSteps })
    pipeline.addWorkItem({ id: 'item-1' })
    pipeline.tick()
    pipeline.tick()
    pipeline.tick()
    pipeline.tick()

    const completed = pipeline.getCompleted()[0]
    expect(completed.entryTick).toBe(1)
    expect(completed.completionTick).toBe(4)
  })
})

describe('WIP limit enforcement', () => {
  const defaultSteps = [
    { name: 'Development', processTime: 3 },
    { name: 'Testing', processTime: 1 },
  ]

  it('does not pull from queue when step is at WIP limit', () => {
    const pipeline = createPipeline({ steps: defaultSteps, wipLimit: 1 })
    pipeline.addWorkItem({ id: 'item-1' })
    pipeline.addWorkItem({ id: 'item-2' })
    pipeline.tick() // item-1 enters Dev
    pipeline.tick() // item-2 should wait in queue

    const steps = pipeline.getSteps()
    expect(steps[0].active).toHaveLength(1)
    expect(steps[0].queue).toHaveLength(1)
  })

  it('pulls from queue when active count drops below WIP limit', () => {
    const pipeline = createPipeline({ steps: defaultSteps, wipLimit: 1 })
    pipeline.addWorkItem({ id: 'item-1' })
    pipeline.addWorkItem({ id: 'item-2' })
    pipeline.tick() // item-1 enters Dev
    pipeline.tick() // Dev remaining=2
    pipeline.tick() // Dev remaining=1
    pipeline.tick() // item-1 done Dev, item-2 enters Dev

    const steps = pipeline.getSteps()
    expect(steps[0].active).toHaveLength(1)
    expect(steps[0].active[0].id).toBe('item-2')
    expect(steps[0].queue).toHaveLength(0)
  })

  it('allows unlimited items when no WIP limit set', () => {
    const pipeline = createPipeline({ steps: defaultSteps })
    for (let i = 0; i < 10; i++) {
      pipeline.addWorkItem({ id: `item-${i}` })
    }
    pipeline.tick()

    const steps = pipeline.getSteps()
    expect(steps[0].active).toHaveLength(10)
  })
})
