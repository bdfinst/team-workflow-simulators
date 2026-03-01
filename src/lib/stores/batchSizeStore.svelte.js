import { createPipeline } from '../simulation/createPipeline.js'
import { calculateMetrics } from '../simulation/metrics.js'
import { snapshotPipeline } from '../simulation/snapshotPipeline.js'
import { DEFAULTS } from '../simulation/defaults.js'

const DEFAULT_CONFIG = {
  teamSize: DEFAULTS.teamSize,
  batchMultiplier: 5,
  workItemCount: 20,
  devTime: DEFAULTS.devTime,
  reviewTime: DEFAULTS.reviewTime,
  testTime: DEFAULTS.testTime,
  deployTime: DEFAULTS.deployTime,
  processTimeSpread: DEFAULTS.processTimeSpread,
  simulationSpeed: 1,
  arrivalRate: DEFAULTS.arrivalRate,
}

const buildLargeBatchSteps = (config) => [
  { name: 'Development', processTime: config.devTime * config.batchMultiplier },
  {
    name: 'Code Review',
    processTime: config.reviewTime * config.batchMultiplier,
  },
  {
    name: 'Testing',
    processTime: config.testTime * Math.ceil(config.batchMultiplier / 2),
  },
  {
    name: 'Deployment',
    processTime: config.deployTime * Math.ceil(config.batchMultiplier / 2),
  },
]

const buildSmallBatchSteps = (config) => [
  { name: 'Development', processTime: config.devTime },
  { name: 'Code Review', processTime: config.reviewTime },
  { name: 'Testing', processTime: config.testTime },
  { name: 'Deployment', processTime: config.deployTime },
]

function createBatchSizeStore() {
  let config = $state({ ...DEFAULT_CONFIG })
  let largeBatchPipeline = $state(null)
  let smallBatchPipeline = $state(null)
  let largeBatchMetrics = $state(null)
  let smallBatchMetrics = $state(null)
  let isRunning = $state(false)
  let isComplete = $state(false)
  let intervalId = null
  let largeItemsAdded = $state(0)
  let smallItemsAdded = $state(0)
  let largeArrivalAccumulator = $state(0)
  let smallArrivalAccumulator = $state(0)

  let largeBatchEngine = null
  let smallBatchEngine = null

  const largeItemCount = () =>
    Math.ceil(config.workItemCount / config.batchMultiplier)
  const smallItemCount = () => config.workItemCount

  const reset = () => {
    stop()

    largeBatchEngine = createPipeline({
      steps: buildLargeBatchSteps(config),
      workerCount: config.teamSize,
      processTimeSpread: config.processTimeSpread,
    })

    smallBatchEngine = createPipeline({
      steps: buildSmallBatchSteps(config),
      workerCount: config.teamSize,
      processTimeSpread: config.processTimeSpread,
    })

    largeBatchPipeline = snapshotPipeline(largeBatchEngine)
    smallBatchPipeline = snapshotPipeline(smallBatchEngine)
    largeBatchMetrics = calculateMetrics(largeBatchEngine)
    smallBatchMetrics = calculateMetrics(smallBatchEngine)
    isComplete = false
    largeItemsAdded = 0
    smallItemsAdded = 0
    largeArrivalAccumulator = 0
    smallArrivalAccumulator = 0
  }

  const addItems = () => {
    const largeTarget = largeItemCount()
    const smallTarget = smallItemCount()

    if (largeItemsAdded < largeTarget) {
      largeArrivalAccumulator += config.arrivalRate
      while (largeArrivalAccumulator >= 1 && largeItemsAdded < largeTarget) {
        const id = `item-${largeItemsAdded + 1}`
        largeBatchEngine.addWorkItem({ id })
        largeItemsAdded++
        largeArrivalAccumulator--
      }
    }

    if (smallItemsAdded < smallTarget) {
      smallArrivalAccumulator += config.arrivalRate
      while (smallArrivalAccumulator >= 1 && smallItemsAdded < smallTarget) {
        const id = `item-${smallItemsAdded + 1}`
        smallBatchEngine.addWorkItem({ id })
        smallItemsAdded++
        smallArrivalAccumulator--
      }
    }
  }

  const tickOnce = () => {
    addItems()
    largeBatchEngine.tick()
    smallBatchEngine.tick()

    largeBatchPipeline = snapshotPipeline(largeBatchEngine)
    smallBatchPipeline = snapshotPipeline(smallBatchEngine)
    largeBatchMetrics = calculateMetrics(largeBatchEngine)
    smallBatchMetrics = calculateMetrics(smallBatchEngine)

    const allDone =
      largeBatchEngine.getCompleted().length >= largeItemCount() &&
      smallBatchEngine.getCompleted().length >= smallItemCount()

    if (allDone) {
      isComplete = true
      stop()
    }
  }

  const start = () => {
    if (intervalId || isComplete) return
    if (!largeBatchEngine) reset()
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
    if (!largeBatchEngine) reset()
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
    get largeBatchPipeline() {
      return largeBatchPipeline
    },
    get smallBatchPipeline() {
      return smallBatchPipeline
    },
    get largeBatchMetrics() {
      return largeBatchMetrics
    },
    get smallBatchMetrics() {
      return smallBatchMetrics
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

export const batchSizeStore = createBatchSizeStore()
