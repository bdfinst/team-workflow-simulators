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
  class="min-h-screen bg-gray-100 p-4 md:p-8"
  data-testid="unbounded-wip-page"
>
  <header class="mb-6">
    <h1 class="text-2xl font-bold text-gray-900 md:text-3xl">
      Unbounded WIP Simulator
    </h1>
    <p class="mt-1 text-gray-600">
      See how Work-In-Progress limits affect throughput, lead time, and flow
      efficiency.
    </p>
  </header>

  <div class="grid grid-cols-1 gap-6 xl:grid-cols-4">
    <!-- Sidebar: controls + callouts -->
    <aside class="space-y-6 xl:col-span-1">
      <ParameterControls
        config={sim.config}
        isRunning={sim.isRunning}
        onupdate={handleConfigUpdate}
        onstart={() => sim.start()}
        onstop={() => sim.stop()}
        onstep={() => sim.step()}
        onreset={() => sim.reset()}
      />

      <EducationalCallouts
        unboundedMetrics={sim.unboundedMetrics}
        isRunning={sim.isRunning}
        wipLimitedPipeline={sim.wipLimitedPipeline}
      />
    </aside>

    <!-- Main: side-by-side pipelines -->
    <div class="xl:col-span-3">
      {#if sim.isComplete}
        <div
          class="mb-4 rounded-lg border border-green-300 bg-green-50 p-3 text-center text-green-800"
          role="status"
          data-testid="completion-banner"
        >
          Simulation complete! Both pipelines have processed all work items.
        </div>
      {/if}

      <div
        class="grid grid-cols-1 gap-6 md:grid-cols-2"
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

      <!-- Metrics -->
      <div class="mt-6">
        <MetricsDashboard
          unboundedMetrics={sim.unboundedMetrics}
          wipLimitedMetrics={sim.wipLimitedMetrics}
          isComplete={sim.isComplete}
        />
      </div>
    </div>
  </div>
</main>
