import { createPipeline } from '../simulation/createPipeline.js'
import { calculateMetrics } from '../simulation/metrics.js'
import { snapshotPipeline } from '../simulation/snapshotPipeline.js'
import { DEFAULTS } from '../simulation/defaults.js'

const DEFAULT_CONFIG = {
  teamSize: DEFAULTS.teamSize,
  branchLifetime: 7,
  codeOverlap: 0.3,
  workItemCount: 20,
  devTime: DEFAULTS.devTime,
  reviewTime: DEFAULTS.reviewTime,
  testTime: DEFAULTS.testTime,
  deployTime: DEFAULTS.deployTime,
  processTimeSpread: DEFAULTS.processTimeSpread,
  simulationSpeed: 1,
  arrivalRate: DEFAULTS.arrivalRate,
}

const buildLongBranchSteps = (config) => [
  {
    name: 'Development',
    processTime: config.devTime * config.branchLifetime,
  },
  {
    name: 'Integration',
    processTime: Math.min(
      30,
      Math.round(
        1 +
          config.branchLifetime *
            config.branchLifetime *
            config.codeOverlap *
            0.3,
      ),
    ),
  },
  {
    name: 'Testing',
    processTime: config.testTime + Math.round(config.branchLifetime * 0.5),
  },
  { name: 'Deployment', processTime: config.deployTime },
]

const buildTrunkBasedSteps = (config) => [
  { name: 'Development', processTime: config.devTime },
  { name: 'Integration', processTime: 1 },
  { name: 'Testing', processTime: config.testTime },
  { name: 'Deployment', processTime: config.deployTime },
]

function createBranchLifetimeStore() {
  let config = $state({ ...DEFAULT_CONFIG })
  let longBranchPipeline = $state(null)
  let trunkBasedPipeline = $state(null)
  let longBranchMetrics = $state(null)
  let trunkBasedMetrics = $state(null)
  let isRunning = $state(false)
  let isComplete = $state(false)
  let intervalId = null
  let longItemsAdded = $state(0)
  let trunkItemsAdded = $state(0)
  let longArrivalAccumulator = $state(0)
  let trunkArrivalAccumulator = $state(0)

  let longBranchEngine = null
  let trunkBasedEngine = null

  const longItemCount = () =>
    Math.ceil(config.workItemCount / config.branchLifetime)
  const trunkItemCount = () => config.workItemCount

  const reset = () => {
    stop()

    const longReworkRetries = Math.min(
      3,
      Math.floor(config.branchLifetime * config.codeOverlap),
    )

    longBranchEngine = createPipeline({
      steps: buildLongBranchSteps(config),
      workerCount: config.teamSize,
      processTimeSpread: config.processTimeSpread,
      rework:
        longReworkRetries > 0
          ? { fromStep: 1, toStep: 0, maxRetries: longReworkRetries }
          : undefined,
    })

    trunkBasedEngine = createPipeline({
      steps: buildTrunkBasedSteps(config),
      workerCount: config.teamSize,
      processTimeSpread: config.processTimeSpread,
    })

    longBranchPipeline = snapshotPipeline(longBranchEngine)
    trunkBasedPipeline = snapshotPipeline(trunkBasedEngine)
    longBranchMetrics = calculateMetrics(longBranchEngine)
    trunkBasedMetrics = calculateMetrics(trunkBasedEngine)
    isComplete = false
    longItemsAdded = 0
    trunkItemsAdded = 0
    longArrivalAccumulator = 0
    trunkArrivalAccumulator = 0
  }

  const addItems = () => {
    const longTarget = longItemCount()
    const trunkTarget = trunkItemCount()

    if (longItemsAdded < longTarget) {
      longArrivalAccumulator += config.arrivalRate
      while (longArrivalAccumulator >= 1 && longItemsAdded < longTarget) {
        const id = `item-${longItemsAdded + 1}`
        longBranchEngine.addWorkItem({ id })
        longItemsAdded++
        longArrivalAccumulator--
      }
    }

    if (trunkItemsAdded < trunkTarget) {
      trunkArrivalAccumulator += config.arrivalRate
      while (trunkArrivalAccumulator >= 1 && trunkItemsAdded < trunkTarget) {
        const id = `item-${trunkItemsAdded + 1}`
        trunkBasedEngine.addWorkItem({ id })
        trunkItemsAdded++
        trunkArrivalAccumulator--
      }
    }
  }

  const tickOnce = () => {
    addItems()
    longBranchEngine.tick()
    trunkBasedEngine.tick()

    longBranchPipeline = snapshotPipeline(longBranchEngine)
    trunkBasedPipeline = snapshotPipeline(trunkBasedEngine)
    longBranchMetrics = calculateMetrics(longBranchEngine)
    trunkBasedMetrics = calculateMetrics(trunkBasedEngine)

    const allDone =
      longBranchEngine.getCompleted().length >= longItemCount() &&
      trunkBasedEngine.getCompleted().length >= trunkItemCount()

    if (allDone) {
      isComplete = true
      stop()
    }
  }

  const start = () => {
    if (intervalId || isComplete) return
    if (!longBranchEngine) reset()
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
    if (!longBranchEngine) reset()
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
    get longBranchPipeline() {
      return longBranchPipeline
    },
    get trunkBasedPipeline() {
      return trunkBasedPipeline
    },
    get longBranchMetrics() {
      return longBranchMetrics
    },
    get trunkBasedMetrics() {
      return trunkBasedMetrics
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

export const branchLifetimeStore = createBranchLifetimeStore()
