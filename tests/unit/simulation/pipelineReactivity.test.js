import { describe, it, expect } from 'vitest'
import { createPipeline } from '../../../src/lib/simulation/createPipeline.js'

/**
 * These tests verify that pipeline state changes are observable by consumers.
 *
 * For Svelte 5 reactivity to work, state changes must be detectable — either
 * through new object/array references or through property mutations on a
 * proxied object. Closures bypass Svelte's $state proxy entirely.
 *
 * The current pipeline returns closure state via getSteps()/getCompleted(),
 * which means Svelte cannot track reads or detect mutations.
 */

const twoSteps = [
  { name: 'Development', processTime: 2 },
  { name: 'Testing', processTime: 1 },
]

describe('pipeline state change detection', () => {
  describe('getSteps() reference identity', () => {
    it('returns the same array reference before and after tick', () => {
      const pipeline = createPipeline({ steps: twoSteps })
      pipeline.addWorkItem({ id: 'item-1' })

      const stepsBefore = pipeline.getSteps()
      pipeline.tick()
      const stepsAfter = pipeline.getSteps()

      // Same reference means Svelte $state proxy cannot detect the change
      expect(stepsBefore).toBe(stepsAfter)
    })

    it('returns the same step objects before and after tick', () => {
      const pipeline = createPipeline({ steps: twoSteps })
      pipeline.addWorkItem({ id: 'item-1' })

      const stepBefore = pipeline.getSteps()[0]
      pipeline.tick()
      const stepAfter = pipeline.getSteps()[0]

      // Same step object reference — mutations within are invisible to Svelte
      expect(stepBefore).toBe(stepAfter)
    })
  })

  describe('getCompleted() reference identity', () => {
    it('returns the same array reference before and after items complete', () => {
      const pipeline = createPipeline({ steps: twoSteps })
      pipeline.addWorkItem({ id: 'item-1' })

      const completedBefore = pipeline.getCompleted()

      // Tick enough times to complete: Dev(2) + Testing(1) + 1 to enter = 4
      for (let i = 0; i < 4; i++) pipeline.tick()

      const completedAfter = pipeline.getCompleted()

      expect(completedAfter).toHaveLength(1)
      // Same array reference — push() mutates in place, undetectable by Svelte
      expect(completedBefore).toBe(completedAfter)
    })
  })

  describe('queue mutations are in-place', () => {
    it('mutates the queue array via push/shift rather than replacing', () => {
      const pipeline = createPipeline({ steps: twoSteps, wipLimit: 1 })
      pipeline.addWorkItem({ id: 'item-1' })
      pipeline.addWorkItem({ id: 'item-2' })
      pipeline.tick()

      const step = pipeline.getSteps()[0]
      const queueRef = step.queue

      // item-2 should be in queue because wipLimit=1
      expect(queueRef).toHaveLength(1)

      // Tick until item-1 finishes Development (2 more ticks)
      pipeline.tick()
      pipeline.tick()

      // Queue was mutated via shift() — same reference, different contents
      expect(step.queue).toBe(queueRef)
      expect(step.queue).toHaveLength(0)
    })
  })
})

describe('pipeline state content does change after tick', () => {
  it('moves items into active after first tick', () => {
    const pipeline = createPipeline({ steps: twoSteps })
    pipeline.addWorkItem({ id: 'item-1' })

    expect(pipeline.getSteps()[0].active).toHaveLength(0)
    pipeline.tick()
    expect(pipeline.getSteps()[0].active).toHaveLength(1)
  })

  it('changes queue depth as items arrive and move through steps', () => {
    const pipeline = createPipeline({ steps: twoSteps, wipLimit: 1 })
    pipeline.addWorkItem({ id: 'item-1' })
    pipeline.addWorkItem({ id: 'item-2' })
    pipeline.addWorkItem({ id: 'item-3' })
    pipeline.tick()

    const steps = pipeline.getSteps()
    expect(steps[0].active).toHaveLength(1)
    expect(steps[0].queue).toHaveLength(2)

    // After enough ticks, queue should drain
    for (let i = 0; i < 10; i++) pipeline.tick()
    expect(steps[0].queue.length).toBeLessThan(2)
  })

  it('increments completed count as items finish the pipeline', () => {
    const pipeline = createPipeline({ steps: twoSteps })
    pipeline.addWorkItem({ id: 'item-1' })

    expect(pipeline.getCompleted()).toHaveLength(0)

    // Dev(2) + Testing(1) + 1 to enter = 4 ticks
    for (let i = 0; i < 4; i++) pipeline.tick()

    expect(pipeline.getCompleted()).toHaveLength(1)
  })
})
