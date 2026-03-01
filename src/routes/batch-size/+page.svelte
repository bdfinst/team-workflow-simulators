<script>
  import { batchSizeStore } from '$lib/stores/batchSizeStore.svelte.js'
  import PipelineView from '$lib/components/simulator/PipelineView.svelte'
  import MetricsDashboard from '$lib/components/simulator/MetricsDashboard.svelte'
  import ConfigPanel from '$lib/components/simulator/ConfigPanel.svelte'
  import BatchSizeControls from '$lib/components/batch-size/BatchSizeControls.svelte'
  import BatchSizeCallouts from '$lib/components/batch-size/BatchSizeCallouts.svelte'

  const sim = batchSizeStore

  function handleConfigUpdate(key, value) {
    sim.updateConfig(key, value)
    sim.reset()
  }
</script>

<main
  class="flex h-screen flex-col bg-surface-900 p-3"
  data-testid="batch-size-page"
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
      Monolithic Work Items
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

  <!-- Configuration panel -->
  <div class="mb-2">
    <ConfigPanel
      config={sim.config}
      isRunning={sim.isRunning}
      onupdate={handleConfigUpdate}
    />
  </div>

  <!-- Controls strip -->
  <BatchSizeControls
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
        pipeline={sim.largeBatchPipeline}
        label="Large Batches"
        variant="danger"
        isRunning={sim.isRunning}
      />
      <PipelineView
        pipeline={sim.smallBatchPipeline}
        label="Small Batches"
        variant="success"
        isRunning={sim.isRunning}
      />
    </div>

    <!-- Sidebar: metrics + callouts -->
    <aside class="flex min-h-0 flex-col gap-4 overflow-y-auto xl:col-span-1">
      <MetricsDashboard
        unboundedMetrics={sim.largeBatchMetrics}
        wipLimitedMetrics={sim.smallBatchMetrics}
        isComplete={sim.isComplete}
        leftLabel="Large Batch"
        rightLabel="Small Batch"
      />
      <BatchSizeCallouts
        largeBatchMetrics={sim.largeBatchMetrics}
        smallBatchMetrics={sim.smallBatchMetrics}
        isRunning={sim.isRunning}
      />
    </aside>
  </div>
</main>
