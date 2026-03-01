<script>
  let { longBranchMetrics, trunkBasedMetrics, isRunning } = $props()

  let showIntegrationBottleneck = $derived(
    isRunning &&
      longBranchMetrics.wipCount > 0 &&
      longBranchMetrics.avgLeadTime > trunkBasedMetrics.avgLeadTime,
  )

  let showReworkWaste = $derived(
    isRunning &&
      longBranchMetrics.itemsCompleted > 0 &&
      longBranchMetrics.avgLeadTime > trunkBasedMetrics.avgLeadTime * 1.5,
  )
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
      class="rounded border border-accent-red/20 bg-accent-red/5 px-3 py-2"
      data-testid="callout-merge-conflict"
    >
      <h4 class="text-xs font-semibold text-accent-red">Merge Conflict Pain</h4>
      <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
        Merge difficulty grows quadratically with branch lifetime. A 7-day
        branch has ~49x the conflict potential of a 1-day branch.
      </p>
    </div>

    <div
      class="rounded border border-accent-blue/20 bg-accent-blue/5 px-3 py-2"
      data-testid="callout-continuous-integration"
    >
      <h4 class="text-xs font-semibold text-accent-blue">
        Continuous Integration
      </h4>
      <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
        Trunk-based development integrates small changes frequently. Integration
        is trivial because each change is small.
      </p>
    </div>

    {#if showIntegrationBottleneck}
      <div
        class="rounded border border-accent-amber/20 bg-accent-amber/5 px-3 py-2"
        data-testid="callout-integration-bottleneck"
      >
        <h4 class="text-xs font-semibold text-accent-amber">
          Integration Bottleneck
        </h4>
        <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
          The integration step becomes a bottleneck as branch lifetime
          increases. Long branches create expensive merge conflicts.
        </p>
      </div>
    {/if}

    {#if showReworkWaste}
      <div
        class="rounded border border-accent-purple/20 bg-accent-purple/5 px-3 py-2"
        data-testid="callout-rework-waste"
      >
        <h4 class="text-xs font-semibold text-accent-purple">Rework Waste</h4>
        <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
          Long branches create rework loops when integration fails. Developers
          must redo work that conflicted with other changes.
        </p>
      </div>
    {/if}
  </div>
</div>
