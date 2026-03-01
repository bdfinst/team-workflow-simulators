import { describe, it, expect } from 'vitest'
import { createPipeline } from '../../../src/lib/simulation/createPipeline.js'
import { snapshotPipeline } from '../../../src/lib/simulation/snapshotPipeline.js'

describe('snapshotPipeline', () => {
  const defaultSteps = [
    { name: 'Development', processTime: 2 },
    { name: 'Testing', processTime: 1 },
  ]

  it('returns new array references for steps', () => {
    const pipeline = createPipeline({ steps: defaultSteps })
    pipeline.addWorkItem({ id: 'item-1' })
    pipeline.tick()

    const snapshot = snapshotPipeline(pipeline)
    const steps = snapshot.getSteps()

    expect(steps).not.toBe(pipeline.getSteps())
    expect(steps[0].queue).not.toBe(pipeline.getSteps()[0].queue)
    expect(steps[0].active).not.toBe(pipeline.getSteps()[0].active)
  })

  it('returns new array reference for completed', () => {
    const pipeline = createPipeline({ steps: defaultSteps })
    pipeline.addWorkItem({ id: 'item-1' })
    for (let i = 0; i < 4; i++) pipeline.tick()

    const snapshot = snapshotPipeline(pipeline)
    expect(snapshot.getCompleted()).not.toBe(pipeline.getCompleted())
    expect(snapshot.getCompleted()).toHaveLength(1)
  })

  it('preserves step metadata', () => {
    const pipeline = createPipeline({
      steps: defaultSteps,
      wipLimit: 5,
      workerCount: 2,
    })

    const snapshot = snapshotPipeline(pipeline)
    const step = snapshot.getSteps()[0]

    expect(step.name).toBe('Development')
    expect(step.baseProcessTime).toBe(2)
    expect(step.wipLimit).toBe(5)
    expect(step.workerCount).toBe(2)
  })

  it('reports incoming count', () => {
    const pipeline = createPipeline({
      steps: defaultSteps,
      wipLimit: 1,
      workerCount: 1,
    })
    pipeline.addWorkItem({ id: 'item-1' })
    pipeline.addWorkItem({ id: 'item-2' })
    pipeline.addWorkItem({ id: 'item-3' })
    pipeline.tick()

    const snapshot = snapshotPipeline(pipeline)
    expect(snapshot.incomingCount).toBe(2)
  })
})
