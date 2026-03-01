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

  it('applies workerCount when provided', () => {
    const pipeline = createPipeline({ steps: defaultSteps, workerCount: 2 })

    pipeline.getSteps().forEach((step) => {
      expect(step.workerCount).toBe(2)
    })
  })

  it('has no workerCount limit by default', () => {
    const pipeline = createPipeline({ steps: defaultSteps })

    pipeline.getSteps().forEach((step) => {
      expect(step.workerCount).toBe(Infinity)
    })
  })

  it('supports independent workerCount and wipLimit', () => {
    const pipeline = createPipeline({
      steps: defaultSteps,
      workerCount: 2,
      wipLimit: 5,
    })

    pipeline.getSteps().forEach((step) => {
      expect(step.workerCount).toBe(2)
      expect(step.wipLimit).toBe(5)
    })
  })

  it('tracks current tick starting at zero', () => {
    const pipeline = createPipeline({ steps: defaultSteps })

    expect(pipeline.getTick()).toBe(0)
  })

  it('applies per-step workerCount override', () => {
    const steps = [
      { name: 'Dev', processTime: 4, workerCount: 2 },
      { name: 'Test', processTime: 3 },
    ]
    const pipeline = createPipeline({ steps, workerCount: 5 })

    expect(pipeline.getSteps()[0].workerCount).toBe(2)
    expect(pipeline.getSteps()[1].workerCount).toBe(5)
  })

  it('applies per-step wipLimit override', () => {
    const steps = [
      { name: 'Dev', processTime: 4, wipLimit: 3 },
      { name: 'Test', processTime: 3 },
    ]
    const pipeline = createPipeline({ steps, wipLimit: 10 })

    expect(pipeline.getSteps()[0].wipLimit).toBe(3)
    expect(pipeline.getSteps()[1].wipLimit).toBe(10)
  })
})
