import { applyVariability } from './processTime.js'

/**
 * Create a simulation pipeline with process steps
 * @param {Object} config
 * @param {Array<{name: string, processTime: number}>} config.steps
 * @param {number} [config.wipLimit] - WIP limit per step (Infinity = no limit)
 * @param {number} [config.processTimeSpread] - Variability (0-1)
 * @returns {Object} Pipeline instance
 */
export const createPipeline = ({ steps, wipLimit, processTimeSpread = 0 }) => {
  let tick = 0
  const completed = []
  const incoming = []

  const pipelineSteps = steps.map((s) => ({
    name: s.name,
    baseProcessTime: s.processTime,
    wipLimit: wipLimit ?? Infinity,
    queue: [],
    active: [],
  }))

  const addWorkItem = (item) => {
    incoming.push({
      ...item,
      entryTick: null,
      completionTick: null,
      totalProcessTime: 0,
    })
  }

  const processTick = () => {
    tick++

    // Phase 1: advance active items (process work)
    for (let i = pipelineSteps.length - 1; i >= 0; i--) {
      const step = pipelineSteps[i]
      const stillActive = []

      for (const item of step.active) {
        item.remaining--
        if (item.remaining <= 0) {
          // Item finished this step — move to next step's queue or complete
          if (i < pipelineSteps.length - 1) {
            pipelineSteps[i + 1].queue.push(item)
          } else {
            item.completionTick = tick
            completed.push(item)
          }
        } else {
          stillActive.push(item)
        }
      }

      step.active = stillActive
    }

    // Phase 2: pull from queues into active slots (respecting WIP limits)
    for (const step of pipelineSteps) {
      while (step.queue.length > 0 && step.active.length < step.wipLimit) {
        const item = step.queue.shift()
        item.remaining = applyVariability(
          step.baseProcessTime,
          processTimeSpread,
        )
        item.totalProcessTime += item.remaining
        step.active.push(item)
      }
    }

    // Phase 3: pull incoming items into first step
    const firstStep = pipelineSteps[0]
    while (
      incoming.length > 0 &&
      firstStep.active.length < firstStep.wipLimit
    ) {
      const item = incoming.shift()
      item.entryTick = tick
      item.remaining = applyVariability(
        firstStep.baseProcessTime,
        processTimeSpread,
      )
      item.totalProcessTime += item.remaining
      firstStep.active.push(item)
    }

    // Any remaining incoming items go to first step's queue
    while (incoming.length > 0) {
      const item = incoming.shift()
      item.entryTick = tick
      firstStep.queue.push(item)
    }
  }

  return {
    tick: processTick,
    addWorkItem,
    getTick: () => tick,
    getSteps: () => pipelineSteps,
    getCompleted: () => completed,
    getIncoming: () => incoming,
  }
}
