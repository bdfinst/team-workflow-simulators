<script>
  import { resolveRoute } from '$app/paths'

  const simulators = [
    {
      href: '/unbounded-wip',
      testId: 'sim-unbounded-wip',
      title: 'Unbounded WIP',
      desc: 'How WIP limits affect throughput, lead time, and flow efficiency.',
      accent: 'accent-cyan',
    },
    {
      href: '/code-review-styles',
      testId: 'sim-code-review-styles',
      title: 'Code Review Styles',
      desc: 'Pair programming vs synchronous vs async review — handoffs, wait times, rework.',
      accent: 'accent-purple',
    },
    {
      href: '/batch-size',
      testId: 'sim-batch-size',
      title: 'Monolithic Work Items',
      desc: 'Large monolithic batches vs small thin slices through the pipeline.',
      accent: 'accent-amber',
    },
    {
      href: '/late-testing',
      testId: 'sim-late-testing',
      title: 'Testing Only at End',
      desc: 'Late testing with rework loops vs shift-left — the cost of deferred feedback.',
      accent: 'accent-red',
    },
    {
      href: '/branch-lifetime',
      testId: 'sim-branch-lifetime',
      title: 'Long-Lived Branches',
      desc: 'Branch lifetime vs trunk-based development and quadratic integration cost.',
      accent: 'accent-blue',
    },
    {
      href: '/human-vs-agentic',
      testId: 'sim-human-vs-agentic',
      title: 'Human vs Agentic',
      desc: 'Agent speed alone isn\u2019t enough — the review bottleneck determines throughput.',
      accent: 'accent-green',
    },
  ]
</script>

<main
  class="flex min-h-screen flex-col items-center justify-center bg-surface-900 px-6 py-12"
>
  <div class="w-full max-w-3xl">
    <header class="mb-10">
      <p
        class="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-surface-400"
      >
        Interactive Anti-Pattern Lab
      </p>
      <h1
        class="text-4xl font-light tracking-tight text-surface-50 md:text-5xl"
      >
        Workflow
        <span class="font-semibold text-accent-cyan">Simulators</span>
      </h1>
      <p class="mt-3 max-w-lg text-sm leading-relaxed text-surface-300">
        See how anti-patterns erode team performance. Each simulator runs
        side-by-side pipelines so you can watch the difference in real time.
      </p>
    </header>

    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      {#each simulators as sim (sim.testId)}
        <a
          href={resolveRoute(sim.href)}
          class="group relative block overflow-hidden rounded-lg border border-surface-600 bg-surface-800 transition-all duration-200 hover:border-{sim.accent}/40 hover:bg-surface-700"
          data-testid={sim.testId}
        >
          <!-- Accent edge -->
          <div
            class="absolute inset-y-0 left-0 w-[3px] bg-{sim.accent}/30 transition-all duration-200 group-hover:bg-{sim.accent} group-hover:shadow-[0_0_8px_0] group-hover:shadow-{sim.accent}/40"
          ></div>

          <div class="flex items-center gap-3 px-5 py-4">
            <div class="min-w-0 flex-1">
              <h2 class="text-sm font-semibold text-surface-50">
                {sim.title}
              </h2>
              <p class="mt-1 text-xs leading-relaxed text-surface-300">
                {sim.desc}
              </p>
            </div>

            <!-- Arrow -->
            <svg
              class="h-4 w-4 shrink-0 text-surface-500 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-{sim.accent}"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </div>
        </a>
      {/each}
    </div>

    <footer class="mt-8 text-center">
      <p class="text-[11px] text-surface-500">
        Based on the
        <a
          href="https://migration.minimumcd.org/docs/anti-patterns/"
          class="underline decoration-surface-600 underline-offset-2 hover:text-surface-300"
          target="_blank"
          rel="noopener noreferrer"
        >
          MinimumCD Practice Guide
        </a>
      </p>
    </footer>
  </div>
</main>
