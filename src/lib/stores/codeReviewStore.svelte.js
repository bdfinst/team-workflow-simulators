import { createPipeline } from '../simulation/createPipeline.js'
import { calculateMetrics } from '../simulation/metrics.js'

const DEFAULT_CONFIG = {
  teamSize: 3,
  maxRetries: 2,
  pairOverhead: 0.15,
  contextSwitchPenalty: 0.25,
  asyncWait: 4,
  workItemCount: 20,
  simulationSpeed: 1,
}

const DEV_TIME = 4
const REVIEW_TIME = 2
const TEST_TIME = 3
const DEPLOY_TIME = 1
const PROCESS_TIME_SPREAD = 0.3
const ARRIVAL_RATE = 1

/**
 * Create a plain-data snapshot of a pipeline for reactive UI consumption.
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

const buildPairSteps = (config) => [
  {
    name: 'Develop & Review',
    processTime: Math.round(DEV_TIME * (1 + config.pairOverhead)),
    workerCount: Math.floor(config.teamSize / 2) || 1,
  },
  {
    name: 'Testing',
    processTime: TEST_TIME,
    workerCount: Infinity,
    wipLimit: Infinity,
  },
  {
    name: 'Deployment',
    processTime: DEPLOY_TIME,
    workerCount: Infinity,
    wipLimit: Infinity,
  },
]

const buildSyncSteps = (config) => [
  {
    name: 'Development',
    processTime: Math.round(DEV_TIME * (1 + config.contextSwitchPenalty)),
    workerCount: config.teamSize,
  },
  {
    name: 'Code Review',
    processTime: REVIEW_TIME,
    workerCount: config.teamSize,
  },
  {
    name: 'Testing',
    processTime: TEST_TIME,
    workerCount: Infinity,
    wipLimit: Infinity,
  },
  {
    name: 'Deployment',
    processTime: DEPLOY_TIME,
    workerCount: Infinity,
    wipLimit: Infinity,
  },
]

const buildAsyncSteps = (config) => [
  {
    name: 'Development',
    processTime: DEV_TIME,
    workerCount: config.teamSize,
  },
  {
    name: 'Code Review',
    processTime: REVIEW_TIME + config.asyncWait,
    workerCount: 1,
  },
  {
    name: 'Testing',
    processTime: TEST_TIME,
    workerCount: Infinity,
    wipLimit: Infinity,
  },
  {
    name: 'Deployment',
    processTime: DEPLOY_TIME,
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
      processTimeSpread: PROCESS_TIME_SPREAD,
      rework: { fromStep: 0, toStep: 0, maxRetries: config.maxRetries },
    })

    syncEngine = createPipeline({
      steps: buildSyncSteps(config),
      processTimeSpread: PROCESS_TIME_SPREAD,
      rework: { fromStep: 1, toStep: 0, maxRetries: config.maxRetries },
    })

    asyncEngine = createPipeline({
      steps: buildAsyncSteps(config),
      processTimeSpread: PROCESS_TIME_SPREAD,
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

    arrivalAccumulator += ARRIVAL_RATE
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
    if (isRunning || isComplete) return
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
