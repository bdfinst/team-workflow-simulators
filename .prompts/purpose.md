# Project Purpose

Build a library of interactive simulators that visually demonstrate workflow
anti-patterns and compare them side-by-side with the recommended patterns. The
goal is to make abstract concepts tangible — users should *see* the impact of
unbounded WIP, large batch sizes, long-lived branches, etc.

## Reference Source

Anti-patterns come from the
[MinimumCD Practice Guide](https://migration.minimumcd.org/docs/anti-patterns/).

### Priority Anti-Patterns (Start Here)

These are the most visual and simulator-friendly. Tackle them in order:

1. **Unbounded WIP** — show how WIP limits affect throughput and lead time
2. **Monolithic Work Items** — compare large vs. small batch sizes
3. **Long-Lived Feature Branches** — visualize integration pain over time
4. **Testing Only at the End** — show cost of late feedback loops
5. **Manual Deployments** — compare manual vs. automated pipeline speed

Add more from the full list as we go.

## What Each Simulator Includes

Every simulator is a standalone page that contains:

- **Animated visualization** of work items flowing through process steps
- **Side-by-side comparison** — anti-pattern on the left, recommended pattern on
  the right
- **Configurable parameters** — sliders/inputs for batch size, WIP limit, delay,
  etc.
- **Live metrics dashboard** — lead time, throughput, flow efficiency, queue
  depth
- **Educational callouts** — brief explanations of why the pattern matters

## Architecture

- **Svelte 5** with runes (`$state`, `$derived`, `$props`)
- **Tailwind CSS** for styling
- **Vitest** for unit tests
- **Playwright** for acceptance/E2E tests
- Follow all standards in `.claude/rules/`

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

1. **Document the goal** — create `docs/goals/<antipattern-name>.md` describing
   what the simulator demonstrates, its parameters, and expected metrics
2. **Review the goal document** — confirm scope before writing code
3. **Generate feature files** — use `/new-feature` to create Gherkin scenarios
4. **Review the feature file** — verify scenarios cover happy path and edge cases
5. **Implement with ATDD** — write step definitions, then implement until each
   scenario passes
6. **Code review after each green test** — run `/code-review` on changed files
7. **Fix review findings** — address all issues, verify tests still pass
8. **Commit** — once all tests pass and code review is clean

## Definition of Done (Per Simulator)

- [ ] All Gherkin scenarios pass
- [ ] Unit tests cover calculation/simulation logic (90%+)
- [ ] Code review has no open findings
- [ ] Responsive layout (works on mobile and desktop)
- [ ] Accessible (keyboard navigable, sufficient contrast, aria labels)
- [ ] `data-testid` attributes on all interactive elements
- [ ] Quality gates pass: `npm test && npm run build && npm run lint`
