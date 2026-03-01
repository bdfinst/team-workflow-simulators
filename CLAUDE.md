# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A library of interactive simulators that visually demonstrate workflow anti-patterns and compare them side-by-side with the recommended patterns. The goal is to make abstract concepts tangible — users should _see_ the impact of unbounded WIP, large batch sizes, long-lived branches, etc. Licensed under Apache 2.0.

## Reference Source

Anti-patterns come from the [MinimumCD Practice Guide](https://migration.minimumcd.org/docs/anti-patterns/).

### Priority Anti-Patterns (Start Here)

1. **Unbounded WIP** — show how WIP limits affect throughput and lead time
2. **Monolithic Work Items** — compare large vs. small batch sizes
3. **Long-Lived Feature Branches** — visualize integration pain over time
4. **Testing Only at the End** — show cost of late feedback loops
5. **Manual Deployments** — compare manual vs. automated pipeline speed

## What Each Simulator Includes

- **Animated visualization** of work items flowing through process steps
- **Side-by-side comparison** — anti-pattern on the left, recommended pattern on the right
- **Configurable parameters** — sliders/inputs for batch size, WIP limit, delay, etc.
- **Live metrics dashboard** — lead time, throughput, flow efficiency, queue depth
- **Educational callouts** — brief explanations of why the pattern matters

## Tech Stack

- **SvelteKit** with **Svelte 5** runes (`$state`, `$derived`, `$props`)
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin
- **Vitest** for unit tests
- **Playwright** for acceptance/E2E tests
- **ESLint** + **Prettier** (single quotes, no semicolons, 2-space indent)
- **Static adapter** (`@sveltejs/adapter-static`) — builds to `build/`
- Follow all standards in `.claude/rules/`

## Project Structure

```
src/
├── lib/
│   ├── simulation/          # Pure JS simulation engine (no Svelte deps)
│   │   ├── createPipeline.js  # Factory: pipeline with steps, WIP limits, tick()
│   │   ├── metrics.js         # calculateMetrics(pipeline) → snapshot
│   │   ├── processTime.js     # applyVariability(base, spread)
│   │   ├── snapshotPipeline.js # Create plain-data snapshot for reactive UI
│   │   ├── defaults.js        # Shared default config values (DEFAULTS)
│   │   └── thresholds.js      # WIP color thresholds (shared constants)
│   ├── stores/
│   │   ├── simulationStore.svelte.js   # Unbounded WIP: two pipelines side-by-side
│   │   └── codeReviewStore.svelte.js   # Code Review: three pipelines (pair/sync/async)
│   └── components/
│       ├── simulator/       # Shared simulator UI components
│       │   ├── PipelineView.svelte       # Step queues + active items visualization
│       │   ├── MetricsDashboard.svelte   # Side-by-side metrics table (2-column)
│       │   ├── ConfigPanel.svelte        # Collapsible shared config (team, times)
│       │   ├── ControlTooltip.svelte     # CSS-only info tooltip
│       │   ├── ParameterControls.svelte  # Simulator-specific sliders + actions
│       │   └── EducationalCallouts.svelte # Contextual learning cards
│       └── code-review/     # Code Review simulator components
│           ├── ReviewControls.svelte     # Code review-specific parameter sliders
│           ├── ReviewMetrics.svelte      # Three-column metrics table
│           └── ReviewCallouts.svelte     # Code review educational callouts
├── routes/
│   ├── +page.svelte              # Home: links to all simulators
│   ├── unbounded-wip/
│   │   └── +page.svelte          # Unbounded WIP simulator page
│   └── code-review-styles/
│       └── +page.svelte          # Code Review Styles simulator page
tests/
├── unit/simulation/         # Vitest unit tests for engine + metrics
├── e2e/                     # Playwright E2E tests
docs/
└── goals/                   # Goal documents per simulator
```

## Completed Simulators

### 1. Unbounded WIP (`/unbounded-wip`)

- **Goal doc**: `docs/goals/unbounded-wip.md`
- **Feature files**: `features/simulation/unbounded-wip/` (25 scenarios)
- **Engine**: `src/lib/simulation/` — factory-function pipeline with tick-based processing, WIP limit enforcement, process time variability
- **Store**: `simulationStore.svelte.js` — runs unbounded + WIP-limited pipelines in parallel, exposes reactive metrics
- **Unit tests**: 25 tests across 4 files (createPipeline, tick, metrics, processTime)
- **Key pattern**: Each simulator uses `createPipeline()` for its engine logic, keeping simulation pure JS and independently testable

### 2. Code Review Styles (`/code-review-styles`)

- **Goal doc**: `docs/goals/code-review-styles.md`
- **Engine**: Reuses `createPipeline()` with rework mechanics for three review approaches (pair, synchronous, async)
- **Store**: `codeReviewStore.svelte.js` — runs three pipelines in parallel with configurable wait times, context switch penalties, and pair overhead
- **Key insight**: Demonstrates how review approach impacts lead time and flow efficiency via wait times and context switching

## Setup

### Prerequisites

- Node.js installed
- The `cab-killer` repo cloned as a sibling directory (`../cab-killer/`)

### Install Code Review Plugin

```bash
../cab-killer/install.sh
```

## Workflow

For each anti-pattern simulator:

1. **Document the goal** — create `docs/goals/<antipattern-name>.md` describing what the simulator demonstrates, its parameters, and expected metrics
2. **Review the goal document** — confirm scope before writing code
3. **Generate feature files** — use `/new-feature` to create Gherkin scenarios
4. **Review the feature file** — verify scenarios cover happy path and edge cases
5. **Implement with ATDD** — write step definitions, then implement until each scenario passes
6. **Run `/frontend-design`** — apply the frontend-design skill to each new simulator page for distinctive, polished UI; apply the recommended fixes
7. **Code review after each green test** — run `/code-review` on changed files (includes `a11y-review` agent for WCAG 2.1 AA compliance)
8. **Fix review findings** — address all issues (including a11y), verify tests still pass
9. **Commit** — once all tests pass and code review is clean

## Definition of Done (Per Simulator)

- [ ] All Gherkin scenarios pass
- [ ] Unit tests cover calculation/simulation logic (90%+)
- [ ] Code review has no open findings
- [ ] Responsive layout (works on mobile and desktop)
- [ ] Accessible (keyboard navigable, sufficient contrast, aria labels)
- [ ] `data-testid` attributes on all interactive elements
- [ ] Quality gates pass: `npm test && npm run build && npm run lint`
