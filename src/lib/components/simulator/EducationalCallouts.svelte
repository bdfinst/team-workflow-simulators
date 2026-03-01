<script>
  let { unboundedMetrics, isRunning, wipLimitedPipeline } = $props()

  let showContextSwitch = $derived(
    isRunning && unboundedMetrics && unboundedMetrics.wipCount > 8,
  )

  let showSwarming = $derived(() => {
    if (!wipLimitedPipeline || !isRunning) return false
    const steps = wipLimitedPipeline.getSteps()
    return steps.some(
      (s) => s.active.length >= s.wipLimit && s.wipLimit !== Infinity,
    )
  })
</script>

<div class="space-y-3" data-testid="educational-callouts">
  <div
    class="rounded-lg border border-blue-200 bg-blue-50 p-4"
    data-testid="callout-littles-law"
  >
    <h4 class="font-semibold text-blue-800">Little's Law</h4>
    <p class="mt-1 text-sm text-blue-700">
      Lead Time = WIP / Throughput. When WIP is unconstrained, lead time grows
      unpredictably. Limiting WIP is the most direct way to control lead time.
    </p>
  </div>

  <div
    class="rounded-lg border border-purple-200 bg-purple-50 p-4"
    data-testid="callout-pull-vs-push"
  >
    <h4 class="font-semibold text-purple-800">Pull vs. Push</h4>
    <p class="mt-1 text-sm text-purple-700">
      WIP limits create a pull system — downstream steps pull work only when
      they have capacity. Without limits, work is pushed forward regardless of
      capacity, creating queues and wait time.
    </p>
  </div>

  {#if showContextSwitch}
    <div
      class="rounded-lg border border-amber-200 bg-amber-50 p-4"
      data-testid="callout-context-switching"
    >
      <h4 class="font-semibold text-amber-800">Context-Switching Cost</h4>
      <p class="mt-1 text-sm text-amber-700">
        The unbounded pipeline has {unboundedMetrics.wipCount} items in progress.
        In a real team, this means constant context-switching, reducing focus and
        increasing defects.
      </p>
    </div>
  {/if}

  {#if showSwarming()}
    <div
      class="rounded-lg border border-green-200 bg-green-50 p-4"
      data-testid="callout-swarming"
    >
      <h4 class="font-semibold text-green-800">Swarming</h4>
      <p class="mt-1 text-sm text-green-700">
        A WIP-limited step is at capacity. In a real team, idle workers would
        swarm to help finish existing work rather than starting new items.
      </p>
    </div>
  {/if}
</div>
