import { createPipeline } from '../simulation/createPipeline.js'
import { calculateMetrics } from '../simulation/metrics.js'
import { snapshotPipeline } from '../simulation/snapshotPipeline.js'
import { DEFAULTS } from '../simulation/defaults.js'

const DEFAULT_CONFIG = {
  teamSize: DEFAULTS.teamSize,
  defectRate: 2,
  testFeedbackDelay: 3,
  workItemCount: 20,
  devTime: DEFAULTS.devTime,
  reviewTime: DEFAULTS.reviewTime,
  testTime: DEFAULTS.testTime,
  deployTime: DEFAULTS.deployTime,
  processTimeSpread: DEFAULTS.processTimeSpread,
  simulationSpeed: 1,
  arrivalRate: DEFAULTS.arrivalRate,
}

const buildLateTestSteps = (config) => [
  { name: 'Development', processTime: config.devTime },
  {
    name: 'Testing (End)',
    processTime: config.testTime + config.testFeedbackDelay,
  },
  { name: 'Deployment', processTime: config.deployTime },
]

const buildShiftLeftSteps = (config) => [
  {
    name: 'Dev + Test',
    processTime: config.devTime + Math.ceil(config.testTime * 0.5),
  },
  { name: 'Deployment', processTime: config.deployTime },
]

function createLateTestingStore() {
  let config = $state({ ...DEFAULT_CONFIG })
  let lateTestPipeline = $state(null)
  let shiftLeftPipeline = $state(null)
  let lateTestMetrics = $state(null)
  let shiftLeftMetrics = $state(null)
  let isRunning = $state(false)
  let isComplete = $state(false)
  let intervalId = null
  let itemsAdded = $state(0)
  let arrivalAccumulator = $state(0)

  let lateTestEngine = null
  let shiftLeftEngine = null

  const reset = () => {
    stop()

    lateTestEngine = createPipeline({
      steps: buildLateTestSteps(config),
      workerCount: config.teamSize,
      processTimeSpread: config.processTimeSpread,
      rework: {
        fromStep: 1,
        toStep: 0,
        maxRetries: config.defectRate,
      },
    })

    shiftLeftEngine = createPipeline({
      steps: buildShiftLeftSteps(config),
      workerCount: config.teamSize,
      processTimeSpread: config.processTimeSpread,
      rework: {
        fromStep: 0,
        toStep: 0,
        maxRetries: Math.max(0, config.defectRate - 1),
      },
    })

    lateTestPipeline = snapshotPipeline(lateTestEngine)
    shiftLeftPipeline = snapshotPipeline(shiftLeftEngine)
    lateTestMetrics = calculateMetrics(lateTestEngine)
    shiftLeftMetrics = calculateMetrics(shiftLeftEngine)
    isComplete = false
    itemsAdded = 0
    arrivalAccumulator = 0
  }

  const addItems = () => {
    if (itemsAdded >= config.workItemCount) return

    arrivalAccumulator += config.arrivalRate
    while (arrivalAccumulator >= 1 && itemsAdded < config.workItemCount) {
      const id = `item-${itemsAdded + 1}`
      lateTestEngine.addWorkItem({ id })
      shiftLeftEngine.addWorkItem({ id })
      itemsAdded++
      arrivalAccumulator--
    }
  }

  const tickOnce = () => {
    addItems()
    lateTestEngine.tick()
    shiftLeftEngine.tick()

    lateTestPipeline = snapshotPipeline(lateTestEngine)
    shiftLeftPipeline = snapshotPipeline(shiftLeftEngine)
    lateTestMetrics = calculateMetrics(lateTestEngine)
    shiftLeftMetrics = calculateMetrics(shiftLeftEngine)

    const allDone =
      lateTestEngine.getCompleted().length >= config.workItemCount &&
      shiftLeftEngine.getCompleted().length >= config.workItemCount

    if (allDone) {
      isComplete = true
      stop()
    }
  }

  const start = () => {
    if (intervalId || isComplete) return
    if (!lateTestEngine) reset()
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
    if (!lateTestEngine) reset()
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
    get lateTestPipeline() {
      return lateTestPipeline
    },
    get shiftLeftPipeline() {
      return shiftLeftPipeline
    },
    get lateTestMetrics() {
      return lateTestMetrics
    },
    get shiftLeftMetrics() {
      return shiftLeftMetrics
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

export const lateTestingStore = createLateTestingStore()
