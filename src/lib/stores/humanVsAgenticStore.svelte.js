import { createPipeline } from '../simulation/createPipeline.js'
import { calculateMetrics } from '../simulation/metrics.js'
import { snapshotPipeline } from '../simulation/snapshotPipeline.js'
import { DEFAULTS } from '../simulation/defaults.js'

const DEFAULT_CONFIG = {
  teamSize: DEFAULTS.teamSize,
  humanBatchSize: 5,
  agentSpeedFactor: 0.5,
  reviewerCount: 1,
  autoReviewTime: 1,
  reviewWait: 2,
  workItemCount: 20,
  devTime: DEFAULTS.devTime,
  reviewTime: DEFAULTS.reviewTime,
  testTime: DEFAULTS.testTime,
  deployTime: DEFAULTS.deployTime,
  processTimeSpread: DEFAULTS.processTimeSpread,
  simulationSpeed: 1,
  arrivalRate: DEFAULTS.arrivalRate,
}

const buildHumanSteps = (config) => [
  {
    name: 'Development',
    processTime: config.devTime * config.humanBatchSize,
    workerCount: config.teamSize,
  },
  {
    name: 'Code Review',
    processTime: config.reviewTime * config.humanBatchSize,
    workerCount: config.teamSize,
  },
  {
    name: 'Testing',
    processTime: config.testTime * Math.ceil(config.humanBatchSize / 2),
    workerCount: config.teamSize,
  },
  {
    name: 'Deployment',
    processTime: config.deployTime,
    workerCount: config.teamSize,
  },
]

const buildAgentManualSteps = (config) => [
  {
    name: 'Development',
    processTime: Math.ceil(config.devTime * config.agentSpeedFactor),
    workerCount: config.teamSize,
  },
  {
    name: 'Code Review',
    processTime: config.reviewTime + config.reviewWait,
    workerCount: config.reviewerCount,
  },
  {
    name: 'Testing',
    processTime: config.testTime,
    workerCount: config.teamSize,
  },
  {
    name: 'Deployment',
    processTime: config.deployTime,
    workerCount: config.teamSize,
  },
]

const buildAgentAutoSteps = (config) => [
  {
    name: 'Development',
    processTime: Math.ceil(config.devTime * config.agentSpeedFactor),
    workerCount: config.teamSize,
  },
  {
    name: 'Code Review',
    processTime: config.autoReviewTime,
    workerCount: config.teamSize,
  },
  {
    name: 'Testing',
    processTime: config.testTime,
    workerCount: config.teamSize,
  },
  {
    name: 'Deployment',
    processTime: config.deployTime,
    workerCount: config.teamSize,
  },
]

function createHumanVsAgenticStore() {
  let config = $state({ ...DEFAULT_CONFIG })
  let humanPipeline = $state(null)
  let agentManualPipeline = $state(null)
  let agentAutoPipeline = $state(null)
  let humanMetrics = $state(null)
  let agentManualMetrics = $state(null)
  let agentAutoMetrics = $state(null)
  let isRunning = $state(false)
  let isComplete = $state(false)
  let intervalId = null
  let humanItemsAdded = $state(0)
  let agentItemsAdded = $state(0)
  let humanArrivalAccumulator = $state(0)
  let agentArrivalAccumulator = $state(0)

  let humanEngine = null
  let agentManualEngine = null
  let agentAutoEngine = null

  const humanItemCount = () =>
    Math.ceil(config.workItemCount / config.humanBatchSize)
  const agentItemCount = () => config.workItemCount

  const reset = () => {
    stop()

    humanEngine = createPipeline({
      steps: buildHumanSteps(config),
      processTimeSpread: config.processTimeSpread,
    })

    agentManualEngine = createPipeline({
      steps: buildAgentManualSteps(config),
      processTimeSpread: config.processTimeSpread,
    })

    agentAutoEngine = createPipeline({
      steps: buildAgentAutoSteps(config),
      processTimeSpread: config.processTimeSpread,
    })

    humanPipeline = snapshotPipeline(humanEngine)
    agentManualPipeline = snapshotPipeline(agentManualEngine)
    agentAutoPipeline = snapshotPipeline(agentAutoEngine)
    humanMetrics = calculateMetrics(humanEngine)
    agentManualMetrics = calculateMetrics(agentManualEngine)
    agentAutoMetrics = calculateMetrics(agentAutoEngine)
    isComplete = false
    humanItemsAdded = 0
    agentItemsAdded = 0
    humanArrivalAccumulator = 0
    agentArrivalAccumulator = 0
  }

  const addItems = () => {
    const humanTarget = humanItemCount()
    const agentTarget = agentItemCount()

    if (humanItemsAdded < humanTarget) {
      humanArrivalAccumulator += config.arrivalRate
      while (humanArrivalAccumulator >= 1 && humanItemsAdded < humanTarget) {
        const id = `item-${humanItemsAdded + 1}`
        humanEngine.addWorkItem({ id })
        humanItemsAdded++
        humanArrivalAccumulator--
      }
    }

    if (agentItemsAdded < agentTarget) {
      agentArrivalAccumulator += config.arrivalRate
      while (agentArrivalAccumulator >= 1 && agentItemsAdded < agentTarget) {
        const id = `item-${agentItemsAdded + 1}`
        agentManualEngine.addWorkItem({ id })
        agentAutoEngine.addWorkItem({ id })
        agentItemsAdded++
        agentArrivalAccumulator--
      }
    }
  }

  const tickOnce = () => {
    addItems()
    humanEngine.tick()
    agentManualEngine.tick()
    agentAutoEngine.tick()

    humanPipeline = snapshotPipeline(humanEngine)
    agentManualPipeline = snapshotPipeline(agentManualEngine)
    agentAutoPipeline = snapshotPipeline(agentAutoEngine)
    humanMetrics = calculateMetrics(humanEngine)
    agentManualMetrics = calculateMetrics(agentManualEngine)
    agentAutoMetrics = calculateMetrics(agentAutoEngine)

    const allDone =
      humanEngine.getCompleted().length >= humanItemCount() &&
      agentManualEngine.getCompleted().length >= agentItemCount() &&
      agentAutoEngine.getCompleted().length >= agentItemCount()

    if (allDone) {
      isComplete = true
      stop()
    }
  }

  const start = () => {
    if (intervalId || isComplete) return
    if (!humanEngine) reset()
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
    if (!humanEngine) reset()
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
    get humanPipeline() {
      return humanPipeline
    },
    get agentManualPipeline() {
      return agentManualPipeline
    },
    get agentAutoPipeline() {
      return agentAutoPipeline
    },
    get humanMetrics() {
      return humanMetrics
    },
    get agentManualMetrics() {
      return agentManualMetrics
    },
    get agentAutoMetrics() {
      return agentAutoMetrics
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

export const humanVsAgenticStore = createHumanVsAgenticStore()
