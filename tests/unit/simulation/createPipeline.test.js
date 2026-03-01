import { describe, it, expect } from 'vitest'
import { createPipeline } from '../../../src/lib/simulation/createPipeline.js'

describe('createPipeline', () => {
  const defaultSteps = [
    { name: 'Development', processTime: 4 },
    { name: 'Code Review', processTime: 2 },
    { name: 'Testing', processTime: 3 },
    { name: 'Deployment', processTime: 1 },
  ]

  it('creates a pipeline with the given steps', () => {
    const pipeline = createPipeline({ steps: defaultSteps })

    expect(pipeline.getSteps()).toHaveLength(4)
    expect(pipeline.getSteps()[0].name).toBe('Development')
  })

  it('initializes each step with an empty queue and no active items', () => {
    const pipeline = createPipeline({ steps: defaultSteps })

    pipeline.getSteps().forEach((step) => {
      expect(step.queue).toEqual([])
      expect(step.active).toEqual([])
    })
  })

  it('tracks completed items starting at zero', () => {
    const pipeline = createPipeline({ steps: defaultSteps })

    expect(pipeline.getCompleted()).toEqual([])
  })

  it('applies WIP limits when provided', () => {
    const pipeline = createPipeline({ steps: defaultSteps, wipLimit: 3 })

    pipeline.getSteps().forEach((step) => {
      expect(step.wipLimit).toBe(3)
    })
  })

  it('has no WIP limit by default', () => {
    const pipeline = createPipeline({ steps: defaultSteps })

    pipeline.getSteps().forEach((step) => {
      expect(step.wipLimit).toBe(Infinity)
    })
  })

  it('tracks current tick starting at zero', () => {
    const pipeline = createPipeline({ steps: defaultSteps })

    expect(pipeline.getTick()).toBe(0)
  })
})
