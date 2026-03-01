import { applyVariability } from './processTime.js'

/**
 * Create a simulation pipeline with process steps
 * @param {Object} config
 * @param {Array<{name: string, processTime: number, wipLimit?: number, workerCount?: number}>} config.steps
 * @param {number} [config.wipLimit] - Default max total items (active + queue) per step (Infinity = no limit)
 * @param {number} [config.workerCount] - Default max items actively processed per step (Infinity = no limit)
 * @param {number} [config.processTimeSpread] - Variability (0-1)
 * @param {Object} [config.rework] - Optional rework loop config
 * @param {number} config.rework.fromStep - Step index where rework is detected
 * @param {number} config.rework.toStep - Step index to send item back to
 * @param {number} config.rework.maxRetries - Max rework cycles (0-N assigned randomly)
 * @returns {Object} Pipeline instance
 */
export const createPipeline = ({
  steps,
  wipLimit,
  workerCount,
  processTimeSpread = 0,
  rework,
}) => {
  let tick = 0
  const completed = []
  const incoming = []

  const effectiveWorkerCount = workerCount ?? Infinity
  const effectiveWipLimit = wipLimit ?? Infinity

  const pipelineSteps = steps.map((s) => ({
    name: s.name,
    baseProcessTime: s.processTime,
    wipLimit: s.wipLimit ?? effectiveWipLimit,
    workerCount: s.workerCount ?? effectiveWorkerCount,
    queue: [],
    active: [],
  }))

  const addWorkItem = (item) => {
    const workItem = {
      ...item,
      entryTick: null,
      completionTick: null,
      totalProcessTime: 0,
    }
    if (rework) {
      workItem.retriesRemaining = Math.floor(
        Math.random() * (rework.maxRetries + 1),
      )
    }
    incoming.push(workItem)
  }

  const processTick = () => {
    tick++

    // Phase 1: advance active items (process work)
    // Process back-to-front so completed items can move downstream
    for (let i = pipelineSteps.length - 1; i >= 0; i--) {
      const step = pipelineSteps[i]
      const stillActive = []

      for (const item of step.active) {
        item.remaining--
        if (item.remaining <= 0) {
          // Check for rework loop
          if (rework && i === rework.fromStep && item.retriesRemaining > 0) {
            item.retriesRemaining--
            pipelineSteps[rework.toStep].queue.push(item)
          } else if (i < pipelineSteps.length - 1) {
            const nextStep = pipelineSteps[i + 1]
            const nextTotal = nextStep.active.length + nextStep.queue.length
            if (nextTotal < nextStep.wipLimit) {
              nextStep.queue.push(item)
            } else {
              // Blocked — keep in current step, retry next tick
              item.remaining = 0
              stillActive.push(item)
            }
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

    // Phase 2: pull from queues into active slots (respecting worker count)
    for (const step of pipelineSteps) {
      while (step.queue.length > 0 && step.active.length < step.workerCount) {
        const item = step.queue.shift()
        item.remaining = applyVariability(
          step.baseProcessTime,
          processTimeSpread,
        )
        item.totalProcessTime += item.remaining
        step.active.push(item)
      }
    }

    // Phase 3: admit incoming items into first step (respecting WIP limit)
    const firstStep = pipelineSteps[0]
    while (incoming.length > 0) {
      const firstTotal = firstStep.active.length + firstStep.queue.length
      if (firstTotal >= firstStep.wipLimit) break
      const item = incoming.shift()
      item.entryTick = tick
      if (firstStep.active.length < firstStep.workerCount) {
        item.remaining = applyVariability(
          firstStep.baseProcessTime,
          processTimeSpread,
        )
        item.totalProcessTime += item.remaining
        firstStep.active.push(item)
      } else {
        firstStep.queue.push(item)
      }
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
