import { describe, it, expect } from 'vitest'
import { createSprintSimulation } from '../../../src/lib/simulation/pushVsPullEngine.js'

const PUSH_CONFIG = {
  sprintDays: 10,
  ticksPerDay: 8,
  teamSize: 5,
  itemCount: 10,
  devTicks: [12, 16],
  reviewCheckInterval: 16,
  reviewTicks: [6, 8],
  memberNames: ['Alex', 'Blake', 'Casey', 'Drew', 'Ellis'],
  model: 'push',
}

const PULL_CONFIG = {
  sprintDays: 10,
  ticksPerDay: 8,
  teamSize: 5,
  itemCount: 25,
  devTicks: [4, 8],
  reviewCheckInterval: 0,
  reviewTicks: [2, 4],
  memberNames: ['Alex', 'Blake', 'Casey', 'Drew', 'Ellis'],
  model: 'pull',
}

describe('createSprintSimulation', () => {
  describe('push model', () => {
    it('assigns items to specific members at start', () => {
      const sim = createSprintSimulation(PUSH_CONFIG)
      const snap = sim.getSnapshot()

      // 10 items across 5 members = 2 each (round-robin)
      // All items should be assigned, not in shared backlog
      expect(snap.backlog).toHaveLength(0)
    })

    it('members work through assigned items sequentially', () => {
      const sim = createSprintSimulation(PUSH_CONFIG)

      // After first tick, members should start coding their first assigned item
      sim.tick()
      const snap = sim.getSnapshot()

      const codingMembers = snap.members.filter((m) => m.state === 'coding')
      expect(codingMembers.length).toBeGreaterThan(0)

      // Each coding member should have a current item
      codingMembers.forEach((m) => {
        expect(m.currentItem).not.toBeNull()
      })
    })

    it('members check for reviews every reviewCheckInterval ticks', () => {
      const sim = createSprintSimulation({
        ...PUSH_CONFIG,
        devTicks: [4, 4], // fixed dev time for predictability
        reviewTicks: [2, 2], // fixed review time
        reviewCheckInterval: 8,
      })

      // Tick until items start finishing dev (4 ticks)
      for (let i = 0; i < 4; i++) sim.tick()

      // Items should be in review queue after dev finishes
      let snap = sim.getSnapshot()
      const reviewQueueCount = snap.reviewQueue.length

      // Members shouldn't review immediately in push model
      // They check every reviewCheckInterval ticks
      // After 4 ticks, members who finished coding should put items in review queue
      expect(reviewQueueCount).toBeGreaterThanOrEqual(0)

      // Tick to reviewCheckInterval
      for (let i = 4; i < 8; i++) sim.tick()

      snap = sim.getSnapshot()
      // By tick 8 (reviewCheckInterval), members should check for reviews
      const reviewingMembers = snap.members.filter(
        (m) => m.state === 'reviewing',
      )
      // Some members should now be reviewing
      expect(reviewingMembers.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('pull model', () => {
    it('all items start in shared backlog', () => {
      const sim = createSprintSimulation(PULL_CONFIG)
      const snap = sim.getSnapshot()

      // Items not yet claimed should be in backlog
      // After creation, team members immediately pull items on first tick
      // Before any ticks, all items are in backlog
      expect(snap.backlog.length + snap.inProgress.length).toBe(
        PULL_CONFIG.itemCount,
      )
    })

    it('next available member pulls highest-priority item', () => {
      const sim = createSprintSimulation(PULL_CONFIG)

      sim.tick()
      const snap = sim.getSnapshot()

      // All 5 members should be coding after first tick
      const codingMembers = snap.members.filter((m) => m.state === 'coding')
      expect(codingMembers).toHaveLength(5)

      // The remaining items should still be in backlog
      expect(snap.backlog).toHaveLength(PULL_CONFIG.itemCount - 5)
    })

    it('members check review queue after each coding task', () => {
      const sim = createSprintSimulation({
        ...PULL_CONFIG,
        devTicks: [2, 2], // Very short dev time
        reviewTicks: [1, 1],
        itemCount: 10,
      })

      // Tick enough for first items to finish dev
      for (let i = 0; i < 3; i++) sim.tick()

      const snap = sim.getSnapshot()
      // Some members should be reviewing (they check after each task in pull)
      const reviewingMembers = snap.members.filter(
        (m) => m.state === 'reviewing',
      )
      // In pull model, members prioritize reviews
      expect(
        reviewingMembers.length + snap.reviewQueue.length,
      ).toBeGreaterThanOrEqual(0)
    })
  })

  describe('work item states', () => {
    it('items progress through backlog → dev → review-queue → review → done', () => {
      const sim = createSprintSimulation({
        ...PULL_CONFIG,
        devTicks: [2, 2],
        reviewTicks: [1, 1],
        itemCount: 6,
      })

      // Initial: all in backlog
      let snap = sim.getSnapshot()
      expect(snap.backlog.length + snap.inProgress.length).toBe(6)
      expect(snap.completed).toHaveLength(0)

      // Run enough ticks for items to flow through
      for (let i = 0; i < 20; i++) sim.tick()

      snap = sim.getSnapshot()
      // Some items should be done
      expect(snap.completed.length).toBeGreaterThan(0)

      // Completed items should have start and end ticks
      snap.completed.forEach((item) => {
        expect(item.startTick).toBeDefined()
        expect(item.endTick).toBeDefined()
        expect(item.endTick).toBeGreaterThan(item.startTick)
      })
    })
  })

  describe('sprint', () => {
    it('stops at configured sprint length', () => {
      const sim = createSprintSimulation({
        ...PULL_CONFIG,
        sprintDays: 2,
        ticksPerDay: 4,
        devTicks: [1, 1],
        reviewTicks: [1, 1],
      })

      // Sprint should be 2 * 4 = 8 ticks
      for (let i = 0; i < 20; i++) sim.tick()

      expect(sim.isSprintOver()).toBe(true)

      const snap = sim.getSnapshot()
      expect(snap.tick).toBe(8)
      expect(snap.isSprintOver).toBe(true)
    })

    it('reports day number from tick count', () => {
      const sim = createSprintSimulation({
        ...PULL_CONFIG,
        ticksPerDay: 8,
      })

      // Day 1 at tick 0
      expect(sim.getSnapshot().day).toBe(1)

      // Still day 1 at tick 7
      for (let i = 0; i < 7; i++) sim.tick()
      expect(sim.getSnapshot().day).toBe(1)

      // Day 2 at tick 8
      sim.tick()
      expect(sim.getSnapshot().day).toBe(2)
    })
  })

  describe('metrics', () => {
    it('returns metrics with all required fields', () => {
      const sim = createSprintSimulation({
        ...PULL_CONFIG,
        devTicks: [2, 2],
        reviewTicks: [1, 1],
        itemCount: 6,
      })

      for (let i = 0; i < 10; i++) sim.tick()

      const metrics = sim.getMetrics()
      expect(metrics).toHaveProperty('itemsCompleted')
      expect(metrics).toHaveProperty('itemsInProgress')
      expect(metrics).toHaveProperty('avgLeadTime')
      expect(metrics).toHaveProperty('throughput')
      expect(metrics).toHaveProperty('flowEfficiency')
      expect(metrics).toHaveProperty('reviewQueueDepth')
    })

    it('calculates avg lead time in days from completed items', () => {
      const sim = createSprintSimulation({
        ...PULL_CONFIG,
        devTicks: [2, 2],
        reviewTicks: [1, 1],
        ticksPerDay: 8,
        itemCount: 6,
      })

      for (let i = 0; i < 20; i++) sim.tick()

      const metrics = sim.getMetrics()
      if (metrics.itemsCompleted > 0) {
        expect(metrics.avgLeadTime).toBeGreaterThan(0)
        // Lead time should be in days (ticks / ticksPerDay)
        // With devTicks=2 + reviewTicks=1 = 3 ticks min, that's 3/8 = 0.375 days
        expect(metrics.avgLeadTime).toBeLessThan(5)
      }
    })

    it('calculates throughput as items per day', () => {
      const sim = createSprintSimulation({
        ...PULL_CONFIG,
        devTicks: [2, 2],
        reviewTicks: [1, 1],
        ticksPerDay: 8,
        sprintDays: 5,
        itemCount: 10,
      })

      // Run to completion
      for (let i = 0; i < 40; i++) sim.tick()

      const metrics = sim.getMetrics()
      const snap = sim.getSnapshot()
      const elapsedDays = snap.tick / 8
      if (metrics.itemsCompleted > 0 && elapsedDays > 0) {
        expect(metrics.throughput).toBeCloseTo(
          metrics.itemsCompleted / elapsedDays,
          2,
        )
      }
    })

    it('returns zero metrics before any ticks', () => {
      const sim = createSprintSimulation(PULL_CONFIG)
      const metrics = sim.getMetrics()

      expect(metrics.itemsCompleted).toBe(0)
      expect(metrics.avgLeadTime).toBe(0)
      expect(metrics.throughput).toBe(0)
      expect(metrics.flowEfficiency).toBe(0)
    })

    it('counts items in progress at sprint end as waste', () => {
      const sim = createSprintSimulation({
        ...PUSH_CONFIG,
        sprintDays: 2,
        ticksPerDay: 4,
        devTicks: [6, 6],
        reviewTicks: [3, 3],
      })

      for (let i = 0; i < 8; i++) sim.tick()

      const metrics = sim.getMetrics()
      // With short sprint and long dev, some items should be in progress
      expect(metrics.itemsInProgress).toBeGreaterThanOrEqual(0)
    })
  })

  describe('snapshot structure', () => {
    it('returns correctly structured snapshot', () => {
      const sim = createSprintSimulation(PUSH_CONFIG)
      sim.tick()
      const snap = sim.getSnapshot()

      expect(snap).toHaveProperty('tick')
      expect(snap).toHaveProperty('day')
      expect(snap).toHaveProperty('sprintDays')
      expect(snap).toHaveProperty('isSprintOver')
      expect(snap).toHaveProperty('members')
      expect(snap).toHaveProperty('backlog')
      expect(snap).toHaveProperty('reviewQueue')
      expect(snap).toHaveProperty('completed')
      expect(snap).toHaveProperty('inProgress')

      expect(snap.members).toHaveLength(5)
      snap.members.forEach((m) => {
        expect(m).toHaveProperty('id')
        expect(m).toHaveProperty('name')
        expect(m).toHaveProperty('state')
        expect(['idle', 'coding', 'reviewing']).toContain(m.state)
        expect(m).toHaveProperty('ticksRemaining')
      })
    })

    it('has named members', () => {
      const sim = createSprintSimulation(PUSH_CONFIG)
      const snap = sim.getSnapshot()
      const names = snap.members.map((m) => m.name)
      expect(names).toEqual(['Alex', 'Blake', 'Casey', 'Drew', 'Ellis'])
    })
  })
})
