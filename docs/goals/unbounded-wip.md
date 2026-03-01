# Unbounded WIP Simulator

## What This Simulator Demonstrates

Shows how Work-In-Progress (WIP) limits affect throughput, lead time, and flow
efficiency. Users see two side-by-side pipelines processing work items: one with
no WIP limit (the anti-pattern) and one with an enforced WIP limit (the
recommended pattern).

### Key Insight

Per Little's Law, cycle time = WIP / throughput. Without WIP constraints, items
pile up, context-switching increases, and delivery becomes unpredictable. With
WIP limits, the team finishes items faster, quality improves, and flow
stabilizes.

## Anti-Pattern (Left Side): No WIP Limit

- Workers start new items freely, even when existing items are unfinished
- Queues grow without bound between process steps
- Items age in progress, accumulating wait time
- Throughput is erratic

## Recommended Pattern (Right Side): WIP-Limited

- Each step has a configurable WIP limit
- When a step hits its limit, upstream steps are blocked (pull system)
- Swarming: idle workers help finish blocked items instead of starting new ones
- Steady, predictable throughput

## Process Steps (Both Sides)

The simulated value stream has these steps:

1. **Development** — process time varies per item
2. **Code Review** — shorter process time, can become a bottleneck
3. **Testing** — moderate process time
4. **Deployment** — short process time

Each step has a queue (waiting) and active slots (in progress).

## Configurable Parameters

| Parameter            | Default | Range   | Description                             |
| -------------------- | ------- | ------- | --------------------------------------- |
| WIP Limit (per step) | None/3  | 1–10    | Max items in progress at each step      |
| Work Item Count      | 20      | 5–50    | Total items to process                  |
| Process Time Spread  | ±30%    | 0–100%  | Variability in step processing time     |
| Simulation Speed     | 1x      | 0.5–4x  | Playback speed                          |
| Arrival Rate         | 1/tick  | 0.5–3   | How fast new items enter the pipeline   |

## Live Metrics Dashboard

| Metric              | What It Shows                                    |
| ------------------- | ------------------------------------------------ |
| WIP Count           | Current number of items in progress (all steps)  |
| Avg Lead Time       | Mean time from item entry to completion          |
| Throughput           | Items completed per time unit                    |
| Queue Depth (per step) | Items waiting at each step                    |
| Flow Efficiency     | Process time / lead time (percentage)            |
| Items Completed     | Running count of finished items                  |

## Educational Callouts

- **Little's Law** — explain the WIP / throughput / lead time relationship
- **Context-switching cost** — why multitasking is slower than finishing one
  thing
- **Pull vs. push** — how WIP limits create a pull system
- **Swarming** — helping finish work instead of starting new work

## Visual Design

- Work items are colored rectangles flowing left to right
- Queues shown as stacked items before each step
- Active work shown inside step boxes
- Color coding: green = flowing, amber = waiting, red = blocked/over limit
- Metrics update in real-time as the simulation runs

## Source

[MinimumCD: Unbounded WIP](https://migration.minimumcd.org/docs/anti-patterns/team-workflow/unbounded-wip)
