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

/**
 * Create a plain-data snapshot of a pipeline for reactive UI consumption.
 * Returns new object/array references so Svelte detects the change.
 */
const snapshotPipeline = (pipeline) => {
  const steps = pipeline.getSteps().map((s) => ({
    name: s.name,
    baseProcessTime: s.baseProcessTime,
    wipLimit: s.wipLimit,
    workerCount: s.workerCount,
    queue: [...s.queue],
    active: [...s.active],
  }))

  const completed = [...pipeline.getCompleted()]
  const incomingCount = pipeline.getIncoming().length

  return {
    getSteps: () => steps,
    getCompleted: () => completed,
    incomingCount,
  }
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

  // Internal engine references (not reactive — mutated in place)
  let unboundedEngine = null
  let wipLimitedEngine = null

  const reset = () => {
    stop()

    unboundedEngine = createPipeline({
      steps: DEFAULT_STEPS,
      workerCount: config.wipLimit,
      processTimeSpread: config.processTimeSpread,
    })

    wipLimitedEngine = createPipeline({
      steps: DEFAULT_STEPS,
      wipLimit: config.wipLimit,
      workerCount: config.wipLimit,
      processTimeSpread: config.processTimeSpread,
    })

    unboundedPipeline = snapshotPipeline(unboundedEngine)
    wipLimitedPipeline = snapshotPipeline(wipLimitedEngine)
    unboundedMetrics = calculateMetrics(unboundedEngine)
    wipLimitedMetrics = calculateMetrics(wipLimitedEngine)
    isComplete = false
    itemsAdded = 0
    arrivalAccumulator = 0
  }

  const addItems = () => {
    if (itemsAdded >= config.workItemCount) return

    arrivalAccumulator += config.arrivalRate
    while (arrivalAccumulator >= 1 && itemsAdded < config.workItemCount) {
      const id = `item-${itemsAdded + 1}`
      unboundedEngine.addWorkItem({ id })
      wipLimitedEngine.addWorkItem({ id })
      itemsAdded++
      arrivalAccumulator--
    }
  }

  const tickOnce = () => {
    addItems()
    unboundedEngine.tick()
    wipLimitedEngine.tick()

    // Create new snapshots so Svelte detects the change
    unboundedPipeline = snapshotPipeline(unboundedEngine)
    wipLimitedPipeline = snapshotPipeline(wipLimitedEngine)
    unboundedMetrics = calculateMetrics(unboundedEngine)
    wipLimitedMetrics = calculateMetrics(wipLimitedEngine)

    const allDone =
      unboundedEngine.getCompleted().length >= config.workItemCount &&
      wipLimitedEngine.getCompleted().length >= config.workItemCount

    if (allDone) {
      isComplete = true
      stop()
    }
  }

  const start = () => {
    if (isRunning || isComplete) return
    if (!unboundedEngine) reset()
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
    if (!unboundedEngine) reset()
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
