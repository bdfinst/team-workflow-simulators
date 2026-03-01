<script>
  let { lateTestMetrics, shiftLeftMetrics, isRunning } = $props()

  let showReworkExplosion = $derived(
    isRunning &&
      lateTestMetrics.wipCount > 0 &&
      lateTestMetrics.avgLeadTime > shiftLeftMetrics.avgLeadTime,
  )

  let showFlowEfficiencyGap = $derived(
    isRunning &&
      shiftLeftMetrics.flowEfficiency > 0 &&
      shiftLeftMetrics.flowEfficiency > lateTestMetrics.flowEfficiency,
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
      data-testid="callout-late-feedback"
    >
      <h4 class="text-xs font-semibold text-accent-red">
        Cost of Late Feedback
      </h4>
      <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
        Defects found late cost exponentially more to fix. Developers have moved
        on to new work and must context-switch back.
      </p>
    </div>

    <div
      class="rounded border border-accent-blue/20 bg-accent-blue/5 px-3 py-2"
      data-testid="callout-shift-left"
    >
      <h4 class="text-xs font-semibold text-accent-blue">Shift-Left Testing</h4>
      <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
        Integrating testing into development catches defects immediately. The
        feedback loop is tight and rework is minimal.
      </p>
    </div>

    {#if showReworkExplosion}
      <div
        class="rounded border border-accent-amber/20 bg-accent-amber/5 px-3 py-2"
        data-testid="callout-rework-explosion"
      >
        <h4 class="text-xs font-semibold text-accent-amber">
          Rework Explosion
        </h4>
        <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
          Late-testing rework loops are clearly visible. Items bounce between
          development and testing, inflating lead time dramatically.
        </p>
      </div>
    {/if}

    {#if showFlowEfficiencyGap}
      <div
        class="rounded border border-accent-green/20 bg-accent-green/5 px-3 py-2"
        data-testid="callout-flow-efficiency-gap"
      >
        <h4 class="text-xs font-semibold text-accent-green">
          Flow Efficiency Gap
        </h4>
        <p class="mt-0.5 text-[11px] leading-snug text-surface-300">
          Shift-left testing achieves higher flow efficiency because items spend
          more time being actively worked on and less time waiting.
        </p>
      </div>
    {/if}
  </div>
</div>
