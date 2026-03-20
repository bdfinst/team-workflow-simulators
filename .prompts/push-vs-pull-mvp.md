# Push vs Pull Sprint Simulator — MVP (Minimum Visible Screen)

## Goal

Implement just enough to get a running, visible Push vs Pull simulator on screen. This covers 7 scenarios from 2 feature files. No metrics dashboard, no configurable parameters, no educational callouts — just the engine, store, page, and controls with hardcoded defaults.

## Scope: 7 Scenarios Only

### From `features/simulation/push-vs-pull/simulation-engine.feature`:

1. **Each team member is shown as an independent row** — 5 named members, each showing idle/coding/reviewing
2. **Push model assigns items to specific members at sprint start** — round-robin assignment, sequential work
3. **Pull model uses a shared backlog** — next available member pulls highest-priority item
4. **Work items progress through states** — backlog → dev → review-queue → review → done

### From `features/simulation/push-vs-pull/side-by-side-comparison.feature`:

5. **Both teams are visible side by side** — left panel "Push / Assigned", right panel "Pull / Shared"
6. **Each team shows 5 named member rows** — Alex, Blake, Casey, Drew, Ellis
7. **Member rows show current activity** — idle, coding, or reviewing with item info

### Explicitly OUT of scope (implement later):
- Metrics dashboard (no SprintMetrics.svelte)
- Educational callouts (no SprintCallouts.svelte)
- Configurable parameters beyond speed (no SprintControls.svelte — use inline Start/Pause/Step/Reset buttons only)
- Home page card registration
- Sprint completion banner
- Review timing differences beyond hardcoded defaults
- `accent-orange` CSS variable

---

## Architecture

Read `.prompts/push-vs-pull-sprint.md` for the full design. This MVP implements the subset below.

### Key Design Decision: Custom Engine, NOT `createPipeline()`

This simulator uses a **per-member engine** where each team member is an independent agent. This is fundamentally different from the pipeline-column model used by other simulators.

---

## Files to Create

### 1. Engine — `src/lib/simulation/pushVsPullEngine.js`

Pure JS, no Svelte dependencies. Factory function pattern.

```javascript
export const createSprintSimulation = (config) => {
  // Returns: { tick, getSnapshot, getMetrics, isSprintOver }
}
```

**Config (hardcoded defaults for MVP):**

| Parameter | Push Default | Pull Default |
|---|---|---|
| `sprintDays` | 10 | 10 |
| `ticksPerDay` | 8 | 8 |
| `teamSize` | 5 | 5 |
| `itemCount` | 10 | 25 |
| `devTicks` | [12, 16] | [4, 8] |
| `reviewCheckInterval` | 16 | 0 (after every task) |
| `reviewTicks` | [6, 8] | [2, 4] |
| `memberNames` | ['Alex', 'Blake', 'Casey', 'Drew', 'Ellis'] | same |

**Team member state machine:**

```
idle → coding → (check reviews?) → reviewing or idle
```

- **Push members**: Work through assigned items. Only check for pending reviews every `reviewCheckInterval` ticks. When checking, review one item if available, then return to own work.
- **Pull members**: After finishing coding, check review queue first. If items waiting, review one. Otherwise pull next from shared backlog.

**Work item states:** `backlog` → `dev` → `review-queue` → `review` → `done`

**`getSnapshot()` returns plain data:**

```javascript
{
  tick: number,
  day: number,           // Math.floor(tick / ticksPerDay) + 1
  sprintDays: number,
  isSprintOver: boolean,
  members: [
    { id, name, state: 'idle'|'coding'|'reviewing', currentItem: { id, name } | null, ticksRemaining }
  ],
  backlog: [{ id }],
  reviewQueue: [{ id }],
  completed: [{ id, startTick, endTick }],
  inProgress: [{ id, state }]
}
```

**Dev time variability:** Use `Math.floor(Math.random() * (max - min + 1)) + min` for tick ranges.

**Sprint termination:** Stop processing after `sprintDays * ticksPerDay` ticks.

### 2. Engine Tests — `tests/unit/simulation/pushVsPullEngine.test.js`

Test-first. Cover these scenarios:

