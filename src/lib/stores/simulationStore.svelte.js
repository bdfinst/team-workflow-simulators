import { createPipeline } from '../simulation/createPipeline.js'
import { calculateMetrics } from '../simulation/metrics.js'
import { snapshotPipeline } from '../simulation/snapshotPipeline.js'
import { DEFAULTS } from '../simulation/defaults.js'

const DEFAULT_CONFIG = {
  teamSize: DEFAULTS.teamSize,
  wipLimit: 3,
  workItemCount: 20,
  devTime: DEFAULTS.devTime,
  reviewTime: DEFAULTS.reviewTime,
  testTime: DEFAULTS.testTime,
  deployTime: DEFAULTS.deployTime,
  processTimeSpread: DEFAULTS.processTimeSpread,
  simulationSpeed: 1,
  arrivalRate: DEFAULTS.arrivalRate,
}

const buildSteps = (config) => [
  { name: 'Development', processTime: config.devTime },
  { name: 'Code Review', processTime: config.reviewTime },
  { name: 'Testing', processTime: config.testTime },
  { name: 'Deployment', processTime: config.deployTime },
]

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

    const steps = buildSteps(config)

    unboundedEngine = createPipeline({
      steps,
      workerCount: config.teamSize,
      processTimeSpread: config.processTimeSpread,
    })

    wipLimitedEngine = createPipeline({
      steps,
      wipLimit: config.wipLimit,
      workerCount: config.teamSize,
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
    if (intervalId || isComplete) return
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
    if (isRunning) return
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
