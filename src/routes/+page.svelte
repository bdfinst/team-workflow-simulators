<script>
  import { resolveRoute } from '$app/paths'
</script>

<main
  class="flex h-screen flex-col items-center justify-center bg-surface-900 px-6"
>
  <div class="w-full max-w-2xl text-center">
    <h1 class="text-5xl font-light tracking-tight text-surface-50 md:text-6xl">
      Workflow
      <span class="font-semibold text-accent-cyan">Simulators</span>
    </h1>
    <p class="mx-auto mt-4 max-w-md text-sm leading-relaxed text-surface-300">
      Interactive simulations that reveal how workflow anti-patterns erode team
      performance. See the difference. Change the pattern.
    </p>
  </div>

  <div class="mt-10 w-full max-w-2xl space-y-4">
    <a
      href={resolveRoute('/unbounded-wip')}
      class="group relative block rounded-lg border border-surface-600 bg-surface-800 p-6 transition-all hover:border-accent-cyan/50 hover:bg-surface-700"
      data-testid="sim-unbounded-wip"
    >
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-surface-50">Unbounded WIP</h2>
          <p class="mt-1 text-sm text-surface-300">
            See how WIP limits affect throughput, lead time, and flow
            efficiency. Compare unbounded vs. WIP-limited pipelines side by
            side.
          </p>
        </div>
        <span
          class="ml-4 shrink-0 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1 text-xs font-medium text-accent-cyan"
        >
          Available
        </span>
      </div>
      <div
        class="mt-3 flex items-center gap-1.5 text-xs font-medium text-surface-400 transition-colors group-hover:text-accent-cyan"
      >
        Launch simulator
        <svg
          class="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
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

    <a
      href={resolveRoute('/code-review-styles')}
      class="group relative block rounded-lg border border-surface-600 bg-surface-800 p-6 transition-all hover:border-accent-cyan/50 hover:bg-surface-700"
      data-testid="sim-code-review-styles"
    >
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-surface-50">
            Code Review Styles
          </h2>
          <p class="mt-1 text-sm text-surface-300">
            Compare pair programming, synchronous review, and async review. See
            how handoffs, wait times, and rework loops affect lead time.
          </p>
        </div>
        <span
          class="ml-4 shrink-0 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1 text-xs font-medium text-accent-cyan"
        >
          Available
        </span>
      </div>
      <div
        class="mt-3 flex items-center gap-1.5 text-xs font-medium text-surface-400 transition-colors group-hover:text-accent-cyan"
      >
        Launch simulator
        <svg
          class="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
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
    <a
      href={resolveRoute('/batch-size')}
      class="group relative block rounded-lg border border-surface-600 bg-surface-800 p-6 transition-all hover:border-accent-cyan/50 hover:bg-surface-700"
      data-testid="sim-batch-size"
    >
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-surface-50">
            Monolithic Work Items
          </h2>
          <p class="mt-1 text-sm text-surface-300">
            Compare large monolithic batches vs small thin slices. See how batch
            size affects lead time, throughput, and pipeline flow.
          </p>
        </div>
        <span
          class="ml-4 shrink-0 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1 text-xs font-medium text-accent-cyan"
        >
          Available
        </span>
      </div>
      <div
        class="mt-3 flex items-center gap-1.5 text-xs font-medium text-surface-400 transition-colors group-hover:text-accent-cyan"
      >
        Launch simulator
        <svg
          class="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
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

    <a
      href={resolveRoute('/late-testing')}
      class="group relative block rounded-lg border border-surface-600 bg-surface-800 p-6 transition-all hover:border-accent-cyan/50 hover:bg-surface-700"
      data-testid="sim-late-testing"
    >
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-surface-50">
            Testing Only at End
          </h2>
          <p class="mt-1 text-sm text-surface-300">
            Compare late testing with rework loops vs shift-left testing. See
            the cost of deferred feedback and how it inflates lead time.
          </p>
        </div>
        <span
          class="ml-4 shrink-0 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1 text-xs font-medium text-accent-cyan"
        >
          Available
        </span>
      </div>
      <div
        class="mt-3 flex items-center gap-1.5 text-xs font-medium text-surface-400 transition-colors group-hover:text-accent-cyan"
      >
        Launch simulator
        <svg
          class="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
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

    <a
      href={resolveRoute('/branch-lifetime')}
      class="group relative block rounded-lg border border-surface-600 bg-surface-800 p-6 transition-all hover:border-accent-cyan/50 hover:bg-surface-700"
      data-testid="sim-branch-lifetime"
    >
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-surface-50">
            Long-Lived Feature Branches
          </h2>
          <p class="mt-1 text-sm text-surface-300">
            Compare long-lived branches with merge pain vs trunk-based
            development. See how branch lifetime affects integration cost.
          </p>
        </div>
        <span
          class="ml-4 shrink-0 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1 text-xs font-medium text-accent-cyan"
        >
          Available
        </span>
      </div>
      <div
        class="mt-3 flex items-center gap-1.5 text-xs font-medium text-surface-400 transition-colors group-hover:text-accent-cyan"
      >
        Launch simulator
        <svg
          class="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
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

    <a
      href={resolveRoute('/human-vs-agentic')}
      class="group relative block rounded-lg border border-surface-600 bg-surface-800 p-6 transition-all hover:border-accent-cyan/50 hover:bg-surface-700"
      data-testid="sim-human-vs-agentic"
    >
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-surface-50">
            Human vs Agentic Development
          </h2>
          <p class="mt-1 text-sm text-surface-300">
            Compare human large-batch development, agent coding with manual
            review, and agent coding with automated review. See how the review
            bottleneck determines throughput.
          </p>
        </div>
        <span
          class="ml-4 shrink-0 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1 text-xs font-medium text-accent-cyan"
        >
          Available
        </span>
      </div>
      <div
        class="mt-3 flex items-center gap-1.5 text-xs font-medium text-surface-400 transition-colors group-hover:text-accent-cyan"
      >
        Launch simulator
        <svg
          class="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
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
  </div>

  <p class="mt-12 text-xs text-surface-500">
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
</main>