```javascript
describe('createSprintSimulation', () => {
  describe('push model', () => {
    it('assigns items to specific members at start')
    it('members work through assigned items sequentially')
    it('members check for reviews every reviewCheckInterval ticks')
  })

  describe('pull model', () => {
    it('all items start in shared backlog')
    it('next available member pulls highest-priority item')
    it('members check review queue after each coding task')
  })

  describe('work item states', () => {
    it('items progress through backlog → dev → review-queue → review → done')
  })

  describe('sprint', () => {
    it('stops at configured sprint length')
    it('reports day number from tick count')
  })
})
```

### 3. Store — `src/lib/stores/pushVsPullStore.svelte.js`

Follow the pattern in `humanVsAgenticStore.svelte.js` but wrap two `createSprintSimulation` instances.

```javascript
function createPushVsPullStore() {
  let pushSnapshot = $state(null)
  let pullSnapshot = $state(null)
  let isRunning = $state(false)
  let isComplete = $state(false)
  let simulationSpeed = $state(1)

  let pushEngine = null
  let pullEngine = null
  let intervalId = null

  const reset = () => { /* init both engines with hardcoded configs */ }
  const tickOnce = () => { /* tick both, update snapshots, check sprint end */ }
  const start = () => { /* setInterval(tickOnce, 200 / simulationSpeed) */ }
  const stop = () => { /* clearInterval */ }
  const step = () => { /* single tickOnce */ }

  reset()

  return {
    get pushSnapshot() { return pushSnapshot },
    get pullSnapshot() { return pullSnapshot },
    get isRunning() { return isRunning },
    get isComplete() { return isComplete },
    get simulationSpeed() { return simulationSpeed },
    start, stop, step, reset,
    setSpeed(speed) { simulationSpeed = speed }
  }
}

export const pushVsPullStore = createPushVsPullStore()
```

### 4. Page — `src/routes/push-vs-pull/+page.svelte`

Two-panel layout with per-member rows. Inline controls (no separate controls component for MVP).

**Layout:**

```
┌─────────────────────────────────────────────────┐
│ ← Back   Push vs Pull Sprints  Simulator        │
│                                                   │
│ [Start] [Step] [Reset]     Day 3 of 10           │
│                                                   │
│ ┌──────────────────┐  ┌──────────────────┐       │
│ │ Push / Assigned   │  │ Pull / Shared    │       │
│ │                   │  │                   │       │
│ │ Alex   🔨 Item-3  │  │ Alex   👀 Item-7  │       │
│ │ Blake  💤 idle     │  │ Blake  🔨 Item-12 │       │
│ │ Casey  👀 Item-1   │  │ Casey  🔨 Item-14 │       │
│ │ Drew   🔨 Item-5  │  │ Drew   💤 idle     │       │
│ │ Ellis  🔨 Item-8  │  │ Ellis  👀 Item-9  │       │
│ │                   │  │                   │       │
│ │ Review queue: 3   │  │ Review queue: 0   │       │
│ │ Done: 2           │  │ Done: 8           │       │
│ └──────────────────┘  └──────────────────┘       │
└─────────────────────────────────────────────────┘
```

**Member row styling:**
- **Coding**: blue background highlight, show item ID
- **Reviewing**: purple background highlight, show item ID
- **Idle**: gray/muted, show "idle"

Use dark theme consistent with other simulators (`bg-surface-900`, `text-surface-*`).

**Inline controls:** Start/Pause toggle, Step, Reset — same button styling as other simulators. Include a simple day counter: "Day X of Y".

**Data test IDs:**
- `data-testid="push-vs-pull-page"`
- `data-testid="push-panel"`
- `data-testid="pull-panel"`
- `data-testid="member-row-{name}"` (on each row in each panel)
- `data-testid="day-counter"`
- `data-testid="start-button"`, `data-testid="step-button"`, `data-testid="reset-button"`

---

## Implementation Order

1. **Write engine tests** (`tests/unit/simulation/pushVsPullEngine.test.js`) — red
2. **Implement engine** (`src/lib/simulation/pushVsPullEngine.js`) — green
3. **Implement store** (`src/lib/stores/pushVsPullStore.svelte.js`)
4. **Implement page** (`src/routes/push-vs-pull/+page.svelte`)
5. **Verify**: `npm test && npm run build && npm run lint`

## Quality Gates

```bash
npm test && npm run build && npm run lint
```

All three must pass before the work is considered complete.
