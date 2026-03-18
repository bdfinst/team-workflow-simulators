# Push vs Pull Sprint Simulator

## Context

We want a new simulator showing a team of 5 in a 2-week sprint with more work than capacity. It compares two approaches:

- **Push/Assigned**: Work items assigned to individuals at sprint start. Code review is "extra work" that takes away from personal goals, so reviews are deprioritized, creating bottlenecks.
- **Pull/Shared**: Work items pulled in priority order by the next available person. Code review is valued because it helps the team complete shared goals, so reviews flow quickly.

The key insight: **individual assignment + review-as-burden creates the same review bottleneck pattern** we see in the Human vs Agentic simulator, but the root cause is goal misalignment rather than tooling.

Source: [MinimumCD Anti-Patterns](https://migration.minimumcd.org/docs/anti-patterns/)

---

## Implementation Plan

### Step 1: Goal Document

Create `docs/goals/push-vs-pull.md` following the established format (~80 lines, 10 sections).

### Step 2: Feature Files

Create `features/simulation/push-vs-pull/` with Gherkin scenarios covering engine behavior, metrics, controls, comparison, and callouts.

### Step 3: Add Accent Color

Add `--color-accent-orange: #fb923c;` to `src/app.css` alongside the existing accent colors.

### Step 4: Store — `src/lib/stores/pushVsPullStore.svelte.js`

Follow the 2-pipeline pattern from `batchSizeStore.svelte.js`.

**Default config:**

| Parameter | Key | Default | Range | Description |
|---|---|---|---|---|
| Team Size | `teamSize` | 5 | (shared config) | Fixed team of 5 |
| Sprint Length | `sprintTicks` | 100 | 50–150 | Ticks representing a 2-week sprint |
| Work Items | `workItemCount` | 15 | 10–25 | Deliberately more than capacity |
| Dev Time | `devTime` | 4 | (shared config) | Base dev time per item |
| Review Time | `reviewTime` | 2 | (shared config) | Base review time per item |
| Test Time | `testTime` | 3 | (shared config) | Base test time per item |
| Deploy Time | `deployTime` | 1 | (shared config) | Base deploy time per item |
| Push Review Wait | `pushReviewWait` | 4 | 0–8 | Extra delay on review in push model |
| Push Reviewers | `pushReviewerCount` | 1 | 1–3 | People willing to review in push model |
| Arrival Rate | `arrivalRate` | 2 | 1–3 | High to model sprint-start loading |
| Simulation Speed | `simulationSpeed` | 1 | 0.5–4 | Playback speed |

**Two pipelines, same 4 steps (Dev → Code Review → Testing → Deploy):**

**Push pipeline** (anti-pattern):
- Code Review: `processTime: reviewTime + pushReviewWait` (6 ticks), `workerCount: pushReviewerCount` (1)
- All other steps: `workerCount: teamSize` (5)
- Uses same `createPipeline()` + review bottleneck pattern from `humanVsAgenticStore.svelte.js`

**Pull pipeline** (recommended):
- Code Review: `processTime: reviewTime` (2 ticks), `workerCount: teamSize` (5)
- All other steps: `workerCount: teamSize` (5)
- No artificial bottleneck — reviews flow at full team capacity

**Sprint time-box** (new mechanic): Simulation stops at `sprintTicks` instead of running until all items complete. This models the reality that sprints end regardless of completion status. At sprint end, WIP count = partially done items = waste.

**Rework** (optional enhancement): Small rework loop from Code Review → Dev. Push model: `maxRetries: 1` (late reviews cause rework from lost context). Pull model: `maxRetries: 0` (fast reviews, less context loss).

### Step 5: Components — `src/lib/components/push-vs-pull/`

**SprintControls.svelte** — Custom slider panel:
- Push Review Wait (0–8), Push Reviewers (1–3), Sprint Length (50–150), Work Items (10–25), Speed
- Start/Pause, Step, Reset buttons
- Follow `AgenticControls.svelte` pattern

**SprintMetrics.svelte** — 2-column metrics table:
- Columns: "Push / Assigned" vs "Pull / Shared"
- Rows: WIP Count, Avg Lead Time, Throughput, Flow Efficiency, Completed
- Sprint progress bar (current tick / sprint ticks)
- "Items Still In Progress" row — the waste metric unique to this simulator
- Queue depths per step
- Follow `MetricsDashboard.svelte` pattern

**SprintCallouts.svelte** — Educational cards:
1. **Push vs Pull Systems** (always visible) — "In a push system, work is assigned to individuals. In a pull system, the next available person pulls the highest-priority item."
2. **Review as Bottleneck** (when push review queue > 3) — "When review is 'extra work,' items pile up waiting. Each waiting item is invested effort not yet delivering value."
3. **Shared Goals vs Individual Goals** (when pull completed > push completed) — "When the team shares a completion goal, reviews get prioritized because they help everyone succeed."
4. **Partially Done = Waste** (at sprint end, push WIP > pull WIP) — "Items in progress at sprint end represent waste — effort invested with no value delivered."

### Step 6: Route — `src/routes/push-vs-pull/+page.svelte`

Follow the 2-pipeline page layout from `src/routes/unbounded-wip/+page.svelte`:
- Header with back link + title "Push vs Pull Sprints"
- Sprint completion banner (shows at `sprintTicks`)
- ConfigPanel (collapsible shared config)
- SprintControls
- Grid: 2x PipelineView (`variant="danger"` for push, `variant="success"` for pull) + sidebar with SprintMetrics + SprintCallouts

### Step 7: Home Page Entry

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

### Step 8: Quality Gates

```bash
npm test && npm run build && npm run lint
```

---

## Files to Create

| File | Purpose |
|---|---|
| `docs/goals/push-vs-pull.md` | Goal document |
| `src/lib/stores/pushVsPullStore.svelte.js` | Store with 2 pipelines |
| `src/lib/components/push-vs-pull/SprintControls.svelte` | Custom parameter sliders |
| `src/lib/components/push-vs-pull/SprintMetrics.svelte` | 2-column metrics + sprint progress |
| `src/lib/components/push-vs-pull/SprintCallouts.svelte` | Educational callout cards |
| `src/routes/push-vs-pull/+page.svelte` | Simulator page |
| `src/app.css` | Add `accent-orange` color |

## Files to Modify

| File | Change |
|---|---|
| `src/routes/+page.svelte` | Add new simulator card |
| `src/app.css` | Add `--color-accent-orange` |

## Key Patterns to Reuse

| Pattern | Source File |
|---|---|
| Review bottleneck via `workerCount` | `src/lib/stores/humanVsAgenticStore.svelte.js` |
| 2-pipeline store structure | `src/lib/stores/batchSizeStore.svelte.js` |
| Pipeline engine | `src/lib/simulation/createPipeline.js` |
| Metrics calculation | `src/lib/simulation/metrics.js` |
| Snapshot for reactivity | `src/lib/simulation/snapshotPipeline.js` |
| Custom controls pattern | `src/lib/components/human-vs-agentic/AgenticControls.svelte` |
| 2-column metrics | `src/lib/components/simulator/MetricsDashboard.svelte` |
| Callouts with `$derived` | `src/lib/components/human-vs-agentic/AgenticCallouts.svelte` |

## Verification

1. Run `npm test` — all unit tests pass
2. Run `npm run build` — static build succeeds
3. Run `npm run lint` — no lint errors
4. Manual: open `/push-vs-pull`, start simulation, verify push pipeline shows review queue buildup while pull flows smoothly
5. Manual: verify simulation stops at sprint end and shows completion counts
6. Manual: verify home page shows new card with orange accent
