/**
 * Push vs Pull sprint simulation engine.
 * Per-member agent model — each team member is an independent state machine.
 *
 * @param {Object} config
 * @param {number} config.sprintDays
 * @param {number} config.ticksPerDay
 * @param {number} config.teamSize
 * @param {number} config.itemCount
 * @param {number[]} config.devTicks - [min, max]
 * @param {number} config.reviewCheckInterval - 0 means check after every task
 * @param {number[]} config.reviewTicks - [min, max]
 * @param {string[]} config.memberNames
 * @param {'push'|'pull'} config.model
 * @returns {{ tick: Function, getSnapshot: Function, isSprintOver: Function }}
 */
export const createSprintSimulation = (config) => {
  const {
    sprintDays,
    ticksPerDay,
    itemCount,
    devTicks,
    reviewCheckInterval,
    reviewTicks,
    memberNames,
    model,
  } = config

  const maxTicks = sprintDays * ticksPerDay

  const randomInRange = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min

  // Create work items
  const allItems = Array.from({ length: itemCount }, (_, i) => ({
    id: `item-${i + 1}`,
    name: `Item ${i + 1}`,
    state: 'backlog',
    assignedTo: null,
    startTick: null,
    endTick: null,
  }))

  // Shared queues
  let backlog = []
  let reviewQueue = []
  let completed = []

  // Per-member assigned queues (push model only)
  const memberQueues = {}

  // Create members
  const members = memberNames.map((name, i) => ({
    id: i,
    name,
    state: 'idle',
    currentItem: null,
    ticksRemaining: 0,
    ticksSinceLastReviewCheck: 0,
  }))

  // Initialize based on model
  if (model === 'push') {
    // Round-robin assignment
    allItems.forEach((item, i) => {
      const memberIdx = i % members.length
      item.assignedTo = memberIdx
      if (!memberQueues[memberIdx]) memberQueues[memberIdx] = []
      memberQueues[memberIdx].push(item)
    })
    // No shared backlog in push
    backlog = []
  } else {
    // Pull: all items in shared backlog
    backlog = [...allItems]
  }

  let currentTick = 0

  const startCoding = (member, item) => {
    member.state = 'coding'
    member.currentItem = item
    member.ticksRemaining = randomInRange(devTicks[0], devTicks[1])
    item.state = 'dev'
    if (item.startTick === null) item.startTick = currentTick
  }

  const startReviewing = (member, item) => {
    member.state = 'reviewing'
    member.currentItem = item
    member.ticksRemaining = randomInRange(reviewTicks[0], reviewTicks[1])
    item.state = 'review'
  }

  const findNextOwnItem = (member) => {
    const queue = memberQueues[member.id]
    if (!queue) return null
    return queue.find((item) => item.state === 'backlog') || null
  }

  const pullFromBacklog = () => {
    if (backlog.length === 0) return null
    return backlog.shift()
  }

  const pullFromReviewQueue = () => {
    if (reviewQueue.length === 0) return null
    return reviewQueue.shift()
  }

  const makeIdle = (member) => {
    member.state = 'idle'
    member.currentItem = null
    member.ticksRemaining = 0
  }

  const tickPush = () => {
    for (const member of members) {
      member.ticksSinceLastReviewCheck++

      if (member.state === 'coding') {
        member.ticksRemaining--
        if (member.ticksRemaining <= 0) {
          // Finished coding, put item in review queue
          const item = member.currentItem
          item.state = 'review-queue'
          reviewQueue.push(item)
          makeIdle(member)
        }
      }

      if (member.state === 'reviewing') {
        member.ticksRemaining--
        if (member.ticksRemaining <= 0) {
          // Finished reviewing
          const item = member.currentItem
          item.state = 'done'
          item.endTick = currentTick
          completed.push(item)
          makeIdle(member)
        }
      }

      if (member.state === 'idle') {
        // Check if it's time to do a review check
        const shouldCheckReviews =
          reviewCheckInterval > 0 &&
          member.ticksSinceLastReviewCheck >= reviewCheckInterval

        if (shouldCheckReviews) {
          member.ticksSinceLastReviewCheck = 0
          const reviewItem = pullFromReviewQueue()
          if (reviewItem) {
            startReviewing(member, reviewItem)
            continue
          }
        }

        // Otherwise, work on next assigned item
        const nextItem = findNextOwnItem(member)
        if (nextItem) {
          startCoding(member, nextItem)
        }
      }
    }
  }

  const tickPull = () => {
    for (const member of members) {
      if (member.state === 'coding') {
        member.ticksRemaining--
        if (member.ticksRemaining <= 0) {
          const item = member.currentItem
          item.state = 'review-queue'
          reviewQueue.push(item)
          makeIdle(member)
        }
      }

      if (member.state === 'reviewing') {
        member.ticksRemaining--
        if (member.ticksRemaining <= 0) {
          const item = member.currentItem
          item.state = 'done'
          item.endTick = currentTick
          completed.push(item)
          makeIdle(member)
        }
      }

      if (member.state === 'idle') {
        // Pull model: check review queue first
        const reviewItem = pullFromReviewQueue()
        if (reviewItem) {
          startReviewing(member, reviewItem)
          continue
        }

        // Then pull from backlog
        const nextItem = pullFromBacklog()
        if (nextItem) {
          startCoding(member, nextItem)
        }
      }
    }
  }

  const tick = () => {
    if (currentTick >= maxTicks) return

    currentTick++

    if (model === 'push') {
      tickPush()
    } else {
      tickPull()
    }
  }

  const getMetrics = () => {
    const itemsCompleted = completed.length
    const itemsInProgress = allItems.filter(
      (item) =>
        item.state === 'dev' ||
        item.state === 'review-queue' ||
        item.state === 'review',
    ).length

    const elapsedDays = currentTick / ticksPerDay

    let avgLeadTime = 0
    if (itemsCompleted > 0) {
      const totalLeadTicks = completed.reduce(
        (sum, item) => sum + (item.endTick - item.startTick),
        0,
      )
      avgLeadTime = totalLeadTicks / itemsCompleted / ticksPerDay
    }

    const throughput = elapsedDays > 0 ? itemsCompleted / elapsedDays : 0

    // Flow efficiency: ratio of active work ticks to total lead ticks
    // Approximate: dev ticks are active, review-queue wait is waste
    let flowEfficiency = 0
    if (itemsCompleted > 0) {
      const avgDevTicks = (devTicks[0] + devTicks[1]) / 2
      const avgReviewTicks = (reviewTicks[0] + reviewTicks[1]) / 2
      const avgActiveTicks = avgDevTicks + avgReviewTicks
      const totalLeadTicks = completed.reduce(
        (sum, item) => sum + (item.endTick - item.startTick),
        0,
      )
      const avgLeadTicks = totalLeadTicks / itemsCompleted
      flowEfficiency =
        avgLeadTicks > 0 ? Math.min(1, avgActiveTicks / avgLeadTicks) : 0
    }

    return {
      itemsCompleted,
      itemsInProgress,
      avgLeadTime,
      throughput,
      flowEfficiency,
      reviewQueueDepth: reviewQueue.length,
    }
  }

  const isSprintOver = () => currentTick >= maxTicks

  const getSnapshot = () => ({
    tick: currentTick,
    day: Math.floor(currentTick / ticksPerDay) + 1,
    sprintDays,
    isSprintOver: currentTick >= maxTicks,
    members: members.map((m) => ({
      id: m.id,
      name: m.name,
      state: m.state,
      currentItem: m.currentItem
        ? { id: m.currentItem.id, name: m.currentItem.name }
        : null,
      ticksRemaining: m.ticksRemaining,
    })),
    backlog: backlog.map((item) => ({ id: item.id })),
    reviewQueue: reviewQueue.map((item) => ({ id: item.id })),
    completed: completed.map((item) => ({
      id: item.id,
      startTick: item.startTick,
      endTick: item.endTick,
    })),
    inProgress: allItems
      .filter((item) => item.state === 'dev' || item.state === 'review')
      .map((item) => ({ id: item.id, state: item.state })),
  })

  // In push model, have members start coding their first item immediately
  if (model === 'push') {
    for (const member of members) {
      const nextItem = findNextOwnItem(member)
      if (nextItem) {
        startCoding(member, nextItem)
      }
    }
  }

  return { tick, getSnapshot, getMetrics, isSprintOver }
}
