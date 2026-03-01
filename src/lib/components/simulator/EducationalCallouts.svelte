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

<div aria-live="polite" data-testid="educational-callouts">
  <div class="mb-2 flex items-center gap-2">
    <h3 class="text-xs font-semibold uppercase tracking-wider text-surface-400">
      Concepts
    </h3>
    <div class="h-px flex-1 bg-surface-600"></div>
  </div>

  <div class="space-y-2">
    <div
      class="rounded border border-accent-blue/20 bg-accent-blue/5 px-3 py-2"
      data-testid="callout-littles-law"
    >
      <h4 class="text-xs font-semibold text-accent-blue">Little's Law</h4>
      <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
        Lead Time = WIP / Throughput. Limiting WIP is the most direct way to
        control lead time.
      </p>
    </div>

    <div
      class="rounded border border-accent-purple/20 bg-accent-purple/5 px-3 py-2"
      data-testid="callout-pull-vs-push"
    >
      <h4 class="text-xs font-semibold text-accent-purple">Pull vs. Push</h4>
      <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
        WIP limits create a pull system — work moves forward only when there's
        capacity.
      </p>
    </div>

    {#if showContextSwitch}
      <div
        class="rounded border border-accent-amber/20 bg-accent-amber/5 px-3 py-2"
        data-testid="callout-context-switching"
      >
        <h4 class="text-xs font-semibold text-accent-amber">
          Context-Switching
        </h4>
        <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
          {unboundedMetrics.wipCount} items in progress means constant context-switching,
          reducing focus and increasing defects.
        </p>
      </div>
    {/if}

    {#if showSwarming()}
      <div
        class="rounded border border-accent-green/20 bg-accent-green/5 px-3 py-2"
        data-testid="callout-swarming"
      >
        <h4 class="text-xs font-semibold text-accent-green">Swarming</h4>
        <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
          A WIP-limited step is at capacity. Idle workers swarm to finish
          existing work rather than starting new items.
        </p>
      </div>
    {/if}
  </div>
</div>
