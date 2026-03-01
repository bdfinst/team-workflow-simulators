import { createPipeline } from '../simulation/createPipeline.js'
import { calculateMetrics } from '../simulation/metrics.js'
import { snapshotPipeline } from '../simulation/snapshotPipeline.js'
import { DEFAULTS } from '../simulation/defaults.js'

const DEFAULT_CONFIG = {
  teamSize: DEFAULTS.teamSize,
  maxRetries: 2,
  pairOverhead: 0.15,
  contextSwitchPenalty: 0.25,
  syncWait: 1,
  asyncWait: 4,
  workItemCount: 20,
  devTime: DEFAULTS.devTime,
  reviewTime: DEFAULTS.reviewTime,
  testTime: DEFAULTS.testTime,
  deployTime: DEFAULTS.deployTime,
  processTimeSpread: DEFAULTS.processTimeSpread,
  arrivalRate: DEFAULTS.arrivalRate,
  simulationSpeed: 1,
}

const buildPairSteps = (config) => [
  {
    name: 'Develop & Review',
    processTime: Math.round(config.devTime * (1 + config.pairOverhead)),
    workerCount: Math.floor(config.teamSize / 2) || 1,
  },
  {
    name: 'Testing',
    processTime: config.testTime,
    workerCount: Infinity,
    wipLimit: Infinity,
  },
  {
    name: 'Deployment',
    processTime: config.deployTime,
    workerCount: Infinity,
    wipLimit: Infinity,
  },
]

const buildSyncSteps = (config) => [
  {
    name: 'Development',
    processTime:
      Math.round(config.devTime * (1 + config.contextSwitchPenalty)) +
      config.syncWait,
    workerCount: config.teamSize,
  },
  {
    name: 'Code Review',
    processTime: config.reviewTime + config.syncWait,
    workerCount: config.teamSize,
  },
  {
    name: 'Testing',
    processTime: config.testTime,
    workerCount: Infinity,
    wipLimit: Infinity,
  },
  {
    name: 'Deployment',
    processTime: config.deployTime,
    workerCount: Infinity,
    wipLimit: Infinity,
  },
]

const buildAsyncSteps = (config) => [
  {
    name: 'Development',
    processTime: config.devTime + config.asyncWait,
    workerCount: config.teamSize,
  },
  {
    name: 'Code Review',
    processTime: config.reviewTime + config.asyncWait,
    workerCount: 1,
  },
  {
    name: 'Testing',
    processTime: config.testTime,
    workerCount: Infinity,
    wipLimit: Infinity,
  },
  {
    name: 'Deployment',
    processTime: config.deployTime,
    workerCount: Infinity,
    wipLimit: Infinity,
  },
]

function createCodeReviewStore() {
  let config = $state({ ...DEFAULT_CONFIG })
  let pairPipeline = $state(null)
  let syncPipeline = $state(null)
  let asyncPipeline = $state(null)
  let pairMetrics = $state(null)
  let syncMetrics = $state(null)
  let asyncMetrics = $state(null)
  let isRunning = $state(false)
  let isComplete = $state(false)
  let intervalId = null
  let itemsAdded = $state(0)
  let arrivalAccumulator = $state(0)

  let pairEngine = null
  let syncEngine = null
  let asyncEngine = null

  const reset = () => {
    stop()

    pairEngine = createPipeline({
      steps: buildPairSteps(config),
      processTimeSpread: config.processTimeSpread,
      rework: { fromStep: 0, toStep: 0, maxRetries: config.maxRetries },
    })

    syncEngine = createPipeline({
      steps: buildSyncSteps(config),
      processTimeSpread: config.processTimeSpread,
      rework: { fromStep: 1, toStep: 0, maxRetries: config.maxRetries },
    })

    asyncEngine = createPipeline({
      steps: buildAsyncSteps(config),
      processTimeSpread: config.processTimeSpread,
      rework: { fromStep: 1, toStep: 0, maxRetries: config.maxRetries },
    })

    pairPipeline = snapshotPipeline(pairEngine)
    syncPipeline = snapshotPipeline(syncEngine)
    asyncPipeline = snapshotPipeline(asyncEngine)
    pairMetrics = calculateMetrics(pairEngine)
    syncMetrics = calculateMetrics(syncEngine)
    asyncMetrics = calculateMetrics(asyncEngine)
    isComplete = false
    itemsAdded = 0
    arrivalAccumulator = 0
  }

  const addItems = () => {
    if (itemsAdded >= config.workItemCount) return

    arrivalAccumulator += config.arrivalRate
    while (arrivalAccumulator >= 1 && itemsAdded < config.workItemCount) {
      const id = `item-${itemsAdded + 1}`
      pairEngine.addWorkItem({ id })
      syncEngine.addWorkItem({ id })
      asyncEngine.addWorkItem({ id })
      itemsAdded++
      arrivalAccumulator--
    }
  }

  const tickOnce = () => {
    addItems()
    pairEngine.tick()
    syncEngine.tick()
    asyncEngine.tick()

    pairPipeline = snapshotPipeline(pairEngine)
    syncPipeline = snapshotPipeline(syncEngine)
    asyncPipeline = snapshotPipeline(asyncEngine)
    pairMetrics = calculateMetrics(pairEngine)
    syncMetrics = calculateMetrics(syncEngine)
    asyncMetrics = calculateMetrics(asyncEngine)

    const allDone =
      pairEngine.getCompleted().length >= config.workItemCount &&
      syncEngine.getCompleted().length >= config.workItemCount &&
      asyncEngine.getCompleted().length >= config.workItemCount

    if (allDone) {
      isComplete = true
      stop()
    }
  }

  const start = () => {
    if (intervalId || isComplete) return
    if (!pairEngine) reset()
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
    if (!pairEngine) reset()
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
    get pairPipeline() {
      return pairPipeline
    },
    get syncPipeline() {
      return syncPipeline
    },
    get asyncPipeline() {
      return asyncPipeline
    },
    get pairMetrics() {
      return pairMetrics
    },
    get syncMetrics() {
      return syncMetrics
    },
    get asyncMetrics() {
      return asyncMetrics
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

export const codeReviewStore = createCodeReviewStore()
