# Push vs Pull Sprint Simulator

## Context

We want a new simulator showing a team of 5 in a 2-week sprint with more work than capacity. It compares two approaches:

- **Push/Assigned**: Work items assigned to individuals at sprint start. Larger tasks, reviews take longer (lack of shared understanding + task size), developers check for pending reviews less often — creating bottlenecks.
- **Pull/Shared**: Work items pulled in priority order by the next available person. Smaller tasks, developers check for pending reviews after completing each coding task, review is fast due to shared context.

The key insight: **individual assignment + large tasks + review-as-burden creates a review bottleneck** — while shared ownership + small tasks + review-as-priority keeps work flowing.

Source: [MinimumCD Anti-Patterns](https://migration.minimumcd.org/docs/anti-patterns/)

---

## Engine Model: Per-Member Workflow

**This simulator does NOT reuse `createPipeline()`.** Instead, it uses a custom per-member engine where each team member is an independent agent moving items through states.

### Time Model

- **Sprint length**: Configurable in days (default: 10 days = 2-week sprint)
- **Multiple ticks per day**: For smooth animation (e.g., 8 ticks/day)
- **UI shows days**, not ticks — "Day 3 of 10" not "Tick 24 of 80"

### Work Item States

Each work item progresses through: `backlog` → `dev` → `review-queue` → `review` → `done`

### Team Members

5 named team members, each shown as a row. At any moment, a member is in one of these states:
- **Idle** — looking for work
- **Coding** — working on a dev task (countdown timer)
- **Reviewing** — reviewing someone else's item (countdown timer)

### Push Model Behavior

1. Items assigned to specific members at sprint start (round-robin or similar)
2. Each member works through their assigned items sequentially
3. **Larger tasks**: Dev time is higher (e.g., 1.5–2 days per item)
4. **Review check frequency**: Members only check for pending reviews every N ticks (e.g., every 2 days) — they're focused on their own assignments
5. **Review duration**: Reviews take longer because reviewer lacks context on the code (e.g., 0.75–1 day)
6. Items sit in review-queue until someone checks for reviews

### Pull Model Behavior

1. Items in a shared prioritized backlog, pulled by next available member
2. **Smaller tasks**: Dev time is lower (e.g., 0.5–1 day per item)
3. **Review check frequency**: After completing each coding task, members first check if any items are waiting for review — reviews take priority over pulling new work
4. **Review duration**: Reviews are fast because team has shared context on small changes (e.g., 0.25–0.5 day)
5. Items flow quickly through review because someone always checks soon

### Backlog

- More items than the team can complete in the sprint
- Push model: Fewer, larger items (e.g., 10 items × 2 days dev = 20 dev-days for 50 dev-day capacity)
- Pull model: More, smaller items (e.g., 25 items × 0.75 days dev = ~19 dev-days for 50 dev-day capacity)
- Total work should be roughly equivalent between models

---

## Implementation Plan

### Step 1: Goal Document

Create `docs/goals/push-vs-pull.md` following the established format.

### Step 2: Feature Files

Create `features/simulation/push-vs-pull/` with Gherkin scenarios covering engine behavior, metrics, controls, comparison, and callouts.

### Step 3: Add Accent Color

Add `--color-accent-orange: #fb923c;` to `src/app.css` alongside the existing accent colors.

### Step 4: Engine — `src/lib/simulation/pushVsPullEngine.js`

Custom engine (does NOT use `createPipeline()`). Pure JS, no Svelte deps.

**Core data structures:**

```javascript
// Team member
{ id, name, state: 'idle' | 'coding' | 'reviewing', currentItem, ticksRemaining }

// Work item
{ id, state: 'backlog' | 'dev' | 'review-queue' | 'review' | 'done', assignedTo, startTick, endTick }
```

**Factory function:**

```javascript
export const createSprintSimulation = (config) => {
  // Initialize members, backlog
  // tick() advances simulation by one tick
  // getSnapshot() returns plain data for reactive UI
  return { tick, getSnapshot, getMetrics }
}
```

**Config:**

| Parameter | Push Default | Pull Default | Description |
|---|---|---|---|
| `sprintDays` | 10 | 10 | Sprint length in days |
| `ticksPerDay` | 8 | 8 | Animation granularity |
| `teamSize` | 5 | 5 | Number of team members |
| `itemCount` | 10 | 25 | Backlog size (more than capacity) |
| `devTicks` | 12–16 | 4–8 | Ticks to complete dev work (with variability) |
| `reviewCheckInterval` | 16 | 0 | Ticks between review checks (0 = after every task) |
| `reviewTicks` | 6–8 | 2–4 | Ticks to complete a review |
| `memberNames` | ['Alex', 'Blake', 'Casey', 'Drew', 'Ellis'] | same | Display names |

### Step 5: Store — `src/lib/stores/pushVsPullStore.svelte.js`

Wraps two `createSprintSimulation` instances (push + pull). Exposes reactive snapshots, metrics, day counter.

### Step 6: Components — `src/lib/components/push-vs-pull/`

**SprintControls.svelte** — Custom slider panel:
- Sprint Length (5–15 days), Dev Time scale, Review Check Frequency, Review Duration scale, Speed
- Start/Pause, Step, Reset buttons

**SprintMetrics.svelte** — 2-column metrics table:
- Columns: "Push / Assigned" vs "Pull / Shared"
- Rows: Items Completed, Items In Progress, Avg Lead Time (days), Throughput (items/day), Flow Efficiency
- Sprint progress bar: "Day 3 of 10"

**SprintCallouts.svelte** — Educational cards:
1. **Push vs Pull Systems** (always visible) — assignment vs shared queue
2. **Review as Bottleneck** (when push review-queue > 3) — deprioritized reviews pile up
3. **Shared Goals vs Individual Goals** (when pull completed > push completed) — shared goals motivate review priority
4. **Partially Done = Waste** (at sprint end, push WIP > pull WIP) — effort with no value delivered

### Step 7: Route — `src/routes/push-vs-pull/+page.svelte`

Per-member row layout instead of pipeline columns:
- Each team member shown as a horizontal row with their name and current activity
- Items visually move through states within each member's row
- Side-by-side: Push team on left, Pull team on right

### Step 8: Home Page Entry

Add to `simulators` array in `src/routes/+page.svelte`:
```javascript
{
  href: '/push-vs-pull',
  testId: 'sim-push-vs-pull',
  title: 'Push vs Pull Sprints',
  desc: 'Assigned work vs shared queue — how review culture determines sprint outcomes.',
  accent: 'accent-orange',
}
```

### Step 9: Quality Gates

```bash
npm test && npm run build && npm run lint
```

---

## Files to Create

| File | Purpose |
|---|---|
| `docs/goals/push-vs-pull.md` | Goal document |
| `src/lib/simulation/pushVsPullEngine.js` | Custom per-member simulation engine |
| `src/lib/stores/pushVsPullStore.svelte.js` | Store wrapping two engine instances |
| `src/lib/components/push-vs-pull/SprintControls.svelte` | Custom parameter sliders |
| `src/lib/components/push-vs-pull/SprintMetrics.svelte` | 2-column metrics + sprint progress |
| `src/lib/components/push-vs-pull/SprintCallouts.svelte` | Educational callout cards |
| `src/routes/push-vs-pull/+page.svelte` | Simulator page |
| `tests/unit/simulation/pushVsPullEngine.test.js` | Unit tests for engine |

## Files to Modify

| File | Change |
|---|---|
| `src/routes/+page.svelte` | Add new simulator card |
| `src/app.css` | Add `--color-accent-orange` |

## Key Differences from Other Simulators

| Aspect | Other Simulators | This Simulator |
|---|---|---|
| Engine | `createPipeline()` | Custom `createSprintSimulation()` |
| Visualization | Pipeline columns | Per-member rows |
| Time unit | Ticks | Days (ticks hidden) |
| Work flow | Items through shared steps | Items through individual members |
| Key mechanic | WIP limits, process times | Review check frequency, task size |

## Verification

1. Run `npm test` — all unit tests pass
2. Run `npm run build` — static build succeeds
3. Run `npm run lint` — no lint errors
4. Manual: open `/push-vs-pull`, start simulation, verify per-member rows show activity
5. Manual: verify push model shows items stuck in review-queue while pull flows smoothly
6. Manual: verify sprint progress shows days ("Day 3 of 10")
7. Manual: verify home page shows new card with orange accent
