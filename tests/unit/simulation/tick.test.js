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

describe('workerCount enforcement', () => {
  const defaultSteps = [
    { name: 'Development', processTime: 3 },
    { name: 'Testing', processTime: 1 },
  ]

  it('does not pull from queue when step is at workerCount', () => {
    const pipeline = createPipeline({ steps: defaultSteps, workerCount: 1 })
    pipeline.addWorkItem({ id: 'item-1' })
    pipeline.addWorkItem({ id: 'item-2' })
    pipeline.tick() // item-1 enters Dev active, item-2 in queue
    pipeline.tick()

    const steps = pipeline.getSteps()
    expect(steps[0].active).toHaveLength(1)
    expect(steps[0].queue).toHaveLength(1)
  })

  it('pulls from queue when active count drops below workerCount', () => {
    const pipeline = createPipeline({ steps: defaultSteps, workerCount: 1 })
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

  it('allows unlimited items when no workerCount set', () => {
    const pipeline = createPipeline({ steps: defaultSteps })
    for (let i = 0; i < 10; i++) {
      pipeline.addWorkItem({ id: `item-${i}` })
    }
    pipeline.tick()

    const steps = pipeline.getSteps()
    expect(steps[0].active).toHaveLength(10)
  })
})

describe('WIP limit back-pressure', () => {
  it('blocks item from moving to next step when next step is at WIP limit', () => {
    const pipeline = createPipeline({
      steps: [
        { name: 'Step A', processTime: 1 },
        { name: 'Step B', processTime: 3 },
      ],
      workerCount: 1,
      wipLimit: 1,
    })
    pipeline.addWorkItem({ id: 'item-1' })
    pipeline.addWorkItem({ id: 'item-2' })

    pipeline.tick() // item-1 enters Step A
    pipeline.tick() // item-1 finishes Step A, moves to Step B; item-2 enters Step A
    pipeline.tick() // item-2 finishes Step A, but Step B is at wipLimit=1 — blocked

    const steps = pipeline.getSteps()
    // item-2 should be blocked in Step A with remaining=0
    expect(steps[0].active).toHaveLength(1)
    expect(steps[0].active[0].id).toBe('item-2')
    expect(steps[0].active[0].remaining).toBe(0)
    // Step B should have exactly 1 item
    expect(steps[1].active.length + steps[1].queue.length).toBe(1)
  })

  it('unblocks item when next step has capacity again', () => {
    const pipeline = createPipeline({
      steps: [
        { name: 'Step A', processTime: 1 },
        { name: 'Step B', processTime: 2 },
      ],
      workerCount: 1,
      wipLimit: 1,
    })
    pipeline.addWorkItem({ id: 'item-1' })
    pipeline.addWorkItem({ id: 'item-2' })

    pipeline.tick() // item-1 enters Step A
    pipeline.tick() // item-1 → Step B; item-2 enters Step A
    pipeline.tick() // item-2 finishes Step A, blocked (Step B full)
    pipeline.tick() // Step B still processing item-1, item-2 still blocked
    pipeline.tick() // item-1 completes Step B, item-2 moves to Step B

    const steps = pipeline.getSteps()
    expect(steps[1].active.length + steps[1].queue.length).toBe(1)
    expect(pipeline.getCompleted()).toHaveLength(1)
    expect(pipeline.getCompleted()[0].id).toBe('item-1')
  })

  it('holds incoming items when first step is at WIP limit', () => {
    const pipeline = createPipeline({
      steps: [{ name: 'Step A', processTime: 2 }],
      workerCount: 1,
      wipLimit: 1,
    })
    pipeline.addWorkItem({ id: 'item-1' })
    pipeline.addWorkItem({ id: 'item-2' })
    pipeline.addWorkItem({ id: 'item-3' })

    pipeline.tick() // item-1 enters Step A; items 2,3 held in incoming

    const steps = pipeline.getSteps()
    expect(steps[0].active).toHaveLength(1)
    expect(steps[0].queue).toHaveLength(0)
    expect(pipeline.getIncoming()).toHaveLength(2)
    // Held items should not have entryTick set
    expect(pipeline.getIncoming()[0].entryTick).toBeNull()
  })
})
