<script>
  import { simulationStore } from '$lib/stores/simulationStore.svelte.js'
  import PipelineView from '$lib/components/simulator/PipelineView.svelte'
  import MetricsDashboard from '$lib/components/simulator/MetricsDashboard.svelte'
  import ParameterControls from '$lib/components/simulator/ParameterControls.svelte'
  import EducationalCallouts from '$lib/components/simulator/EducationalCallouts.svelte'

  const sim = simulationStore

  function handleConfigUpdate(key, value) {
    sim.updateConfig(key, value)
    sim.reset()
  }
</script>

<main
  class="flex h-screen flex-col bg-surface-900 p-3"
  data-testid="unbounded-wip-page"
>
  <!-- Top bar: title + nav -->
  <header class="mb-3 flex items-center gap-4">
    <a
      href="/"
      class="text-surface-400 transition-colors hover:text-surface-100"
      aria-label="Back to home"
    >
      <svg
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
    </a>
    <h1 class="text-lg font-semibold text-surface-50">
      Unbounded WIP
      <span class="font-normal text-surface-400">Simulator</span>
    </h1>

    {#if sim.isComplete}
      <div
        class="ml-auto rounded-full border border-accent-green/30 bg-accent-green/10 px-3 py-1 text-xs font-medium text-accent-green"
        role="status"
        data-testid="completion-banner"
      >
        Simulation complete
      </div>
    {/if}
  </header>

  <!-- Controls strip -->
  <ParameterControls
    config={sim.config}
    isRunning={sim.isRunning}
    onupdate={handleConfigUpdate}
    onstart={() => sim.start()}
    onstop={() => sim.stop()}
    onstep={() => sim.step()}
    onreset={() => sim.reset()}
  />

  <!-- Main content: pipelines + sidebar -->
  <div class="mt-3 grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-4">
    <!-- Pipelines -->
    <div
      class="flex min-h-0 flex-col gap-3 xl:col-span-3"
      data-testid="side-by-side"
    >
      <PipelineView
        pipeline={sim.unboundedPipeline}
        label="No WIP Limit"
        variant="danger"
      />
      <PipelineView
        pipeline={sim.wipLimitedPipeline}
        label="WIP-Limited"
        variant="success"
      />
    </div>

    <!-- Sidebar: metrics + callouts -->
    <aside class="flex min-h-0 flex-col gap-4 overflow-y-auto xl:col-span-1">
      <MetricsDashboard
        unboundedMetrics={sim.unboundedMetrics}
        wipLimitedMetrics={sim.wipLimitedMetrics}
        isComplete={sim.isComplete}
      />
      <EducationalCallouts
        unboundedMetrics={sim.unboundedMetrics}
        isRunning={sim.isRunning}
        wipLimitedPipeline={sim.wipLimitedPipeline}
      />
    </aside>
  </div>
</main>
