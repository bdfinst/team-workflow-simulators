import { createPipeline } from '../simulation/createPipeline.js'
import { calculateMetrics } from '../simulation/metrics.js'

const DEFAULT_STEPS = [
  { name: 'Development', processTime: 4 },
  { name: 'Code Review', processTime: 2 },
  { name: 'Testing', processTime: 3 },
  { name: 'Deployment', processTime: 1 },
]

const DEFAULT_CONFIG = {
  wipLimit: 3,
  workItemCount: 20,
  processTimeSpread: 0.3,
  simulationSpeed: 1,
  arrivalRate: 1,
}

function createSimulationStore() {
  let config = $state({ ...DEFAULT_CONFIG })
  let unboundedPipeline = $state(null)
  let wipLimitedPipeline = $state(null)
  let unboundedMetrics = $state(null)
  let wipLimitedMetrics = $state(null)
  let isRunning = $state(false)
  let isComplete = $state(false)
  let intervalId = null
  let itemsAdded = $state(0)
  let arrivalAccumulator = $state(0)

  const reset = () => {
    stop()

    unboundedPipeline = createPipeline({
      steps: DEFAULT_STEPS,
      processTimeSpread: config.processTimeSpread,
    })

    wipLimitedPipeline = createPipeline({
      steps: DEFAULT_STEPS,
      wipLimit: config.wipLimit,
      processTimeSpread: config.processTimeSpread,
    })

    unboundedMetrics = calculateMetrics(unboundedPipeline)
    wipLimitedMetrics = calculateMetrics(wipLimitedPipeline)
    isComplete = false
    itemsAdded = 0
    arrivalAccumulator = 0
  }

  const addItems = () => {
    if (itemsAdded >= config.workItemCount) return

    arrivalAccumulator += config.arrivalRate
    while (arrivalAccumulator >= 1 && itemsAdded < config.workItemCount) {
      const id = `item-${itemsAdded + 1}`
      unboundedPipeline.addWorkItem({ id })
      wipLimitedPipeline.addWorkItem({ id })
      itemsAdded++
      arrivalAccumulator--
    }
  }

  const tickOnce = () => {
    addItems()
    unboundedPipeline.tick()
    wipLimitedPipeline.tick()
    unboundedMetrics = calculateMetrics(unboundedPipeline)
    wipLimitedMetrics = calculateMetrics(wipLimitedPipeline)

    const allDone =
      unboundedPipeline.getCompleted().length >= config.workItemCount &&
      wipLimitedPipeline.getCompleted().length >= config.workItemCount

    if (allDone) {
      isComplete = true
      stop()
    }
  }

  const start = () => {
    if (isRunning || isComplete) return
    if (!unboundedPipeline) reset()
    isRunning = true

    const baseInterval = 200
    const interval = Math.round(baseInterval / config.simulationSpeed)

    intervalId = setInterval(tickOnce, interval)
  }

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    isRunning = false
  }

  const step = () => {
    if (isComplete) return
    if (!unboundedPipeline) reset()
    tickOnce()
  }

  const updateConfig = (key, value) => {
    config = { ...config, [key]: value }
  }

  reset()

  return {
    get config() {
      return config
    },
    get unboundedPipeline() {
      return unboundedPipeline
    },
    get wipLimitedPipeline() {
      return wipLimitedPipeline
    },
    get unboundedMetrics() {
      return unboundedMetrics
    },
    get wipLimitedMetrics() {
      return wipLimitedMetrics
    },
    get isRunning() {
      return isRunning
    },
    get isComplete() {
      return isComplete
    },
    start,
    stop,
    step,
    reset,
    updateConfig,
  }
}

export const simulationStore = createSimulationStore()
