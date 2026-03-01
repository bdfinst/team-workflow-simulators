<script>
  import { resolveRoute } from '$app/paths'
</script>

<div class="min-h-screen bg-gray-100 p-4 md:p-8">
  <header class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900">Team Workflow Simulators</h1>
    <p class="mt-2 text-gray-600">
      Interactive simulators that visually demonstrate workflow anti-patterns
      and compare them with recommended practices.
    </p>
  </header>

  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <a
      href={resolveRoute('/unbounded-wip')}
      class="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
      data-testid="sim-unbounded-wip"
    >
      <h2 class="text-xl font-semibold text-gray-900">Unbounded WIP</h2>
      <p class="mt-2 text-sm text-gray-600">
        See how WIP limits affect throughput, lead time, and flow efficiency.
        Compare unbounded vs. WIP-limited pipelines side by side.
      </p>
      <span
        class="mt-4 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
      >
        Available
      </span>
    </a>
  </div>
</div>
