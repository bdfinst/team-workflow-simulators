import { createSprintSimulation } from '../simulation/pushVsPullEngine.js'

const DEFAULT_CONFIG = {
  sprintDays: 10,
  ticksPerDay: 8,
  teamSize: 5,
  pushItemCount: 10,
  pullItemCount: 25,
  pushDevTicks: [12, 16],
  pullDevTicks: [4, 8],
  pushReviewCheckInterval: 16,
  pushReviewTicks: [6, 8],
  pullReviewTicks: [2, 4],
  simulationSpeed: 1,
  memberNames: ['Alex', 'Blake', 'Casey', 'Drew', 'Ellis'],
}

function createPushVsPullStore() {
  let config = $state({ ...DEFAULT_CONFIG })
  let pushSnapshot = $state(null)
  let pullSnapshot = $state(null)
  let pushMetrics = $state(null)
  let pullMetrics = $state(null)
  let isRunning = $state(false)
  let isComplete = $state(false)

  let pushEngine = null
  let pullEngine = null
  let intervalId = null

  const nullMetrics = {
    itemsCompleted: 0,
    itemsInProgress: 0,
    avgLeadTime: 0,
    throughput: 0,
    flowEfficiency: 0,
    reviewQueueDepth: 0,
  }

  const reset = () => {
    stop()
    pushEngine = createSprintSimulation({
      sprintDays: config.sprintDays,
      ticksPerDay: config.ticksPerDay,
      teamSize: config.teamSize,
      itemCount: config.pushItemCount,
      devTicks: config.pushDevTicks,
      reviewCheckInterval: config.pushReviewCheckInterval,
      reviewTicks: config.pushReviewTicks,
      memberNames: config.memberNames,
      model: 'push',
    })
    pullEngine = createSprintSimulation({
      sprintDays: config.sprintDays,
      ticksPerDay: config.ticksPerDay,
      teamSize: config.teamSize,
      itemCount: config.pullItemCount,
      devTicks: config.pullDevTicks,
      reviewCheckInterval: 0,
      reviewTicks: config.pullReviewTicks,
      memberNames: config.memberNames,
      model: 'pull',
    })
    pushSnapshot = pushEngine.getSnapshot()
    pullSnapshot = pullEngine.getSnapshot()
    pushMetrics = { ...nullMetrics }
    pullMetrics = { ...nullMetrics }
    isComplete = false
  }

  const tickOnce = () => {
    pushEngine.tick()
    pullEngine.tick()
    pushSnapshot = pushEngine.getSnapshot()
    pullSnapshot = pullEngine.getSnapshot()
    pushMetrics = pushEngine.getMetrics()
    pullMetrics = pullEngine.getMetrics()

    if (pushEngine.isSprintOver() && pullEngine.isSprintOver()) {
      isComplete = true
      stop()
    }
  }

  const start = () => {
    if (intervalId || isComplete) return
    if (!pushEngine) reset()
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
    if (!pushEngine) reset()
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
    get pushSnapshot() {
      return pushSnapshot
    },
    get pullSnapshot() {
      return pullSnapshot
    },
    get pushMetrics() {
      return pushMetrics
    },
    get pullMetrics() {
      return pullMetrics
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

export const pushVsPullStore = createPushVsPullStore()
